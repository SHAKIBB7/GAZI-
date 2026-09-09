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
        cricket: {
          pitch: "#0B4D3C",
          "pitch-dark": "#063328",
          "pitch-light": "#126B54",
          lime: "#84CC16",
          gold: "#D97706",
          "gold-light": "#F59E0B",
          leather: "#DC2626",
          "leather-dark": "#991B1B",
          slate: "#0F172A",
          cream: "#FBF9F5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
