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

export default function TransactionDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // 🔥 BUSCAR DADOS
    useEffect(() => {
        const fetchTransaction = async () => {
            if (!id) return;

            const docRef = doc(db, "transactions", id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setTransaction({ id: docSnap.id, ...docSnap.data() });
            }

            setLoading(false);
        };

        fetchTransaction();
    }, [id]);

    // 🧠 DATA BLINDADA (Firestore safe)
    const getSafeDate = (dateField: any) => {
        if (!dateField) return new Date();
        if (dateField?.seconds) return new Date(dateField.seconds * 1000);
        if (dateField?.toDate) return dateField.toDate();
        return new Date(dateField);
    };

    const safeDate = transaction ? getSafeDate(transaction.date) : new Date();

    // 🏦 PDF NÍVEL BANCO

    const handleDownloadPDF = async () => {
        if (!transaction) return;

        setIsExporting(true);

        try {
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4",
            });

            const safeDate = getSafeDate(transaction.date);
            const isIncome = transaction.type === "income";

            // ===== HEADER =====
            pdf.setFillColor(15, 23, 42); // slate-900
            pdf.rect(0, 0, 210, 35, "F");

            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(16);
            pdf.text("COMPROVANTE DE TRANSAÇÃO", 105, 18, { align: "center" });

            // ===== STATUS BADGE =====
            pdf.setTextColor(isIncome ? 22 : 220, isIncome ? 163 : 38, isIncome ? 74 : 38);
            pdf.setFontSize(11);
            pdf.text(
                isIncome ? "ENTRADA DE RECURSO" : "SAÍDA DE RECURSO",
                20,
                50
            );

            // ===== DESCRIÇÃO =====
            pdf.setTextColor(15, 23, 42);
            pdf.setFontSize(20);
            pdf.setFont("helvetica", "bold");
            pdf.text(transaction.description || "-", 20, 65);

            // ===== VALOR GRANDE =====
            pdf.setFontSize(28);
            pdf.setTextColor(isIncome ? 22 : 220, isIncome ? 163 : 38, isIncome ? 74 : 38);

            const amountFormatted = Number(transaction.amount || 0).toLocaleString(
                "pt-BR",
                { minimumFractionDigits: 2 }
            );

            pdf.text(`R$ ${amountFormatted}`, 20, 85);

            // ===== LINHA DIVISÓRIA =====
            pdf.setDrawColor(230, 230, 230);
            pdf.line(20, 95, 190, 95);

            // ===== DETALHES =====
            pdf.setFontSize(11);
            pdf.setTextColor(100);

            const startY = 110;
            const lineGap = 10;

            const details = [
                ["Data", format(safeDate, "dd/MM/yyyy")],
                ["Horário", format(safeDate, "HH:mm")],
                ["Categoria", transaction.category || "Geral"],
                ["Autenticação", `#${transaction.id?.toUpperCase()}`],
            ];

            pdf.setFont("helvetica", "bold");

            details.forEach((item, index) => {
                const y = startY + index * lineGap;

                pdf.setTextColor(120);
                pdf.text(item[0].toUpperCase(), 20, y);

                pdf.setTextColor(20);
                pdf.setFont("helvetica", "normal");
                pdf.text(String(item[1]), 80, y);

                pdf.setFont("helvetica", "bold");
            });

            // ===== OBSERVAÇÕES =====
            if (transaction.notes) {
                pdf.setDrawColor(230, 230, 230);
                pdf.line(20, startY + details.length * lineGap + 5, 190, startY + details.length * lineGap + 5);

                pdf.setTextColor(120);
                pdf.setFontSize(11);
                pdf.text("OBSERVAÇÕES", 20, startY + details.length * lineGap + 18);

                pdf.setTextColor(30);
                pdf.setFont("helvetica", "normal");

                const splitNotes = pdf.splitTextToSize(
                    transaction.notes,
                    170
                );

                pdf.text(splitNotes, 20, startY + details.length * lineGap + 28);
            }

            // ===== RODAPÉ =====
            pdf.setFontSize(8);
            pdf.setTextColor(160);
            pdf.text(
                "Comprovante gerado via FinanceApp",
                105,
                285,
                { align: "center" }
            );

            pdf.save(`comprovante-${transaction.id.slice(0, 6)}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (loading)
        return <div className="p-10 text-center">Carregando detalhes...</div>;

    if (!transaction)
        return <div className="p-10 text-center">Transação não encontrada.</div>;

    const isIncome = transaction.type === "income";

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-bold"
                    >
                        <ChevronLeft size={20} /> Voltar
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                        {isExporting ? "Gerando..." : <><Download size={18} /> Salvar PDF</>}
                    </button>
                </div>

                {/* 📄 CARD PDF */}
                <motion.div
                    id="pdf-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isIncome
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                            >
                                {isIncome ? "Entrada de Recurso" : "Saída de Recurso"}
                            </span>

                            <h1 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">
                                {transaction.description}
                            </h1>
                        </div>

                        <div
                            className={`p-4 rounded-2xl ${isIncome
                                    ? "bg-green-50 text-green-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                        >
                            {isIncome ? (
                                <ArrowUpCircle size={32} />
                            ) : (
                                <ArrowDownCircle size={32} />
                            )}
                        </div>
                    </div>

                    <div className="text-5xl font-black text-slate-900 mb-10 tracking-tighter">
                        R$ {Number(transaction.amount).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                        })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                        <DetailItem
                            icon={<Calendar size={18} />}
                            label="Data da Operação"
                            value={format(
                                safeDate,
                                "dd 'de' MMMM 'de' yyyy",
                                { locale: ptBR }
                            )}
                        />

                        <DetailItem
                            icon={<Clock size={18} />}
                            label="Horário"
                            value={format(safeDate, "HH:mm'h'")}
                        />

                        <DetailItem
                            icon={<Tag size={18} />}
                            label="Categoria"
                            value={transaction.category || "Geral"}
                        />

                        <DetailItem
                            icon={<FileText size={18} />}
                            label="Autenticação"
                            value={`#${transaction.id.toUpperCase()}`}
                        />
                    </div>

                    {transaction.notes && (
                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                                    <AlignLeft size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Observações
                                    </p>
                                    <p className="text-slate-600 mt-1 leading-relaxed">
                                        {transaction.notes}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 pt-6 border-t border-slate-100 text-center">
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                            Comprovante Gerado via FinanceApp
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function DetailItem({ icon, label, value }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {label}
                </p>
                <p className="text-slate-700 font-bold">{value}</p>
            </div>
        </div>
    );
}