import { Outlet } from "react-router-dom";
import { Provider } from "./shared/components/layout/Provider";

export default function App() {
  return (
    <Provider>
      <Outlet />
    </Provider>
  );
}
