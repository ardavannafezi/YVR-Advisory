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
        background: "#070510",
        surface: "rgba(18, 8, 40, 0.6)",
        gold: {
          DEFAULT: "#c9a84c",
          light: "#d9be7a",
          dark: "#a07830",
        },
        text: {
          primary: "#f5f5f0",
          muted: "#9488b0",
          dim: "#463d65",
        },
        border: {
          DEFAULT: "rgba(75, 45, 125, 0.25)",
          gold: "#c9a84c",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #c9a84c 0%, #d9be7a 50%, #a07830 100%)",
        "dark-gradient": "linear-gradient(180deg, rgba(7,5,16,0) 0%, #070510 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
