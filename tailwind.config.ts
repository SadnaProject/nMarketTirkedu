import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "node_modules/preline/dist/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
      },
    },
  },
  darkMode: "class",
  plugins: [require("preline/plugin"), require("tailwind-scrollbar")],
} satisfies Config;
