import { useTheme } from "../contexts/ThemeContext";
import { ReactNode, useEffect } from "react";

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  // Force re-render when theme changes
  useEffect(() => {
    // This component will re-render when theme changes
    // which will cause all children to re-render
  }, [theme]);

  return <>{children}</>;
}
