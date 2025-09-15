import Link from "next/link";
import { useEffect, useState } from "react";
import s from "@/styles/components/Layout.module.scss";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const prefer = typeof window !== "undefined" ? window.localStorage.getItem("theme") : null;
    const prefersDark = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = prefer || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("theme", next);
  }

  return (
    <div className={s.shell}>
      <nav className={s.nav}>
        <div className={`container ${s.bar}`}>
          <div className={s.brand}>
            <span>Blog</span>
          </div>
          <div className={s.links}>
            <button className={`${s.themeToggle}`} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </nav>
      <main className={`container ${s.main}`}>{children}</main>
    </div>
  );
}
