import type { ComponentType } from "react";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedMainLayout from "@/shared/components/layout/ProtectedMainLayout.tsx";
import ServiceLayout from "@/shared/components/layout/ServiceLayout.tsx";
import App from "./App.tsx";
import AuthLayout from "./features/auth/components/layouts/AuthLayout.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

const withSuspense = (importFn: () => Promise<{ default: ComponentType }>) => {
  const LazyComponent = lazy(importFn);
  return (
    <Suspense fallback={null}>
      <LazyComponent />
    </Suspense>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: withSuspense(() => import("./pages/auth/AuthPage.tsx")),
          },
        ],
      },

      {
        path: "/",
        element: <ProtectedMainLayout />,
        children: [
          {
            path: "/",
            element: <ServiceLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              {
                path: "dashboard",
                element: withSuspense(
                  () => import("./pages/dashboard/DashboardPage.tsx"),
                ),
              },
              {
                path: "messages/sms",
                element: withSuspense(
                  () => import("./pages/messages/SmsPage.tsx"),
                ),
              },
              {
                path: "messages/alimtalk",
                element: withSuspense(
                  () => import("./pages/messages/AlimtalkPage.tsx"),
                ),
              },

              {
                path: "address-books",
                element: withSuspense(
                  () => import("./pages/address-books/AddressBooksPage.tsx"),
                ),
              },
              {
                path: "address-books/:id",
                element: withSuspense(
                  () =>
                    import("./pages/address-books/AddressBooksDetailPage.tsx"),
                ),
              },

              {
                path: "unsubscribes",
                element: withSuspense(
                  () => import("./pages/unsubscribes/UnsubscribesPage.tsx"),
                ),
              },

              {
                path: "message-results",
                element: withSuspense(
                  () =>
                    import("./pages/message-results/MessageResultsPage.tsx"),
                ),
              },
              {
                path: "message-results/:id",
                element: withSuspense(
                  () =>
                    import("./pages/message-results/MessageResultsDetailPage.tsx"),
                ),
              },

              {
                path: "statistics",
                element: withSuspense(
                  () => import("./pages/statistics/StatisticsPage.tsx"),
                ),
              },
              {
                path: "calling-numbers/list",
                element: withSuspense(
                  () =>
                    import("./pages/calling-numbers/CallingNumbersPage.tsx"),
                ),
              },
              {
                path: "calling-numbers/new",
                element: withSuspense(
                  () =>
                    import("./pages/calling-numbers/CallingNumbersNewPage.tsx"),
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
