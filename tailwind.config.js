/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#e4edf4",
        input: "#e4edf4",
        ring: "#050a11",
        background: "#FFFFFF",
        foreground: "#000000",
        primary: {
          DEFAULT: "#0d1b33",
          foreground: "#f6f9fa",
        },
        secondary: {
          DEFAULT: "#eff5f7",
          foreground: "#0d1b33",
        },
        destructive: {
          DEFAULT: "#e63946",
          foreground: "#f6f9fa",
        },
        muted: {
          DEFAULT: "#eff5f7",
          foreground: "#6e7b85",
        },
        accent: {
          DEFAULT: "#eff5f7",
          foreground: "#0d1b33",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#050a11",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#050a11",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
