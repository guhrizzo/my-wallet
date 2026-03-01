


"use client";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    XAxis,
} from "recharts";
import { motion } from "framer-motion";

interface Props {
    transactions: any[];
    isPrivate?: boolean;
}

export default function FinanceChart({ transactions, isPrivate }: Props) {
    // Agrupa por mês
    const monthlyMap: Record<string, number> = {};

    transactions.forEach((t) => {
        if (!t.date?.seconds) return;

        const date = new Date(t.date.seconds * 1000);
        const key = date.toLocaleDateString("pt-BR", {
            month: "short",
        });

        if (!monthlyMap[key]) monthlyMap[key] = 0;

        monthlyMap[key] += t.type === "income" ? t.amount : -t.amount;
    });

    const chartData = Object.entries(monthlyMap).map(([month, value]) => ({
        month,
        value,
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Visão financeira</h3>
                <span className="text-xs text-slate-400 font-semibold">
                    últimos meses
                </span>
            </div>

            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            formatter={(value: any) =>
                                isPrivate
                                    ? "R$ ••••"
                                    : `R$ ${Number(value).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                    })}`
                            }
                        />

                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fill="url(#colorValue)"
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
