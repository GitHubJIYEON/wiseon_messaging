import type { ComponentType } from "react";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedMainLayout from "@/shared/components/layout/ProtectedMainLayout.tsx";
import ServiceLayout from "@/shared/components/layout/ServiceLayout.tsx";
import App from "./App.tsx";
import AuthLayout from "./features/auth/components/AuthLayout.tsx";
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
                path: "address-book/new",
                element: withSuspense(
                  () => import("./pages/address-book/AddressBookNewPage.tsx"),
                ),
              },
              {
                path: "address-book/:id",
                element: withSuspense(
                  () => import("./pages/address-book/AddressBookPage.tsx"),
                ),
              },
              {
                path: "unsubscribes",
                element: withSuspense(
                  () => import("./pages/unsubscribes/UnsubscribesPage.tsx"),
                ),
              },

              {
                path: "message-result",
                element: withSuspense(
                  () =>
                    import("./pages/message-results/MessageResultsPage.tsx"),
                ),
              },
              {
                path: "statistics",
                element: withSuspense(
                  () => import("./pages/statistics/StatisticsPage.tsx"),
                ),
              },
              {
                path: "calling-number/:id",
                element: withSuspense(
                  () => import("./pages/calling-number/CallingNumberPage.tsx"),
                ),
              },
              {
                path: "calling-number/new",
                element: withSuspense(
                  () =>
                    import("./pages/calling-number/CallingNumberNewPage.tsx"),
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
