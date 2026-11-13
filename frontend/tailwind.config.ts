import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0D12",
        sidebar: "#11141B",
        card: "#171B24",
        line: "#262B37",
        accent: "#EB9324",
        info: "#3B82F6",
        muted: "#9CA3AF",
      },
    },
  },
  plugins: [],
};
export default config;
