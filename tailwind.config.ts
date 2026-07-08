import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        asphalt: "#20232a",
        road: "#343942",
        grass: "#6fb66f",
        cream: "#f8f3e8",
        brick: "#d65a45",
        court: "#b8753f",
      },
    },
  },
  plugins: [],
};

export default config;
