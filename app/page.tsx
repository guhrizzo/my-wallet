"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Wallet2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Enquanto o Firebase decide se você está logado ou não, 
  // mostramos uma tela de splash elegante com a Poppins.
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white font-sans">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-100">
          <Wallet2 className="text-white w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">MyWallet</h1>
        <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
      </div>
    </div>
  );
}