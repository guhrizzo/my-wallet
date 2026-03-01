"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  Tag,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  FileText,
  Download,
  AlignLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import QRCode from "qrcode";

// Interface para resolver erros de TypeScript
interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  type: "income" | "expense";
  category?: string;
  notes?: string;
  date: any;
}

export default function TransactionDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "transactions", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTransaction({ id: docSnap.id, ...docSnap.data() } as Transaction);
        }
      } catch (error) {
        console.error("Erro ao buscar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  const getSafeDate = (dateField: any): Date => {
    if (!dateField) return new Date();
    if (dateField?.seconds) return new Date(dateField.seconds * 1000);
    if (dateField?.toDate) return dateField.toDate();
    return new Date(dateField);
  };

  const safeDate = transaction ? getSafeDate(transaction.date) : new Date();

  const handleDownloadPDF = async () => {
    if (!transaction) return;
    setIsExporting(true);

    try {
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const t = transaction;
      const isIncome = t.type === "income";
      
      // CONFIGURAÇÃO DE CORES (Azul e Branco)
      const azulPrimario = "#1E40AF"; // blue-800
      const azulClaro = "#EFF6FF";    // blue-50
      const textoEscuro = "#1E293B";  // slate-800
      const textoCinza = "#64748B";   // slate-500

      // URL PARA QR CODE (Apontando para seu domínio)
      const baseUrl = "https://wallet.gustavorizzo.net.br";
      const verificationUrl = `https://wallet.gustavorizzo.net.br/transaction/${transaction.id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
        color: { dark: azulPrimario, light: "#ffffff" }
      });

      // ===== HEADER AZUL =====
      pdf.setFillColor(azulPrimario);
      pdf.rect(0, 0, 210, 50, "F");
      pdf.setTextColor("#FFFFFF");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("FinanceApp", 20, 25);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("COMPROVANTE DIGITAL DE OPERAÇÃO", 20, 32);

      // ===== CARD BRANCO CENTRAL =====
      pdf.setFillColor("#FFFFFF");
      pdf.roundedRect(15, 42, 180, 235, 4, 4, "F");

      // Status Badge
      const statusColor = isIncome ? "#16A34A" : "#DC2626";
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(statusColor);
      pdf.text(isIncome ? "ENTRADA CONFIRMADA" : "SAÍDA CONFIRMADA", 25, 55);

      // Valor
      pdf.setTextColor(textoEscuro);
      pdf.setFontSize(36);
      const valorFormatado = `R$ ${Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      pdf.text(valorFormatado, 25, 75);

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(textoCinza);
      pdf.text(t.description || "Transação sem título", 25, 85);

      // Linha Divisória
      pdf.setDrawColor("#E2E8F0");
      pdf.line(25, 95, 185, 95);

      // Grid de Informações
      const drawInfo = (label: string, value: string, x: number, y: number) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(textoCinza);
        pdf.text(label.toUpperCase(), x, y);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(textoEscuro);
        pdf.text(value, x, y + 6);
      };

      drawInfo("Data", format(safeDate, "dd/MM/yyyy"), 25, 110);
      drawInfo("Horário", format(safeDate, "HH:mm:ss"), 110, 110);
      drawInfo("Categoria", t.category || "Geral", 25, 130);
      drawInfo("Autenticação", t.id.toUpperCase(), 110, 130);

      // ===== ÁREA DO QR CODE =====
      pdf.setFillColor(azulClaro);
      pdf.roundedRect(25, 150, 160, 45, 3, 3, "F");
      pdf.addImage(qrCodeDataUrl, "PNG", 30, 155, 35, 35);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(azulPrimario);
      pdf.text("Validação de Segurança", 72, 165);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(textoEscuro);
      pdf.text("Escaneie para validar a autenticidade", 72, 171);
      pdf.text(verificationUrl, 72, 176);

      // Observações
      if (t.notes) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(textoCinza);
        pdf.text("OBSERVAÇÕES", 25, 215);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(textoEscuro);
        const splitNotes = pdf.splitTextToSize(t.notes, 150);
        pdf.text(splitNotes, 25, 222);
      }

      // Rodapé
      pdf.setFontSize(7);
      pdf.setTextColor("#94A3B8");
      pdf.text("Este documento é um comprovante oficial gerado eletronicamente.", 105, 270, { align: "center" });

      pdf.save(`Comprovante_${t.id.slice(0, 6)}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!transaction) return <div className="p-10 text-center">Não encontrada.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 cursor-pointer font-bold hover:text-slate-800">
            <ChevronLeft size={20} /> Voltar
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 active:scale-95 disabled:opacity-50 cursor-pointer transition-all shadow-md"
          >
            {isExporting ? "Gerando..." : <><Download size={18} /> Exportar PDF</>}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}>
                {transaction.type === "income" ? "Entrada de Recurso" : "Saída de Recurso"}
              </span>
              <h1 className="text-3xl font-black text-slate-900 mt-4">{transaction.description}</h1>
            </div>
            <div className={`p-4 rounded-2xl ${transaction.type === "income" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              {transaction.type === "income" ? <ArrowUpCircle size={32} /> : <ArrowDownCircle size={32} />}
            </div>
          </div>

          <div className="text-5xl font-black text-slate-900 mb-10 tracking-tighter">
            R$ {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <DetailItem icon={<Calendar size={18} />} label="Data" value={format(safeDate, "dd 'de' MMMM, yyyy", { locale: ptBR })} />
            <DetailItem icon={<Clock size={18} />} label="Horário" value={format(safeDate, "HH:mm'h'")} />
            <DetailItem icon={<Tag size={18} />} label="Categoria" value={transaction.category || "Geral"} />
            <DetailItem icon={<FileText size={18} />} label="ID" value={transaction.id.toUpperCase()} />
          </div>

          {transaction.notes && (
            <div className="mt-8 pt-8 border-t border-slate-100 flex items-start gap-4">
              <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"><AlignLeft size={18} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Observações</p>
                <p className="text-slate-600 mt-1">{transaction.notes}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
        <p className="text-slate-700 font-bold">{value}</p>
      </div>
    </div>
  );
}