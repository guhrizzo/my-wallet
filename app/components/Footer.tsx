


"use client";

import { Wallet2, Github, Linkedin, Heart, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full mt-auto relative overflow-hidden">

            <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-slate-100" />
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-blue-200/30 blur-3xl rounded-full" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-indigo-200/30 blur-3xl rounded-full" />

            <div className="relative max-w-6xl mx-auto px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">


                    <div className="space-y-5 text-center md:text-left">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center justify-center md:justify-start gap-3"
                        >
                            <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                                <Wallet2 className="text-white w-5 h-5" />
                            </div>

                            <span className="text-xl font-black text-slate-900 tracking-tight">
                                MyWallet
                            </span>
                        </motion.div>

                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto md:mx-0 font-medium">
                            Controle financeiro simples, rápido e inteligente.
                            Transforme seus números em decisões melhores.
                        </p>


                        <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 font-semibold">
                            Feito com <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> para quem quer evoluir financeiramente
                        </div>
                    </div>


                    <div className="flex flex-col items-center md:items-center gap-4">
                        <h4 className="text-slate-800 font-bold text-sm uppercase tracking-widest">
                            Produto
                        </h4>

                        <div className="flex flex-col gap-3 text-sm font-semibold">
                            {[
                                "Dashboard",
                                "Transações",
                                "Relatórios",
                                "Configurações",
                            ].map((item) => (
                                <motion.a
                                    key={item}
                                    whileHover={{ x: 4 }}
                                    href="#"
                                    className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
                                >
                                    {item}
                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                                </motion.a>
                            ))}
                        </div>
                    </div>


                    <div className="flex flex-col items-center md:items-end gap-5">
                        <h4 className="text-slate-800 font-bold text-sm uppercase tracking-widest">
                            Conecte-se
                        </h4>

                        <div className="flex gap-4">
                            <SocialButton href="#">
                                <Github size={20} />
                            </SocialButton>

                            <SocialButton href="#">
                                <Linkedin size={20} />
                            </SocialButton>
                        </div>

                        <p className="text-xs text-slate-400 font-medium text-center md:text-right max-w-xs">
                            Acompanhe atualizações, novidades e melhorias do MyWallet.
                        </p>
                    </div>
                </div>


                <div className="mt-14 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-xs font-semibold">
                        © {currentYear} MyWallet. Todos os direitos reservados.
                    </p>

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                    >
                        ↑ Voltar ao topo
                    </motion.button>
                </div>
            </div>
        </footer>
    );
}

function SocialButton({ children, href }: any) {
    return (
        <motion.a
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={href}
            target="_blank"
            className="
        p-3
        bg-white
        border border-slate-200
        text-slate-500
        hover:text-blue-600
        hover:border-blue-200
        hover:bg-blue-50
        rounded-2xl
        shadow-sm
        hover:shadow-md
        transition-all
      "
        >
            {children}
        </motion.a>
    );
}