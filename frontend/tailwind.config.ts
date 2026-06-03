import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030209",
        surface: "rgba(7, 2, 20, 0.8)",
        gold: {
          DEFAULT: "#c9a84c",
          light: "#d9be7a",
          dark: "#a07830",
        },
        text: {
          primary: "#f0eef8",
          muted: "#8880a8",
          dim: "#3a3058",
        },
        border: {
          DEFAULT: "rgba(60, 25, 110, 0.3)",
          gold: "#c9a84c",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #c9a84c 0%, #d9be7a 50%, #a07830 100%)",
        "dark-gradient": "linear-gradient(180deg, rgba(3,2,9,0) 0%, #030209 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
