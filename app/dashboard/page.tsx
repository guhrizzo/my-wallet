"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  LogOut,
  TrendingUp,
  History,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AddTransactionModal from "@/app/components/AddTransactionModal";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: any;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false); // Estado de privacidade
  const [totals, setTotals] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const router = useRouter();

  // Carrega preferência de privacidade do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("privacy_mode");
    if (saved) setIsPrivate(saved === "true");
  }, []);

  // Salva preferência de privacidade
  const togglePrivacy = () => {
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    localStorage.setItem("privacy_mode", newValue.toString());
    toast(newValue ? "Valores ocultos" : "Valores visíveis", { icon: newValue ? <EyeOff size={16} /> : <Eye size={16} /> });
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];

        setTransactions(data);

        const inc = data
          .filter((t) => t.type === "income")
          .reduce((acc, t) => acc + t.amount, 0);

        const exp = data
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => acc + t.amount, 0);

        setTotals({ income: inc, expense: exp, balance: inc - exp });
        setIsInitialLoading(false);
      },
      () => setIsInitialLoading(false)
    );

    return () => unsubscribe();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
      toast.success("Lançamento removido!");
    } catch {
      toast.error("Erro ao excluir.");
    }
  };

  const handleLogout = () => signOut(auth).then(() => router.push("/"));

  const filteredTransactions = transactions.filter((t) =>
    filter === "all" ? true : t.type === filter
  );

  if (authLoading || isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Bem-vindo</p>
            <h1 className="font-bold text-lg text-slate-800">
              {user?.email?.split("@")[0]}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePrivacy}
              className="p-3 rounded-xl hover:bg-slate-100 text-slate-500 transition border cursor-pointer border-transparent hover:border-slate-200"
            >
              {isPrivate ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-3 rounded-xl hover:bg-red-50 text-red-500 transition border border-transparent hover:border-red-100"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* CARDS */}
        <section className="grid md:grid-cols-3 gap-6">
          <PremiumCard
            title="Saldo Total"
            value={totals.balance}
            icon={<Wallet />}
            highlight
            isPrivate={isPrivate}
          />
          <PremiumCard
            title="Entradas"
            value={totals.income}
            icon={<ArrowUpCircle />}
            color="green"
            isPrivate={isPrivate}
          />
          <PremiumCard
            title="Saídas"
            value={totals.expense}
            icon={<ArrowDownCircle />}
            color="red"
            isPrivate={isPrivate}
          />
        </section>

        {/* TRANSAÇÕES */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b">
            <h3 className="font-bold text-slate-800 flex gap-2 items-center">
              <History size={18} />
              Atividade
            </h3>

            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              {(["all", "income", "expense"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    filter === t
                      ? "bg-white shadow text-slate-900"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t === "all" ? "Tudo" : t === "income" ? "Entradas" : "Saídas"}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center text-slate-400 font-semibold"
                >
                  Nenhuma transação encontrada
                </motion.div>
              ) : (
                filteredTransactions.map((t) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={t.id}
                    className="p-5 flex justify-between items-center hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {t.type === 'income' ? <TrendingUp size={18} /> : <ArrowDownCircle size={18} />}
                       </div>
                      <div>
                        <p className="font-bold text-slate-800">{t.description}</p>
                        <p className="text-xs text-slate-400 font-medium">
                          {t.date?.seconds
                            ? new Date(t.date.seconds * 1000).toLocaleDateString("pt-BR")
                            : "..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`font-black text-lg ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {t.type === "income" ? "+" : "-"} 
                        {isPrivate ? " R$ ••••" : ` R$ ${t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                      </span>

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 transition text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-5 rounded-2xl shadow-2xl shadow-blue-200 z-50"
      >
        <Plus size={28} />
      </motion.button>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

function PremiumCard({ title, value, icon, color, highlight, isPrivate }: any) {
  const colorMap: any = {
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-8 rounded-4xl border ${
        highlight
          ? "bg-slate-900 text-white border-transparent shadow-2xl shadow-slate-200"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <div className="flex justify-between mb-6">
        <span className={`text-xs font-bold uppercase tracking-widest ${highlight ? "opacity-50" : "text-slate-400"}`}>
          {title}
        </span>
        <div className={highlight ? "text-blue-400" : "opacity-20"}>{icon}</div>
      </div>

      <h2 className={`text-3xl font-black tracking-tight ${!highlight ? colorMap[color] : ""}`}>
        {isPrivate ? "R$ ••••" : `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
      </h2>
    </motion.div>
  );
}