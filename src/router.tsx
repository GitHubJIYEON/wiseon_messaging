import { createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

    // auth , error
    // 관리자 유형, 기관 관리, 조직도 관리, 사용자 관리, 템플릿 관리, 판매관리
  },
]);

export default router;
