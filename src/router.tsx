import type { ComponentType } from "react";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App.tsx";
import AuthLayout from "./features/components/layouts/AuthLayout.tsx";
import MessagingLayout from "./features/messaging/components/layouts/MessagingLayout.tsx";
import AuthPage from "./pages/auth/AuthPage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import ProtectedMainLayout from "./shared/components/layout/ProtectedMainLayout.tsx";

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

    // auth , error
    // 시작하기, 대시보드, 메시지 보내기, 주소록, 발송결과, 발신번호
    children: [
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <AuthPage />,
          },
        ],
      },
      {
        path: "/",
        element: <ProtectedMainLayout />,
        children: [
          {
            path: "messaging",
            element: <MessagingLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              {
                path: "dashboard",
                element: withSuspense(
                  () => import("./pages/messaging/DashboardPage.tsx"),
                ),
              },
              {
                path: "send/sms",
                element: withSuspense(
                  () => import("./pages/messaging/SendSmsPage.tsx"),
                ),
              },
              {
                path: "send/alimtalk",
                element: withSuspense(
                  () => import("./pages/messaging/SendAlimtalkPage.tsx"),
                ),
              },
              {
                path: "address/register",
                element: withSuspense(
                  () => import("./pages/messaging/AddressRegisterPage.tsx"),
                ),
              },
              {
                path: "address/list",
                element: withSuspense(
                  () => import("./pages/messaging/AddressListPage.tsx"),
                ),
              },
              {
                path: "address/block-list",
                element: withSuspense(
                  () => import("./pages/messaging/AddressBlockListPage.tsx"),
                ),
              },
              {
                path: "send-result",
                element: withSuspense(
                  () => import("./pages/messaging/SendResultPage.tsx"),
                ),
              },
              {
                path: "statistics",
                element: withSuspense(
                  () => import("./pages/messaging/StatisticsPage.tsx"),
                ),
              },
              {
                path: "sendnumber",
                element: withSuspense(
                  () => import("./pages/messaging/SendNumberPage.tsx"),
                ),
              },
            ],
          },
          {
            path: "point",
            element: withSuspense(() => import("./pages/point/PointPage.tsx")),
          },
        ],
      },
    ],
  },
]);

export default router;
