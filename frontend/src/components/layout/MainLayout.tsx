import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuthBootstrap } from "@/features/auth/hooks/useAuthBootstrap";

/**
 * App shell shared by every route. The "/dyang" route gets a distinct
 * romantic theme by toggling the `theme-dyang` class on the wrapper,
 * which flips CSS variables and fonts defined in index.css.
 */
export function MainLayout() {
  const location = useLocation();
  const isDyang = location.pathname.startsWith("/dyang");
  useAuthBootstrap();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-colors duration-500",
        isDyang && "theme-dyang bg-dyang-50",
      )}
    >
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LoginRequiredDialog />
    </div>
  );
}
