import { createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import AuthLayout from "./features/components/layouts/AuthLayout.tsx";
import AuthPage from "./pages/auth/AuthPage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

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
    ],
  },
]);

export default router;
