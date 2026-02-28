import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Substitui a fonte padrão do Tailwind pela Poppins
        sans: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;