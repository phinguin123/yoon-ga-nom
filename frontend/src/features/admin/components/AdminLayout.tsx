import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Film, Trophy, Clapperboard, CalendarDays } from "lucide-react";
import { useAdminLogout } from "@/features/admin/hooks/useAdminAuth";
import { cn } from "@/lib/utils";

const ADMIN_TABS = [
  { to: "/admin/videos", label: "챌린지 영상", icon: Film },
  { to: "/admin/drips", label: "DOTY 드립", icon: Trophy },
  { to: "/admin/vods", label: "다시보기", icon: Clapperboard },
  { to: "/admin/schedule", label: "일정", icon: CalendarDays },
] as const;

export function AdminLayout() {
  const logoutMutation = useAdminLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/admin/login", { replace: true }),
    });
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            관리자 대시보드
          </h1>
          <p className="mt-1 text-sm text-slate-500">사이트 콘텐츠를 추가, 수정, 삭제할 수 있어요.</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          <LogOut className="h-4 w-4" /> 로그아웃
        </button>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
