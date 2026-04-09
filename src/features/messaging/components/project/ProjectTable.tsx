import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import type { Project } from "./projectData";
import { MOCK_ORGANIZATIONS, MOCK_PROJECTS } from "./projectData";

const orgMap = new Map(
  MOCK_ORGANIZATIONS.map((o) => [o.organizationId, o.organizationName]),
);

const formatDateTime = (value: string) =>
  format(new Date(value), "yyyy.MM.dd HH:mm");

const ServiceBadge = ({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) => (
  <Badge
    variant="outline"
    className={cn(
      "min-w-[56px] text-[12px]",
      active
        ? "border-green-200 bg-green-50 text-green-600"
        : "border-gray-200 bg-gray-100 text-gray-400",
    )}
  >
    {active ? "사용" : "미사용"}
    {" · "}
    {label}
  </Badge>
);

interface ProjectTableProps {
  data?: Project[];
}

export default function ProjectTable({
  data: externalData,
}: ProjectTableProps) {
  const navigate = useNavigate();
  const [internalData] = useState<Project[]>(MOCK_PROJECTS);
  const data = externalData ?? internalData;

  const [searchInput, setSearchInput] = useState("");

  const filteredData = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter(
      (item) =>
        item.projectName.toLowerCase().includes(keyword) ||
        item.projectDesc.toLowerCase().includes(keyword) ||
        (orgMap.get(item.organizationId) ?? "").toLowerCase().includes(keyword),
    );
  }, [data, searchInput]);

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: "organizationId",
        accessorKey: "organizationId",
        header: "기관",
        size: 180,
        cell: ({ row }) => {
          const orgName = orgMap.get(row.getValue<string>("organizationId"));
          return (
            <div className="px-2.5 text-start text-[13px] text-gray-700">
              {orgName ?? <span className="text-gray-400">-</span>}
            </div>
          );
        },
      },
      {
        id: "projectName",
        accessorKey: "projectName",
        header: "프로젝트명",
        size: 180,
        cell: ({ row }) => (
          <div className="px-2.5 font-medium text-gray-900">
            {row.getValue<string>("projectName")}
          </div>
        ),
      },

      {
        id: "projectDesc",
        accessorKey: "projectDesc",
        header: "프로젝트 설명",
        size: 240,
        cell: ({ row }) => (
          <div className="max-w-[240px] truncate px-2.5 text-gray-600">
            {row.getValue<string>("projectDesc") || (
              <span className="text-gray-400">-</span>
            )}
          </div>
        ),
      },
      {
        id: "useSms",
        accessorKey: "useSms",
        header: "SMS",
        size: 110,
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2.5">
            <ServiceBadge
              active={row.getValue<boolean>("useSms")}
              label="SMS"
            />
          </div>
        ),
      },
      {
        id: "useKkoBizMsg",
        accessorKey: "useKkoBizMsg",
        header: "알림톡",
        size: 110,
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2.5">
            <ServiceBadge
              active={row.getValue<boolean>("useKkoBizMsg")}
              label="알림톡"
            />
          </div>
        ),
      },
      {
        id: "createTime",
        accessorKey: "createTime",
        header: "생성일",
        size: 150,
        cell: ({ row }) => (
          <div className="px-2.5 text-center text-[13px] text-gray-600">
            {formatDateTime(row.getValue<string>("createTime"))}
          </div>
        ),
      },
      {
        id: "actions",
        header: "관리",
        size: 100,
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center px-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-[13px]"
              onClick={() =>
                navigate(
                  `/messaging/admin/organization-management/${row.original.projectId}`,
                )
              }
            >
              상세보기
            </Button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    meta: { totalCount: filteredData.length },
    getRowId: (row) => row.projectId,
  });

  return (
    <DataTable table={table} className="bg-white">
      <section className="mb-2.5 flex items-center justify-between">
        <h2 className="font-apple-medium text-lg text-gray-700">
          총 {filteredData.length}개
        </h2>
        <div className="flex h-10 items-center gap-1">
          <Input
            placeholder="프로젝트명, 기관명 또는 설명"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-[42px] w-[260px] rounded text-[13px]/5 text-gray-700 placeholder:text-gray-500"
          />
          <Button
            type="button"
            variant="outline"
            className="font-apple-medium h-[42px] w-[76px] rounded text-[14px]/[24px] text-gray-700"
            onClick={() => setSearchInput("")}
          >
            초기화
          </Button>
        </div>
      </section>
    </DataTable>
  );
}
