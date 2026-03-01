"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CheckCircle2, ShieldCheck, XCircle, Clock, Calendar, Hash } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PublicVerification() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Verificando autenticidade...</div>;

  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Documento Inválido</h1>
          <p className="text-slate-500 mt-2">Esta transação não foi encontrada em nossa base de dados oficial.</p>
        </div>
      </div>
    );
  }

  const isIncome = transaction.type === "income";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* Banner de Status */}
        <div className={`p-6 text-center ${isIncome ? "bg-green-500" : "bg-blue-800"} text-white`}>
          <ShieldCheck size={48} className="mx-auto mb-2 opacity-90" />
          <h2 className="text-xl font-bold">Transação Autêntica</h2>
          <p className="text-sm opacity-80">Verificado via FinanceApp</p>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Valor da Operação</span>
            <div className="text-4xl font-black text-slate-900 mt-1">
              R$ {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="space-y-4">
            <InfoRow icon={<CheckCircle2 size={18} className="text-green-500" />} label="Status" value="Confirmada" />
            <InfoRow icon={<Calendar size={18} />} label="Data" value={format(transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date), "dd/MM/yyyy")} />
            <InfoRow icon={<Clock size={18} />} label="Horário" value={format(transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date), "HH:mm")} />
            <InfoRow icon={<Hash size={18} />} label="ID de Autenticação" value={transaction.id.toUpperCase().slice(0, 12)} />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Este registro foi consultado em tempo real em nosso banco de dados seguro. 
              O FinanceApp garante a integridade desta informação conforme registrada em sistema.
            </p>
            <div className="mt-4 text-blue-600 font-bold text-sm">
              wallet.gustavorizzo.net.br
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-800">{value}</span>
    </div>
  );
}