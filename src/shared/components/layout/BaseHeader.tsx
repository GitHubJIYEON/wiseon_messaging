import {
  Bell,
  Check,
  ChevronsUpDown,
  CircleHelpIcon,
  EllipsisVerticalIcon,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
// import arrowDown from "@/assets/icons/arrowDown.svg";
import logo from "@/assets/icons/logo.svg";
import mockNotification from "@/data/notification.json";
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
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Button } from "../ui/button";

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

const navigationList = [{ text: "발송 서비스", path: "/dashboard" }];

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
    <div className="ml-auto flex h-full items-center gap-2.5 pr-4">
      {/* 알림 팝오버 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="cursor-pointer">
            <Bell size={20} className="text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="h-[620px] w-[420px] p-7">
          <PopoverHeader>
            <PopoverTitle className="flex items-center justify-between">
              <p className="text-lg">알림</p>
              <Button variant="outline">
                <Check />
                모두 읽음
              </Button>
            </PopoverTitle>
            <PopoverDescription className="mt-5">
              <div>
                <ScrollArea className="h-[500px]">
                  <ul>
                    {mockNotification.notifications.map((notification) => (
                      <li
                        key={notification.notificationId}
                        className="flex max-w-[360px] gap-2 rounded-xs border-b border-gray-400 p-2.5 hover:bg-gray-100"
                      >
                        {notification.isRead === "Y" ? (
                          <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                        ) : (
                          <div className="mt-1 h-2 w-2 rounded-full bg-red-600" />
                        )}
                        <div className="flex flex-col gap-1">
                          <p className="text-medium max-w-[320px] truncate text-black">
                            {notification.title}
                          </p>
                          <p className="text-medium max-w-[320px] truncate text-gray-700">
                            {notification.body}
                          </p>
                          <p className="text-sm text-gray-500">___일 전</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
      {/* 가이드 툴팁 */}
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
      {/* 더보기 드롭다운 */}
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
