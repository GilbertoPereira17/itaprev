import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#005BAC",        // Azul Royal da Logo
          "blue-hover": "#00488A",
          cyan: "#009EE2",        // Azul Celeste da Logo
          "light-cyan": "#54C0EB",// Azul Claro da Logo
          navy: "#0B1E36",        // Azul Marinho Institucional
          "navy-dark": "#071526",
          gold: "#C59B27",        // Dourado Selo Pró-Gestão Nível II
          "gold-hover": "#A68019",
          "gold-light": "#FFF9E6",
          "gold-border": "#F3DE9A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(11, 30, 54, 0.08)",
        card: "0 10px 30px -5px rgba(0, 91, 172, 0.08)",
        hover: "0 20px 40px -10px rgba(0, 91, 172, 0.16)",
      },
    },
  },
  plugins: [],
};
export default config;
