import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Dar Tahara — Design System
 * Palette derived from the official logo: deep forest green + warm gold,
 * grounded in warm whites, natural stone, soft beige and deep charcoal.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Semantic tokens (mapped to CSS variables for light/dark)
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Raw brand scales (identity-anchored, theme-independent)
        forest: {
          50: "#f2f6f1",
          100: "#dfe9dc",
          200: "#c0d3ba",
          300: "#96b58c",
          400: "#6c9260",
          500: "#4c7440",
          600: "#3a5c31",
          700: "#2f4a29",
          800: "#274020",
          900: "#1f331b",
          950: "#0f1c0d",
        },
        gold: {
          50: "#faf6ec",
          100: "#f2e8cf",
          200: "#e6cf9c",
          300: "#d9b76d",
          400: "#cfa24b",
          500: "#c08d38",
          600: "#a5722d",
          700: "#845729",
          800: "#6d4726",
          900: "#5c3c24",
          950: "#341f11",
        },
        stone: {
          50: "#faf8f3",
          100: "#f3efe6",
          200: "#e8e0d0",
          300: "#d9cdb6",
          400: "#c3b192",
          500: "#af9975",
          600: "#9c8562",
          700: "#816c52",
          800: "#6a5946",
          900: "#574a3c",
          950: "#2f271f",
        },
        charcoal: {
          DEFAULT: "#26241f",
          light: "#3a372f",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 6vw, 5.25rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        widest: "0.24em",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(38,36,31,0.04), 0 8px 24px -12px rgba(38,36,31,0.12)",
        lift: "0 2px 4px rgba(38,36,31,0.04), 0 24px 48px -20px rgba(38,36,31,0.22)",
        gold: "0 10px 40px -12px rgba(207,162,75,0.45)",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
