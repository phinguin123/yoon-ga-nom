import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { RequireAdmin } from "@/features/admin/components/RequireAdmin";
import { AdminLayout } from "@/features/admin/components/AdminLayout";

const HomePage = lazy(() => import("@/pages/HomePage"));
const TypeChallengePage = lazy(() => import("@/pages/TypeChallengePage"));
const TypeChallengeSeriesPage = lazy(() => import("@/pages/TypeChallengeSeriesPage"));
const RoulettePage = lazy(() => import("@/pages/RoulettePage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const StreamLogPage = lazy(() => import("@/pages/StreamLogPage"));
const DotyPage = lazy(() => import("@/pages/DotyPage"));
const DyangPage = lazy(() => import("@/pages/DyangPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const KakaoCallbackPage = lazy(() => import("@/pages/KakaoCallbackPage"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));
const AdminVideosPage = lazy(() => import("@/pages/AdminVideosPage"));
const AdminDripsPage = lazy(() => import("@/pages/AdminDripsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
    </div>
  );
}

export const router = createBrowserRouter([
  // Deliberately outside MainLayout — no Navbar/Footer during the Kakao
  // login handoff (see LoginPage.tsx).
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/auth/kakao/callback", element: withSuspense(<KakaoCallbackPage />) },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "type-challenge", element: withSuspense(<TypeChallengePage />) },
      { path: "type-challenge/:seriesKey", element: withSuspense(<TypeChallengeSeriesPage />) },
      { path: "roulette", element: withSuspense(<RoulettePage />) },
      { path: "schedule", element: withSuspense(<SchedulePage />) },
      { path: "stream-log", element: withSuspense(<StreamLogPage />) },
      { path: "doty", element: withSuspense(<DotyPage />) },
      { path: "dyang", element: withSuspense(<DyangPage />) },
      { path: "admin/login", element: withSuspense(<AdminLoginPage />) },
      {
        path: "admin",
        element: <RequireAdmin />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/videos" replace /> },
              { path: "videos", element: withSuspense(<AdminVideosPage />) },
              { path: "drips", element: withSuspense(<AdminDripsPage />) },
            ],
          },
        ],
      },
      { path: "*", element: withSuspense(<NotFoundPage />) },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
