import { Suspense, useState, type ReactNode } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CreditCardIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MailCheck,
  PhoneIcon,
  PhoneOffIcon,
  PieChartIcon,
  SendIcon,
  ShieldUser,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FullPageLoader } from "@/shared/components/FullPageLoader";

interface SubMenuItem {
  path: string;
  label: string;
  badge?: string;
}

type MenuIconId =
  | "dashboard"
  | "send"
  | "address"
  | "block-address"
  | "send-result"
  | "statistics"
  | "calling-number"
  | "payment"
  | "admin";

interface MenuItem {
  id: string;
  label: string;
  icon: MenuIconId;
  defaultPath: string;
  subMenus?: SubMenuItem[];
}

const MENU_ICONS: Record<MenuIconId, ReactNode> = {
  dashboard: <LayoutDashboardIcon size={18} />,
  send: <SendIcon size={18} />,
  address: <FileTextIcon size={18} />,
  "block-address": <PhoneOffIcon size={18} />,
  "send-result": <MailCheck size={18} />,
  "calling-number": <PhoneIcon size={18} />,
  statistics: <PieChartIcon size={18} />,
  payment: <CreditCardIcon size={18} />,
  admin: <ShieldUser size={20} />,
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
    subMenus: [{ path: "/messaging/send/sms", label: "문자 보내기" }],
  },
  {
    id: "address",
    label: "주소록",
    icon: "address",
    defaultPath: "/messaging/address/register",
    subMenus: [
      { path: "/messaging/address/register", label: "주소록 등록" },
      { path: "/messaging/address/list", label: "주소록 관리" },
      { path: "/messaging/address/block-list", label: "수신거부 관리" },
    ],
  },
  {
    id: "block-address",
    label: "수신거부 관리",
    icon: "block-address",
    defaultPath: "/messaging/block-address/list",
    subMenus: [
      { path: "/messaging/block-address/list", label: "수신거부 등록 전" },
      { path: "/messaging/block-address/register", label: "수신거부 등록 후" },
    ],
  },

  {
    id: "send-result",
    label: "발송 결과",
    icon: "send-result",
    defaultPath: "/messaging/send-result",
  },
  {
    id: "calling-number",
    label: "발신번호",
    icon: "calling-number",
    defaultPath: "/messaging/calling-number",
    subMenus: [
      { path: "/messaging/calling-number/list", label: "발신번호 관리" },
      { path: "/messaging/calling-number/register", label: "발신번호 신청" },
    ],
  },
  {
    id: "statistics",
    label: "통계",
    icon: "statistics",
    defaultPath: "/messaging/statistics",
  },
  {
    id: "payment",
    label: "충전하기",
    icon: "payment",
    defaultPath: "/messaging/payment/charge",
    subMenus: [
      { path: "/messaging/payment/charge", label: "충전하기" },
      { path: "/messaging/payment/history", label: "사용내역" },
    ],
  },
  {
    id: "admin",
    label: "발송 서비스 관리자",
    icon: "admin",
    defaultPath: "/messaging/admin/dashboard",
    subMenus: [
      { path: "/messaging/admin/dashboard", label: "발송 서비스 통계" },
      {
        path: "/messaging/admin/organization-management",
        label: "발송 프로젝트 기관 관리",
      },
      {
        path: "/messaging/admin/calling-number-management",
        label: "발신 번호 관리",
      },
      {
        path: "/messaging/admin/price-management/charge",
        label: "요금 관리 - 충전하기",
      },
      {
        path: "/messaging/admin/price-management/status",
        label: "판매 관리 - 요금 현황",
      },
    ],
  },
];

export default function MessagingLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<FullPageLoader />}>
        <section className="flex min-h-0 flex-1">
          <MessagingSidebar />

          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </section>
      </Suspense>
    </div>
  );
}

function MessagingSidebar() {
  const { pathname } = useLocation();

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

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setExpandedSections((prev) => {
      const next = { ...prev };
      MENU_ITEMS.filter((item) => item.subMenus).forEach((item) => {
        const basePath = item.defaultPath.replace(/\/[^/]+$/, "");
        if (pathname.startsWith(basePath)) next[item.id] = true;
      });
      return next;
    });
  }

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
        className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[16px] text-gray-700 hover:bg-gray-100"
      >
        {icon}
        <span className="flex-1">{label}</span>
        {isExpanded ? (
          <ChevronUpIcon size={16} className="text-gray-500" />
        ) : (
          <ChevronDownIcon size={16} className="text-gray-500" />
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
          "flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-gray-700 transition-colors",
          "hover:bg-gray-100",
          icon ? "text-[16px]" : "text-[14px]",
          isActive && "bg-primary-50 text-primary",
        )
      }
    >
      {icon}
      <span className="flex-1">{text}</span>
      {badge && (
        <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
