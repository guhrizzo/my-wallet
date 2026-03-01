"use client";

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import {
  X,
  Tag,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  Calendar as CalendarIcon,
  AlignLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "Alimentação", icon: "🍕" },
  { id: "Transporte", icon: "🚗" },
  { id: "Lazer", icon: "🎮" },
  { id: "Moradia", icon: "🏠" },
  { id: "Saúde", icon: "🏥" },
  { id: "Educação", icon: "📚" },
  { id: "Outros", icon: "💰" },
];

export default function AddTransactionModal({ isOpen, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [displayAmount, setDisplayAmount] = useState("0,00");
  const [numericAmount, setNumericAmount] = useState(0);
  const [type, setType] = useState<"income" | "expense">("income");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Outros");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // RESET
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setDisplayAmount("0,00");
      setNumericAmount(0);
      setType("income");
      setCategory("Outros");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  // ESC CLOSE
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // MASK VALOR
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      const amount = Number(digits) / 100;
      setNumericAmount(amount);
      setDisplayAmount(
        amount.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    },
    []
  );

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error("Usuário não autenticado");
      navigator.vibrate?.(80);
      return;
    }

    if (!description.trim()) {
      toast.error("Digite uma descrição");
      navigator.vibrate?.(80);
      return;
    }

    if (numericAmount <= 0) {
      toast.error("Insira um valor maior que zero");
      navigator.vibrate?.(80);
      return;
    }

    setLoading(true);

    try {
      const selectedDate = new Date(`${date}T12:00:00`);

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        description: description.trim(),
        amount: numericAmount,
        type,
        category,
        notes: notes.trim(),
        date: Timestamp.fromDate(selectedDate),
        createdAt: Timestamp.now(),
      });

      toast.success("Lançamento salvo!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
      navigator.vibrate?.(120);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const headerGradient =
    type === "income"
      ? "from-green-500 to-emerald-600"
      : "from-red-500 to-rose-600";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onMouseDown={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
        >
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120) onClose();
            }}
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.25)] overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* HEADER */}
            <div
              className={`relative p-6 text-white bg-linear-to-r ${headerGradient}`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black tracking-tight">
                  Novo Lançamento
                </h2>

                <button
                  onClick={onClose}
                  className="p-2 cursor-pointer rounded-full bg-white/20 hover:bg-white/30 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* VALOR HERO */}
              <div className="mt-6 text-center">
                <div className="text-sm opacity-80 font-semibold mb-1">
                  Valor
                </div>

                <motion.input
                  key={type}
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  type="text"
                  inputMode="numeric"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  className="w-full bg-transparent text-center text-5xl font-black outline-none"
                />

                <div className="text-xs opacity-80 mt-1">BRL</div>
              </div>
            </div>

            {/* BODY SCROLL INSANO */}
            <form
              onSubmit={handleSubmit}
              className="relative p-6 space-y-5 overflow-y-auto scrollbar-hide overscroll-contain"
            >
              {/* TOGGLE */}
              <div className="relative flex bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`absolute top-1.5 bottom-1.5 w-1/2 rounded-xl shadow-sm ${
                    type === "income"
                      ? "left-1.5 bg-white dark:bg-zinc-700"
                      : "left-[calc(50%-2px)] bg-white dark:bg-zinc-700"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold ${
                    type === "income"
                      ? "text-green-600"
                      : "text-slate-500"
                  }`}
                >
                  <ArrowUpCircle size={18} />
                  Entrada
                </button>

                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold ${
                    type === "expense"
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  <ArrowDownCircle size={18} />
                  Saída
                </button>
              </div>

              {/* DESCRIÇÃO */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 ml-1">
                  Descrição
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    autoFocus
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Mercado, salário..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* CATEGORIAS */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 ml-1">
                  Categoria
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-2xl text-sm font-semibold transition-all border ${
                          active
                            ? "bg-blue-50 border-blue-500 text-blue-600 scale-[1.05]"
                            : "bg-slate-50 dark:bg-zinc-800 border-transparent text-slate-600"
                        }`}
                      >
                        <div className="text-lg">{cat.icon}</div>
                        <div>{cat.id}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DATA */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 ml-1">
                  Data
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none"
                  />
                </div>
              </div>

              {/* OBS */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 ml-1">
                  Observações
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Opcional..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none resize-none"
                  />
                </div>
              </div>

              {/* BOTÃO */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-lg flex items-center justify-center gap-2 ${
                  type === "income"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Salvar Lançamento"
                )}
              </motion.button>

              {/* 🔥 FADE TOP */}
              <div className="pointer-events-none sticky top-0 h-6 bg-linear-to-b from-white dark:from-zinc-900 to-transparent z-10" />

              {/* 🔥 FADE BOTTOM */}
              <div className="pointer-events-none sticky bottom-0 h-10 bg-linear-to-t from-white dark:from-zinc-900 to-transparent z-10" />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}