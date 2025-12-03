import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    console.log("Saved theme from localStorage:", savedTheme);
    
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    
    // Then check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      console.log("Using system preference: dark");
      return "dark";
    }
    
    console.log("Using default: light");
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    console.log("Setting theme to:", theme);
    console.log("HTML classes before:", root.className);
    
    // Remove both classes from root
    root.classList.remove("light", "dark");
    
    // Add the current theme class to root
    root.classList.add(theme);
    
    // Also set attribute for CSS specificity
    root.setAttribute("data-theme", theme);
    
    // Set color-scheme for native browser UI
    body.style.colorScheme = theme;
    
    console.log("HTML classes after:", root.className);
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      console.log("Toggling from", prevTheme, "to", newTheme);
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
