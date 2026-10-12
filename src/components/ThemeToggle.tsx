import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try { return localStorage.getItem("novik24.theme") === "light" ? "light" : "dark"; } catch { return "dark"; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("novik24.theme", theme); } catch { /* Storage may be disabled. */ }
  }, [theme]);
  return <button className="theme-toggle" aria-label={theme === "dark" ? "Включить дневную тему" : "Включить ночную тему"}
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}{theme === "dark" ? "День" : "Ночь"}</button>;
}
