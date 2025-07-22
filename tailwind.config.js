export default {
  darkMode: ["class"],
  content: ["./client/**/*.{js,jsx}"],
  prefix: "",
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
        // VenueKart Comprehensive Color Palette

        // Primary Colors
        "venue-primary-bg": "#FAF9F6", // soft ivory white - overall background
        "venue-primary-accent": "#32279D", // deep indigo - main CTAs, navbar, icons, highlights
        "venue-primary-accent-hover": "#1F1A6F", // hover state for primary accent

        // Secondary Colors
        "venue-secondary-accent": "#6C63FF", // soft indigo - hover state, secondary buttons
        "venue-secondary-accent-hover": "#E4E0FF", // hover state for secondary accent
        "venue-secondary-bg": "#F0EEFC", // light indigo-tinted background - sections, cards
        "venue-shadow": "#C3C1E1", // muted blue-gray - for subtle elevation

        // Neutral Colors (Text & Layout Support)
        "venue-text-primary": "#1C1C1E", // dark charcoal for best readability
        "venue-text-secondary": "#3A3A3C", // for subtext and muted descriptions
        "venue-border": "#E0E0E0", // for card outlines, dividers
        "venue-muted-bg": "#F7F7F9", // for muted sections/cards

        // Functional Colors
        "venue-success": "#3BAA5C", // booking confirmed
        "venue-warning": "#F5A623", // near capacity
        "venue-error": "#E74C3C", // booking failed
        "venue-info": "#2D9CDB", // tips

        // Button disabled state
        "venue-disabled-bg": "#E0E0E0",
        "venue-disabled-text": "#9B9B9B",

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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
