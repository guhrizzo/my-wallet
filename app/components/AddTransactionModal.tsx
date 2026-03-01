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
      return;
    }

    if (!description.trim()) {
      toast.error("Digite uma descrição");
      return;
    }

    if (numericAmount <= 0) {
      toast.error("Insira um valor maior que zero");
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
    } finally {
      setLoading(false);
    }
  };

  const headerGradient =
    type === "income"
      ? "from-green-500 to-emerald-600"
      : "from-red-500 to-rose-600";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center"
        >
          {/* SHEET */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => info.offset.y > 120 && onClose()}
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="
              w-full sm:max-w-md
              h-dvh lg:h-[94dvh] sm:h-auto
              bg-white dark:bg-zinc-900
              sm:rounded-[2.5rem]
              shadow-[0_25px_70px_rgba(0,0,0,0.25)]
              flex flex-col overflow-hidden
            "
          >
            {/* DRAG HANDLE (mobile) */}
            

            {/* HEADER */}
            <div
              className={`sticky lg:h-auto h-54 z-20 p-6 text-white bg-linear-to-r ${headerGradient}`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black tracking-tight">
                  Novo Lançamento
                </h2>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 cursor-pointer transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* VALOR */}
              <div className="mt-6 text-center">
                <div className="text-sm opacity-80 font-semibold mb-1">
                  Valor
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-bold opacity-80">R$</span>

                  <motion.input
                    key={type}
                    initial={{ scale: 0.9, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    type="text"
                    inputMode="numeric"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    className="bg-transparent text-center text-5xl font-black outline-none w-55"
                  />
                </div>
              </div>
            </div>

            {/* BODY */}
            <form
              onSubmit={handleSubmit}
              className="
                flex-1 overflow-y-auto
                p-5 sm:p-6
                space-y-5
                overscroll-contain
              "
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
              <InputField
                label="Descrição"
                icon={<Tag className="w-5 h-5" />}
                value={description}
                onChange={setDescription}
                placeholder="Ex: Mercado, salário..."
                autoFocus
              />

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
                        className={`
                          p-3 rounded-2xl text-sm font-semibold transition-all border
                          min-h-18
                          ${
                            active
                              ? "bg-blue-50 border-blue-500 text-blue-600 scale-[1.04]"
                              : "bg-slate-50 dark:bg-zinc-800 border-transparent text-slate-600 hover:scale-[1.02]"
                          }
                        `}
                      >
                        <div className="text-lg">{cat.icon}</div>
                        <div>{cat.id}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DATA */}
              <InputField
                label="Data"
                type="date"
                icon={<CalendarIcon className="w-5 h-5" />}
                value={date}
                onChange={setDate}
              />

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
            </form>

            {/* FOOTER STICKY */}
            <div className="p-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full  py-5 rounded-2xl font-black text-lg text-white shadow-lg flex items-center justify-center gap-2 ${
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* 🔥 INPUT PADRÃO REUTILIZÁVEL */
function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
}: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          autoFocus={autoFocus}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-4 py-4
            bg-slate-50 dark:bg-zinc-800
            rounded-2xl font-medium outline-none
            focus:ring-2 focus:ring-blue-500/20
          "
        />
      </div>
    </div>
  );
}