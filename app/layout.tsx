import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext"; // Importando o contexto
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "MyWallet - Minhas Finanças",
  description: "Gerenciador de carteira pessoal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* 1. Usamos poppins.variable para o Tailwind 
          2. Usamos poppins.className para garantir que a fonte carregue de imediato
      */}
      <body className={`${poppins.variable} ${poppins.className} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}