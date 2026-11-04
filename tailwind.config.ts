import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cream: "#F5F7F0",
        ivory: "#FBFCF7",
        sand: "#E3EADF",
        /* Brand secondary — botanical sage */
        rose: {
          50: "#F3F7F2",
          100: "#E8F1E9",
          200: "#D6E5D9",
          300: "#BFD6C5",
          400: "#A6C5AF",
          500: "#7FA88A",
          600: "#557C61",
          700: "#3F6149",
          800: "#2E4937",
          900: "#1E3125",
        },
        /* Brand primary — World Beauty Club green */
        gold: {
          100: "#EAF3EC",
          200: "#D4E8DB",
          300: "#A9CDB8",
          400: "#78B295",
          500: "#3F8467",
          600: "#266149",
          700: "#1C4A38",
          800: "#14372A",
          900: "#0E271D",
        },
        espresso: "#14221B",
        taupe: "#6F756E",
        warm: "#A8A29E",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        /* Reference token from the design system */
        whisper: "0 8px 30px rgb(0 0 0 / 0.04)",
        soft: "0 18px 50px -24px rgba(20, 34, 27, 0.22)",
        lift: "0 30px 70px -30px rgba(20, 34, 27, 0.32)",
        glow: "0 0 0 1px rgba(255,255,255,.55), 0 24px 60px -28px rgba(38, 97, 73, .24)",
        inset: "inset 0 1px 0 rgba(255,255,255,.7)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "fade-up": "fade-up .7s ease forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
