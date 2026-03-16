import { Outlet } from "react-router-dom";
import { BaseHeader } from "@/shared/components/layout/BaseHeader";

export default function ProtectedMainLayout() {
  return (
    <section className="flex h-full flex-col">
      <BaseHeader />
      <Outlet />
    </section>
  );
}
