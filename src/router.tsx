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

              /* pages/messaging — 대시보드 */
              {
                path: "dashboard",
                element: withSuspense(
                  () => import("./pages/messaging/DashboardPage.tsx"),
                ),
              },

              /* pages/messaging — 메시지 보내기 */
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

              /* pages/messaging — 주소록 */
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

              /* pages/messaging — 수신거부 (block-address) */
              {
                path: "block-address/list",
                element: withSuspense(
                  () => import("./pages/messaging/BlockAddressPage.tsx"),
                ),
              },
              {
                path: "block-address/register",
                element: withSuspense(
                  () =>
                    import("./pages/messaging/BlockAddressRegisterPage.tsx"),
                ),
              },

              /* pages/messaging — 발송 결과 */
              {
                path: "send-result",
                element: withSuspense(
                  () => import("./pages/messaging/SendResultPage.tsx"),
                ),
              },

              /* pages/messaging — 발신번호 */
              {
                path: "calling-number",
                element: (
                  <Navigate to="/messaging/calling-number/list" replace />
                ),
              },
              {
                path: "calling-number/list",
                element: withSuspense(
                  () => import("./pages/messaging/CallingNumberListPage.tsx"),
                ),
              },
              {
                path: "calling-number/register",
                element: withSuspense(
                  () =>
                    import("./pages/messaging/CallingNumberRegisterPage.tsx"),
                ),
              },

              /* pages/messaging — 통계 */
              {
                path: "statistics",
                element: withSuspense(
                  () => import("./pages/messaging/StatisticsPage.tsx"),
                ),
              },

              /* pages/messaging — 충전·사용내역 */
              {
                path: "payment/charge",
                element: withSuspense(
                  () => import("./pages/messaging/PaymentChargePage.tsx"),
                ),
              },
              {
                path: "payment/history",
                element: withSuspense(
                  () => import("./pages/messaging/PaymentHistoryPage.tsx"),
                ),
              },

              /* pages/messaging — 관리자 */
              {
                path: "admin/dashboard",
                element: withSuspense(
                  () => import("./pages/messaging/AdminDashboardPage.tsx"),
                ),
              },
              {
                path: "admin/organization-management",
                element: withSuspense(
                  () =>
                    import("./pages/messaging/AdminOrganizationManagementPage.tsx"),
                ),
              },
              {
                path: "admin/organization-management/:projectId",
                element: withSuspense(
                  () =>
                    import("./pages/messaging/AdminOrganizationManagementDetailPage.tsx"),
                ),
              },
              {
                path: "admin/calling-number-management",
                element: withSuspense(
                  () =>
                    import("./pages/messaging/AdminCallingNumberManagementPage.tsx"),
                ),
              },
              {
                path: "admin/calling-number-management/:callingNumberId",
                element: withSuspense(
                  () =>
                    import("./pages/messaging/AdminCallingNumberManagementDetailPage.tsx"),
                ),
              },
              {
                path: "admin/price-management/charge",
                element: withSuspense(
                  () => import("./pages/messaging/AdminPriceChargePage.tsx"),
                ),
              },
              {
                path: "admin/price-management/status",
                element: withSuspense(
                  () =>
                    import("./pages/messaging/AdminPriceManagementPage.tsx"),
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
