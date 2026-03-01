"use client";

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  X,
  Tag,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ isOpen, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [displayAmount, setDisplayAmount] = useState("0,00");
  const [numericAmount, setNumericAmount] = useState(0);
  const [type, setType] = useState<"income" | "expense">("income");
  const [loading, setLoading] = useState(false);

  // ✅ Reset sempre que abrir
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setDisplayAmount("0,00");
      setNumericAmount(0);
      setType("income");
    }
  }, [isOpen]);

  // ✅ Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // ✅ Máscara monetária melhorada
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

  // ✅ Submit protegido
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
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        description: description.trim(),
        amount: numericAmount,
        type,
        date: serverTimestamp(),
      });

      toast.success("Lançamento salvo!", {
        style: { borderRadius: "16px", fontWeight: "bold" },
      });

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ fechar ao clicar fora
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onMouseDown={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            
            <div className="p-6 flex justify-between items-center border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                Novo Lançamento
              </h2>

              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                    type === "income"
                      ? "bg-white text-green-600 shadow-sm scale-[1.02]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <ArrowUpCircle size={18} />
                  Entrada
                </button>

                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                    type === "expense"
                      ? "bg-white text-red-600 shadow-sm scale-[1.02]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <ArrowDownCircle size={18} />
                  Saída
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Valor
                </label>

                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    R$
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    className="w-full pl-12 pr-4 py-5 bg-slate-50 border-none rounded-2xl text-3xl font-black text-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  O que é?
                </label>

                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />

                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Mercado, Salário..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer ${
                  type === "income"
                    ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                    : "bg-red-600 hover:bg-red-700 shadow-red-100"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
