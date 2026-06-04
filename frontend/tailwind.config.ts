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
        background: "#080808",
        surface: "rgba(255,255,255,0.03)",
        gold: {
          DEFAULT: "#c9a84c",
          light: "#d9be7a",
          dark: "#a07830",
        },
        text: {
          primary: "#f7f6f2",
          muted: "#a8a8a8",
          dim: "#6a6a6a",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          gold: "#c9a84c",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #c9a84c 0%, #d9be7a 50%, #a07830 100%)",
        "dark-gradient": "linear-gradient(180deg, rgba(8,8,8,0) 0%, #080808 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
