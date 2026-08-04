import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  to: string;
  label: string;
  special?: boolean;
}

const NAV_LINKS: NavLinkItem[] = [
  { to: "/type-challenge", label: "타입 챌린지" },
  { to: "/roulette", label: "룰렛" },
  { to: "/schedule", label: "일정" },
  { to: "/stream-log", label: "다시보기 기록" },
  { to: "/doty", label: "DOTY 🏆" },
  { to: "/dyang", label: "댱 콜라보", special: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <span>
            윤가놈<span className="text-brand-600">.gg</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  link.special
                    ? isActive
                      ? "text-dyang-600"
                      : "text-dyang-500 hover:text-dyang-600"
                    : isActive
                      ? "text-brand-700"
                      : "text-slate-600 hover:text-slate-900",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.special && "💕 "}
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className={cn(
                        "absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full",
                        link.special ? "bg-dyang-500" : "bg-brand-600",
                      )}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="메뉴 열기"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-xl px-4 py-3 text-sm font-semibold",
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-600",
                    )
                  }
                >
                  {link.special && "💕 "}
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
