


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
    Timestamp,
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
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon
} from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AddTransactionModal from "@/app/components/AddTransactionModal";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    format,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    date: any;
}

export default function DashboardClient() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // ESTADOS
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
    const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

    // 1. EFEITO PARA CARREGAR PREFERÊNCIA (Fix para Vercel/SSR)
    useEffect(() => {
        const saved = localStorage.getItem("privacy_mode");
        if (saved === "true") setIsPrivate(true);
    }, []);

    // 2. REDIRECIONAMENTO SE NÃO LOGADO
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    // 3. BUSCA DE DADOS (FIREBASE)
    useEffect(() => {
        if (authLoading || !user) return;

        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        const q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            where("date", ">=", Timestamp.fromDate(start)),
            where("date", "<=", Timestamp.fromDate(end)),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
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
        }, (error) => {
            console.error("Erro no Firebase:", error);
            setIsInitialLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, currentDate]);

    // AÇÕES
    const togglePrivacy = () => {
        const newValue = !isPrivate;
        setIsPrivate(newValue);
        localStorage.setItem("privacy_mode", newValue.toString());
        toast.success(newValue ? "Valores ocultos" : "Valores visíveis");
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "transactions", id));
            toast.success("Removido com sucesso");
        } catch {
            toast.error("Erro ao excluir");
        }
    };

    const handleLogout = () => signOut(auth).then(() => router.push("/"));

    const filteredTransactions = transactions.filter((t) =>
        filter === "all" ? true : t.type === filter
    );

    if (authLoading || isInitialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24 antialiased selection:bg-blue-100">

            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bem-vindo</p>
                        <h1 className="font-bold text-lg text-slate-800 leading-tight">
                            {user?.email?.split("@")[0]}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={togglePrivacy}
                            className="p-3 rounded-2xl hover:bg-slate-100 text-slate-500 transition-all cursor-pointer border border-transparent active:scale-95"
                        >
                            {isPrivate ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-3 rounded-2xl hover:bg-red-50 text-red-500 cursor-pointer transition-all border border-transparent active:scale-95"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-6">


                <section className="bg-white rounded-4xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer text-slate-400 active:scale-90"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <CalendarIcon size={20} />
                        </div>
                        <span className="font-black text-slate-800 text-base md:text-lg capitalize tracking-tight">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </span>
                    </div>

                    <button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer text-slate-400 active:scale-90"
                    >
                        <ChevronRight size={24} />
                    </button>
                </section>


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


                <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-slate-50">
                        <h3 className="font-black text-slate-800 flex gap-2 items-center tracking-tight">
                            <History size={20} className="text-blue-600" />
                            Atividade do Mês
                        </h3>

                        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
                            {(["all", "income", "expense"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${filter === t
                                            ? "bg-white shadow-sm text-slate-900"
                                            : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {t === "all" ? "Tudo" : t === "income" ? "Ganhos" : "Gastos"}
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
                                    className="py-24 text-center flex flex-col items-center gap-4"
                                >
                                    <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                                        <History size={48} />
                                    </div>
                                    <p className="text-slate-400 font-bold text-lg tracking-tight">Nenhuma movimentação aqui.</p>
                                </motion.div>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        key={t.id}
                                        className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`p-4 rounded-2xl border ${t.type === 'income' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {t.type === 'income' ? <TrendingUp size={20} /> : <ArrowDownCircle size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 tracking-tight">{t.description}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                                    {t.date?.seconds
                                                        ? format(new Date(t.date.seconds * 1000), "dd 'de' MMMM", { locale: ptBR })
                                                        : "Processando..."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <span className={`font-black text-lg tracking-tighter ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                                {t.type === "income" ? "+" : "-"}
                                                {isPrivate ? " R$ ••••" : ` R$ ${t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                                            </span>

                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl active:scale-90"
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


            <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-10 right-10 bg-blue-600 text-white p-5 rounded-4xl shadow-2xl shadow-blue-200 z-50 cursor-pointer flex items-center justify-center active:bg-blue-700 transition-colors"
            >
                <Plus size={32} strokeWidth={3} />
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
            whileHover={{ y: -6 }}
            className={`p-8 rounded-[2.5rem] border transition-all ${highlight
                    ? "bg-slate-900 text-white border-transparent shadow-2xl shadow-slate-300"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
        >
            <div className="flex justify-between mb-8 items-start">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${highlight ? "opacity-50" : "text-slate-400"}`}>
                    {title}
                </span>
                <div className={`p-2 rounded-xl ${highlight ? "bg-white/10 text-blue-400" : "bg-slate-50 text-slate-400 opacity-40"}`}>
                    {icon}
                </div>
            </div>

            <h2 className={`text-3xl font-black tracking-tighter ${!highlight ? colorMap[color] : ""}`}>
                {isPrivate ? "R$ ••••" : `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </h2>
        </motion.div>
    );
}