import { Suspense, useEffect, useState, type ReactNode } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileTextIcon,
  LayoutDashboard,
  MailIcon,
  PieChartIcon,
  SendIcon,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FullPageLoader } from "@/shared/components/FullPageLoader.tsx";

interface SubMenuItem {
  path: string;
  label: string;
  badge?: string;
}

type MenuIconId =
  | "dashboard"
  | "send"
  | "address-book"
  | "send-result"
  | "statistics";

interface MenuItem {
  id: string;
  label: string;
  icon: MenuIconId;
  defaultPath: string;
  subMenus?: SubMenuItem[];
}

const MENU_ICONS: Record<MenuIconId, ReactNode> = {
  dashboard: <LayoutDashboard size={18} />,
  send: <SendIcon size={18} />,
  "address-book": <FileTextIcon size={18} />,
  "send-result": <MailIcon size={18} />,
  statistics: <PieChartIcon size={18} />,
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "dashboard",
    label: "대시보드",
    icon: "dashboard",
    defaultPath: "/messaging/dashboard",
  },
  {
    id: "send",
    label: "메시지 보내기",
    icon: "send",
    defaultPath: "/messaging/send/sms",
    subMenus: [
      { path: "/messaging/send/sms", label: "문자 보내기", badge: "new" },
      { path: "/messaging/send/alimtalk", label: "알림톡 보내기" },
    ],
  },
  {
    id: "address-book",
    label: "주소록",
    icon: "address-book",
    defaultPath: "/messaging/address/register",
    subMenus: [
      { path: "/messaging/address/register", label: "주소록 등록" },
      { path: "/messaging/address/list", label: "주소록 관리" },
      { path: "/messaging/address/block-list", label: "수신거부 관리" },
    ],
  },
  {
    id: "send-result",
    label: "발송결과",
    icon: "send-result",
    defaultPath: "/messaging/send-result",
  },
  {
    id: "statistics",
    label: "통계",
    icon: "statistics",
    defaultPath: "/messaging/statistics",
  },
];

export default function MessagingLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<FullPageLoader />}>
        <section className="flex min-h-0 flex-1">
          <MessagingSidebar />

          <div className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </div>
        </section>
      </Suspense>
    </div>
  );
}

function MessagingSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const isPathInSection = (item: MenuItem) => {
    if (!item.subMenus) return false;
    const basePath = item.defaultPath.replace(/\/[^/]+$/, "");
    return pathname.startsWith(basePath);
  };

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      MENU_ITEMS.filter((item) => item.subMenus).map((item) => [
        item.id,
        isPathInSection(item),
      ]),
    ),
  );

  useEffect(() => {
    setExpandedSections((prev) => {
      const next = { ...prev };
      MENU_ITEMS.filter((item) => item.subMenus).forEach((item) => {
        const basePath = item.defaultPath.replace(/\/[^/]+$/, "");
        if (pathname.startsWith(basePath)) next[item.id] = true;
      });
      return next;
    });
  }, [pathname]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="flex w-[300px] flex-col gap-1 border-r border-gray-400 p-5">
      {MENU_ITEMS.map((item) =>
        item.subMenus ? (
          <MenuSection
            key={item.id}
            icon={MENU_ICONS[item.icon]}
            label={item.label}
            isExpanded={expandedSections[item.id] ?? false}
            onToggle={() => toggleSection(item.id)}
          >
            {item.subMenus.map((sub) => (
              <MessagingNavLink
                key={sub.path}
                to={sub.path}
                text={sub.label}
                badge={sub.badge}
              />
            ))}
          </MenuSection>
        ) : (
          <MessagingNavLink
            key={item.id}
            to={item.defaultPath}
            icon={MENU_ICONS[item.icon]}
            text={item.label}
          />
        ),
      )}
    </aside>
  );
}

interface MenuSectionProps {
  icon: ReactNode;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function MenuSection({
  icon,
  label,
  isExpanded,
  onToggle,
  children,
}: MenuSectionProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-100"
      >
        {icon}
        <span className="flex-1 font-medium">{label}</span>
        {isExpanded ? (
          <ChevronUpIcon size={16} className="text-gray-600" />
        ) : (
          <ChevronDownIcon size={16} className="text-gray-600" />
        )}
      </button>
      {isExpanded && (
        <div className="ml-6 flex flex-col gap-0.5 border-l border-gray-200 pl-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface MessagingNavLinkProps {
  to: string;
  text: string;
  icon?: ReactNode;
  badge?: string;
}

function MessagingNavLink({ to, text, icon, badge }: MessagingNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[14px] text-gray-700 transition-colors",
          "hover:bg-gray-100",
          isActive && "bg-primary-50 text-primary",
        )
      }
    >
      {icon}
      <span className="flex-1">{text}</span>
      {badge && (
        <span className="bg-primary rounded px-1.5 py-0.5 text-[11px] font-medium text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
