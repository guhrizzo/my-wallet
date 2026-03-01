"use client";

import dynamic from "next/dynamic";

// Isso diz ao Next.js: "Só carregue esse componente no navegador do usuário"
// O 'ssr: false' mata o erro de "window is not defined" no build da Vercel
const DashboardClient = dynamic(() => import("./DashboardClient"), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

export default function DashboardPage() {
  return <DashboardClient />;
}