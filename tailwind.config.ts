import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#edf4ff",
        paper: "#070b12",
        mint: "#27d8e8",
        signal: "#f59e0b",
        cobalt: "#67e8f9",
        danger: "#fb7185"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(0,0,0,.32)"
      }
    }
  },
  plugins: []
};

export default config;
