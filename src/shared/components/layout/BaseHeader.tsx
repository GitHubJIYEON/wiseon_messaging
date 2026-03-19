import {
  ChevronsUpDown,
  CircleHelpIcon,
  EllipsisVerticalIcon,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
// import arrowDown from "@/assets/icons/arrowDown.svg";
import logo from "@/assets/icons/logo.svg";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

const navigationList = [
  { text: "발송 관리", path: "/messaging" },
  { text: "잔액 확인", path: "/point" },
];

const dropdownMenuList = [
  {
    text: "설문",
    path: import.meta.env.VITE_SURVEY_URL,
  },
  {
    text: "분석",
    path: import.meta.env.VITE_ANALYSIS_URL,
  },
];

export function BaseHeader() {
  return (
    <header className="flex h-(--header-height) min-w-[1200px] shrink-0 items-center border-b border-gray-400">
      <nav className="flex h-full w-full items-center">
        <Link
          to="/create"
          className="flex h-full w-[300px] items-center justify-center border-r border-gray-400"
        >
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-[100px] cursor-pointer"
          />
        </Link>

        <Popover>
          <PopoverTrigger asChild>
            <div className="flex h-full w-[216px] items-center justify-between border-r border-gray-400 px-5">
              <h1 className="font-apple-medium text-lg">발송 서비스</h1>
              <ChevronsUpDown size={20} className="text-gray-600" />
              {/* <img src={arrowDown} alt="Arrow Down" width={10} height={20} /> */}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[216px] rounded-none p-5"
            align="start"
            sideOffset={0}
          >
            <ul className="font-apple-medium flex flex-col gap-[14.25px] px-[8.5px] text-base text-gray-900">
              {dropdownMenuList.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.path}
                    rel="noopener"
                    className="inline-block w-full"
                    target="_blank"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <ul className="ml-[30px] flex h-full shrink-0 items-center justify-center gap-[30px]">
          {navigationList.map((item) => (
            <li
              key={item.path}
              className="font-apple-medium flex h-full px-2.5 text-lg"
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex h-full items-center border-b-2",
                    isActive
                      ? "text-primary border-primary"
                      : "border-transparent",
                  )
                }
              >
                {item.text}
              </NavLink>
            </li>
          ))}
        </ul>

        <LogoutButton />
      </nav>
    </header>
  );
}

function LogoutButton() {
  const navigate = useNavigate();

  // const { mutate: logout } = useLogoutMutation();

  const onLogout = async () => {
    console.log("로그아웃 클릭");
  };

  return (
    <div className="ml-auto flex h-full items-center gap-2.5 pr-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="https://www.wiseon.io/guide"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CircleHelpIcon size={18} className="text-gray-500" />
          </a>
        </TooltipTrigger>
        <TooltipContent>가이드사이트로 이동</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex cursor-pointer">
          <EllipsisVerticalIcon
            size={24}
            className="text-gray-500"
            strokeWidth={2}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" alignOffset={-70}>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            프로필 수정
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout}>로그아웃</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
