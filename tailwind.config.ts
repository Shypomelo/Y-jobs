import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "#f5993d", // User's primary orange
                "background-light": "#f8f7f5",
                "background-dark": "#221910",
                "surface-light": "#ffffff",
                "surface-dark": "#2d241c",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                lg: "0.5rem",
                xl: "0.75rem",
                "2xl": "1rem",
            },
            boxShadow: {
                glow: "0 0 20px -5px rgba(245, 153, 61, 0.3)",
            },
        },
    },
    plugins: [],
};
export default config;
