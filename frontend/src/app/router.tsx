import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

const HomePage = lazy(() => import("@/pages/HomePage"));
const TypeChallengePage = lazy(() => import("@/pages/TypeChallengePage"));
const RoulettePage = lazy(() => import("@/pages/RoulettePage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const StreamLogPage = lazy(() => import("@/pages/StreamLogPage"));
const DyangPage = lazy(() => import("@/pages/DyangPage"));
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
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "type-challenge", element: withSuspense(<TypeChallengePage />) },
      { path: "roulette", element: withSuspense(<RoulettePage />) },
      { path: "schedule", element: withSuspense(<SchedulePage />) },
      { path: "stream-log", element: withSuspense(<StreamLogPage />) },
      { path: "dyang", element: withSuspense(<DyangPage />) },
      { path: "*", element: withSuspense(<NotFoundPage />) },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
