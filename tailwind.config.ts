import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f5f6dc",
        "cream-dark": "#e8e9c4",
        primary: "#852623",
        "primary-dark": "#6b1e1b",
        "primary-light": "#a33330",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
