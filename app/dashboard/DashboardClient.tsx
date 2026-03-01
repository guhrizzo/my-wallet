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
import { useRouter } from "next/navigation"; // Importado para navegação
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

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
    const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

    useEffect(() => {
        const saved = localStorage.getItem("privacy_mode");
        if (saved === "true") setIsPrivate(true);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

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
        <div className="min-h-screen bg-slate-50 pb-32 antialiased selection:bg-blue-100">
            {/* Header: Ajuste de padding no mobile */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Finanças de</p>
                        <h1 className="font-bold text-base md:text-lg text-slate-800 leading-tight truncate max-w-37.5">
                            {user?.email?.split("@")[0]}
                        </h1>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        <button onClick={togglePrivacy} className="p-2.5 md:p-3 rounded-xl md:rounded-2xl hover:bg-slate-100 text-slate-500 transition-all cursor-pointer">
                            {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={handleLogout} className="p-2.5 md:p-3 rounded-xl md:rounded-2xl hover:bg-red-50 text-red-500 cursor-pointer transition-all">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
                
                {/* SELETOR DE MÊS: Mais compacto no mobile */}
                <section className="bg-white rounded-3xl md:rounded-4xl p-2 md:p-4 shadow-sm border border-slate-200 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="p-2 md:p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-slate-400"
                    >
                        <ChevronLeft size={20} className="md:scale-125" />
                    </button>

                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="hidden xs:block p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <CalendarIcon size={16} />
                        </div>
                        <span className="font-black text-slate-800 text-sm md:text-lg capitalize tracking-tight">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </span>
                    </div>

                    <button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="p-2 md:p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-slate-400"
                    >
                        <ChevronRight size={20} className="md:scale-125" />
                    </button>
                </section>

                {/* CARDS: Grid de 1 coluna (mobile) e 3 colunas (desktop) */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                    <PremiumCard
                        title="Saldo Total"
                        value={totals.balance}
                        icon={<Wallet size={20} />}
                        highlight
                        isPrivate={isPrivate}
                    />
                    {/* Grid de 2 colunas lado a lado apenas em telas pequenas para economizar espaço vertical */}
                    <div className="grid grid-cols-2 md:contents gap-3">
                        <PremiumCard
                            title="Entradas"
                            value={totals.income}
                            icon={<ArrowUpCircle size={20} />}
                            color="green"
                            isPrivate={isPrivate}
                        />
                        <PremiumCard
                            title="Saídas"
                            value={totals.expense}
                            icon={<ArrowDownCircle size={20} />}
                            color="red"
                            isPrivate={isPrivate}
                        />
                    </div>
                </section>

                {/* LISTA DE TRANSAÇÕES */}
                <section className="bg-white rounded-4xl md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50">
                        <h3 className="font-black text-slate-800 flex gap-2 items-center tracking-tight text-sm md:text-base">
                            <History size={18} className="text-blue-600" />
                            Atividade
                        </h3>

                        {/* Filtros agora fazem scroll lateral no mobile se necessário */}
                        <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                            {(["all", "income", "expense"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`flex-1 sm:flex-none whitespace-nowrap px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all cursor-pointer ${filter === t
                                            ? "bg-white shadow-sm text-slate-900"
                                            : "text-slate-400"
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
                                <div className="py-16 md:py-24 text-center flex flex-col items-center gap-3 px-6">
                                    <History size={40} className="text-slate-200" />
                                    <p className="text-slate-400 font-bold text-sm">Sem movimentações.</p>
                                </div>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <motion.div
                                        layout
                                        key={t.id}
                                        onClick={() => router.push(`/dashboard/${t.id}`)}
                                        className="p-4 md:p-6 flex justify-between items-center hover:bg-slate-50/80 active:bg-slate-100 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 md:gap-5">
                                            {/* Ícone menor no mobile */}
                                            <div className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl border ${t.type === 'income' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {t.type === 'income' ? <TrendingUp size={16} className="md:size-5" /> : <ArrowDownCircle size={16} className="md:size-5" />}
                                            </div>
                                            <div className="max-w-30 xs:max-w-none">
                                                <p className="font-bold text-slate-800 text-sm md:text-base truncate">{t.description}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                                    {t.date?.seconds ? format(new Date(t.date.seconds * 1000), "dd 'de' MMM", { locale: ptBR }) : "---"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 md:gap-6">
                                            <span className={`font-black text-sm md:text-lg tracking-tighter ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                                {isPrivate ? "R$ ••••" : `${t.type === "income" ? "+" : "-"} R$ ${t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                                            </span>
                                            {/* Botão de excluir sempre visível no mobile para facilitar o toque */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(t.id);
                                                }}
                                                className="p-2 text-slate-300 md:opacity-0 md:group-hover:opacity-100 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </main>

            {/* Botão flutuante ajustado: centralizado ou no canto com mais margem */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-blue-600 text-white p-4 md:p-5 rounded-3xl md:rounded-4xl shadow-2xl shadow-blue-300 z-50 cursor-pointer"
            >
                <Plus size={28} className="md:scale-125" strokeWidth={3} />
            </motion.button>

            <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

// PREMIUM CARD AJUSTADO: Padding menor no mobile e fonte fluida
function PremiumCard({ title, value, icon, color, highlight, isPrivate }: any) {
    const colorMap: any = { green: "text-green-600", red: "text-red-600" };

    return (
        <motion.div
            className={`p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] border transition-all ${highlight
                    ? "bg-slate-900 text-white border-transparent shadow-xl md:shadow-2xl shadow-slate-300"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
        >
            <div className="flex justify-between mb-4 md:mb-8 items-start">
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] ${highlight ? "opacity-50" : "text-slate-400"}`}>
                    {title}
                </span>
                <div className={`p-1.5 md:p-2 rounded-lg ${highlight ? "bg-white/10 text-blue-400" : "bg-slate-50 text-slate-400 opacity-40"}`}>
                    {icon}
                </div>
            </div>

            <h2 className={`text-xl md:text-3xl font-black tracking-tighter truncate ${!highlight ? colorMap[color] : ""}`}>
                {isPrivate ? "R$ ••••" : `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </h2>
        </motion.div>
    );
}