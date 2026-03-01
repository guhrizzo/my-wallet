"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Wallet2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // ===============================
  // 🔥 LOGIN COM GOOGLE (ROBUSTO)
  // ===============================
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const emailGoogle = result.user.email;

      if (!emailGoogle) throw new Error("Email não encontrado");

      // 🔍 verifica métodos existentes
      const methods = await fetchSignInMethodsForEmail(auth, emailGoogle);

      // se existir password também, apenas informa
      if (methods.includes("password")) {
        toast.success("Login com Google realizado!");
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          "Este e-mail já possui conta com senha. Entre com e-mail e senha primeiro."
        );
      } else {
        setError("Falha ao autenticar com o Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 🔐 LOGIN COM EMAIL/SENHA
  // ===============================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/invalid-credential") {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/user-not-found") {
        setError("Usuário não encontrado.");
      } else {
        setError("Erro ao acessar sua conta.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 🔑 RESET DE SENHA
  // ===============================
  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Digite seu e-mail primeiro.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("E-mail de redefinição enviado!");
    } catch (err) {
      toast.error("Erro ao enviar e-mail.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="max-w-md w-full space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-2">
            <Wallet2 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            MyWallet
          </h1>
          <p className="text-slate-500 font-medium">
            Gerencie suas finanças com simplicidade.
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          {/* GOOGLE */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all mb-6 disabled:opacity-70"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Entrar com Google
          </button>

          {/* DIVIDER */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">
                Ou use seu e-mail
              </span>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                E-mail
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-950 outline-none transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* SENHA */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* RESET */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar na conta
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs">
          © {new Date().getFullYear()} MyWallet
        </p>
      </div>
    </div>
  );
}