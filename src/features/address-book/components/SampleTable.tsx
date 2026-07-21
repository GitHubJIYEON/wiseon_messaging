import { useCallback, useMemo, useState } from "react";
import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { Download, Eye, Plus, SquarePen, Trash2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/dataTable/DataTable";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useDataTable } from "@/shared/hooks/dataTable/useDataTable";
import { useAddressBookDetailQuery } from "../hooks/queries/useAddressBookDetailQuery";
import type { AddressBookMember } from "../types/addressBookDetail";

const PER_PAGE = 10;
const MAX_ROW_COUNT = 1000;
const MAX_COLUMN_COUNT = 12;

const inputClassName =
  "h-8 w-full min-w-[80px] border bg-transparent px-2 shadow-none focus-visible:ring-1";

type EditableField = keyof Pick<
  AddressBookMember,
  | "phoneNumber"
  | "position"
  | "organization"
  | "variables1"
  | "variables2"
  | "variables3"
>;

type ColumnKey = EditableField | `custom_${string}`;

type EditMember = AddressBookMember & {
  customFields?: Record<string, string>;
};

interface EditColumnDef {
  id: string;
  key: ColumnKey;
  label: string;
  placeholder: string;
  type?: "text" | "tel";
  removable: boolean;
}

const DEFAULT_EDIT_COLUMNS: EditColumnDef[] = [
  {
    id: "phoneNumber",
    key: "phoneNumber",
    label: "전화번호",
    placeholder: "01012345678",
    type: "tel",
    removable: false,
  },
  {
    id: "position",
    key: "position",
    label: "직책",
    placeholder: "직책",
    removable: true,
  },
  {
    id: "organization",
    key: "organization",
    label: "소속",
    placeholder: "소속",
    removable: true,
  },
  {
    id: "variables1",
    key: "variables1",
    label: "변수1",
    placeholder: "변수1",
    removable: true,
  },
  {
    id: "variables2",
    key: "variables2",
    label: "변수2",
    placeholder: "변수2",
    removable: true,
  },
  {
    id: "variables3",
    key: "variables3",
    label: "변수3",
    placeholder: "변수3",
    removable: true,
  },
];

function toEditMember(member: AddressBookMember): EditMember {
  return { ...member, customFields: {} };
}

function getCellValue(member: EditMember, key: ColumnKey): string {
  if (key.startsWith("custom_")) {
    return member.customFields?.[key] ?? "";
  }
  return member[key as EditableField] ?? "";
}

function createEmptyMember(
  groupId: number,
  memberId: number,
  columns: EditColumnDef[],
): EditMember {
  const now = new Date().toISOString();
  const customFields = Object.fromEntries(
    columns
      .filter((column) => column.key.startsWith("custom_"))
      .map((column) => [column.key, ""]),
  );

  return {
    groupId,
    memberId,
    memberName: "",
    phoneNumber: "",
    position: "",
    organization: "",
    variables1: "",
    variables2: "",
    variables3: "",
    isBlocked: false,
    memberComment: "",
    createdAt: now,
    updatedAt: now,
    customFields,
  };
}

const columns: ColumnDef<AddressBookMember>[] = [
  {
    id: "phoneNumber",
    header: "전화번호",
    accessorKey: "phoneNumber",
    size: 140,
    cell: ({ row }) => <div>{row.original.phoneNumber}</div>,
  },
  {
    id: "position",
    header: "직책",
    accessorKey: "position",
    size: 100,
    cell: ({ row }) => <div>{row.original.position || "-"}</div>,
  },
  {
    id: "organization",
    header: "소속",
    accessorKey: "organization",
    size: 180,
    cell: ({ row }) => <div>{row.original.organization || "-"}</div>,
  },
  {
    id: "variables1",
    header: "변수1",
    accessorKey: "variables1",
    size: 180,
    cell: ({ row }) => <div>{row.original.variables1 || "-"}</div>,
  },
  {
    id: "variables2",
    header: "변수2",
    accessorKey: "variables2",
    size: 120,
    cell: ({ row }) => <div>{row.original.variables2 || "-"}</div>,
  },
  {
    id: "variables3",
    header: "변수3",
    accessorKey: "variables3",
    size: 120,
    cell: ({ row }) => <div>{row.original.variables3 || "-"}</div>,
  },
];

export default function SampleTable() {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);
  const [editMode, setEditMode] = useState(false);
  const [editMembers, setEditMembers] = useState<EditMember[]>([]);
  const [editColumns, setEditColumns] =
    useState<EditColumnDef[]>(DEFAULT_EDIT_COLUMNS);
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data: addressBookDetail, isPending } =
    useAddressBookDetailQuery(groupId);

  const members = addressBookDetail?.members ?? [];
  const displayMembers = editMode ? editMembers : members;
  const pageCount = Math.max(1, Math.ceil(displayMembers.length / PER_PAGE));

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return displayMembers.slice(start, start + PER_PAGE);
  }, [displayMembers, page]);

  const handleCellChange = useCallback(
    (memberId: number, key: ColumnKey, value: string) => {
      setEditMembers((prev) =>
        prev.map((member) => {
          if (member.memberId !== memberId) return member;

          if (key.startsWith("custom_")) {
            return {
              ...member,
              customFields: { ...member.customFields, [key]: value },
            };
          }

          return { ...member, [key]: value };
        }),
      );
    },
    [],
  );

  const handleAddRow = useCallback(() => {
    setEditMembers((prev) => {
      if (prev.length >= MAX_ROW_COUNT) {
        toast.error(`최대 ${MAX_ROW_COUNT}행까지 추가할 수 있습니다.`);
        return prev;
      }

      const nextMemberId =
        Math.min(0, ...prev.map((member) => member.memberId)) - 1;
      return [...prev, createEmptyMember(groupId, nextMemberId, editColumns)];
    });
  }, [editColumns, groupId]);

  const handleRemoveRow = useCallback((memberId: number) => {
    setEditMembers((prev) => {
      if (prev.length <= 1) {
        toast.error("최소 1개 행은 유지해야 합니다.");
        return prev;
      }
      return prev.filter((member) => member.memberId !== memberId);
    });
  }, []);

  const handleAddColumn = useCallback(() => {
    setEditColumns((prev) => {
      if (prev.length >= MAX_COLUMN_COUNT) {
        toast.error(`최대 ${MAX_COLUMN_COUNT}열까지 추가할 수 있습니다.`);
        return prev;
      }

      const customKey = `custom_${crypto.randomUUID()}` as const;
      const customCount = prev.filter((column) =>
        column.key.startsWith("custom_"),
      ).length;

      const newColumn: EditColumnDef = {
        id: customKey,
        key: customKey,
        label: `변수 ${customCount + 4}`,
        placeholder: "값 입력",
        removable: true,
      };

      setEditMembers((members) =>
        members.map((member) => ({
          ...member,
          customFields: { ...member.customFields, [customKey]: "" },
        })),
      );

      return [...prev, newColumn];
    });
  }, []);

  const handleRemoveColumn = useCallback((columnId: string) => {
    setEditColumns((prev) => {
      const target = prev.find((column) => column.id === columnId);
      if (!target?.removable) return prev;

      if (target.key.startsWith("custom_")) {
        setEditMembers((members) =>
          members.map((member) => {
            const { [target.key]: _removed, ...rest } =
              member.customFields ?? {};
            return { ...member, customFields: rest };
          }),
        );
      }

      return prev.filter((column) => column.id !== columnId);
    });
  }, []);

  const handleColumnLabelChange = useCallback(
    (columnId: string, label: string) => {
      setEditColumns((prev) =>
        prev.map((column) =>
          column.id === columnId ? { ...column, label } : column,
        ),
      );
    },
    [],
  );

  const handleEnterEditMode = () => {
    const snapshot = members.map(toEditMember);
    setEditMembers(
      snapshot.length > 0
        ? snapshot
        : [createEmptyMember(groupId, -1, DEFAULT_EDIT_COLUMNS)],
    );
    setEditColumns(DEFAULT_EDIT_COLUMNS);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditMembers([]);
    setEditColumns(DEFAULT_EDIT_COLUMNS);
  };

  const handleSave = () => {
    // TODO: 저장 API 연동
    toast.success("구성원 정보가 저장되었습니다.");
    setEditMode(false);
    setEditMembers([]);
    setEditColumns(DEFAULT_EDIT_COLUMNS);
  };

  const handleToggleMode = () => {
    if (editMode) {
      handleCancelEdit();
      return;
    }
    handleEnterEditMode();
  };

  const { table } = useDataTable({
    data: paginatedMembers,
    columns,
    pageCount,
    meta: {
      totalCount: displayMembers.length,
    },
    getRowId: (row) => String(row.memberId),
  });

  if (isPending) {
    return (
      <div className="rounded-md bg-white p-7 text-center text-gray-500">
        로딩 중...
      </div>
    );
  }

  const downloadExcel = () => {
    console.log("엑셀 다운로드");
  };

  return (
    <div className="rounded-md bg-white p-7">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {addressBookDetail?.groupName ?? "그룹 상세"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadExcel}>
            <Download /> 엑셀 다운로드
          </Button>
          <Button type="button" variant="dark" onClick={handleToggleMode}>
            {editMode ? (
              <span className="flex items-center gap-2">
                <Eye /> 보기모드
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SquarePen />
                편집모드
              </span>
            )}
          </Button>
        </div>
        {/* <div className="flex items-center space-x-2 border">
          <Switch id="edit-mode" />
          <Label htmlFor="edit-mode">편집모드</Label>
        </div> */}
      </div>

      {editMode ? (
        <EditModeTable
          members={editMembers}
          columns={editColumns}
          onCellChange={handleCellChange}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onAddColumn={handleAddColumn}
          onRemoveColumn={handleRemoveColumn}
          onColumnLabelChange={handleColumnLabelChange}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      ) : (
        <ViewModeTable table={table} totalCount={displayMembers.length} />
      )}
    </div>
  );
}

interface EditModeTableProps {
  members: EditMember[];
  columns: EditColumnDef[];
  onCellChange: (memberId: number, key: ColumnKey, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (memberId: number) => void;
  onAddColumn: () => void;
  onRemoveColumn: (columnId: string) => void;
  onColumnLabelChange: (columnId: string, label: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditModeTable({
  members,
  columns,
  onCellChange,
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
  onColumnLabelChange,
  onSave,
  onCancel,
}: EditModeTableProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="border-primary-500 bg-primary-50 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3">
        <p className="text-primary-500 font-apple-medium text-sm">
          엑셀처럼 셀을 수정하고, 행·열을 추가할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddColumn}
          >
            <Plus className="size-4" />열 추가
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onAddRow}>
            <Plus className="size-4" />행 추가
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            취소
          </Button>
          <Button type="button" size="sm" onClick={onSave}>
            저장
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className="font-apple-medium text-point-gray-700 min-w-[120px] p-2 text-center text-[14px] leading-6"
                >
                  <div className="flex items-center justify-center gap-1">
                    {column.removable ? (
                      <Input
                        value={column.label}
                        onChange={(e) =>
                          onColumnLabelChange(column.id, e.target.value)
                        }
                        className="h-7 w-full max-w-[100px] bg-transparent px-1 text-center text-[13px] shadow-none focus-visible:ring-1"
                        aria-label="열 이름"
                      />
                    ) : (
                      <span>{column.label}</span>
                    )}
                    {column.removable && (
                      <button
                        type="button"
                        onClick={() => onRemoveColumn(column.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                        title="열 삭제"
                        aria-label={`${column.label} 열 삭제`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[52px] p-2 text-center">
                <button
                  type="button"
                  onClick={onAddColumn}
                  className="inline-flex rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  title="열 추가"
                  aria-label="열 추가"
                >
                  <Plus className="size-4" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, rowIndex) => (
              <TableRow
                key={member.memberId}
                className={cn(rowIndex % 2 === 1 && "bg-gray-50/50")}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} className="p-1">
                    <Input
                      type={column.type ?? "text"}
                      value={getCellValue(member, column.key)}
                      placeholder={column.placeholder}
                      onChange={(e) =>
                        onCellChange(
                          member.memberId,
                          column.key,
                          e.target.value,
                        )
                      }
                      className={inputClassName}
                      aria-label={`${column.label} ${rowIndex + 1}행`}
                    />
                  </TableCell>
                ))}
                <TableCell className="p-1 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(member.memberId)}
                    className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-red-500"
                    title="행 삭제"
                    aria-label={`${rowIndex + 1}행 삭제`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="p-0">
                <button
                  type="button"
                  onClick={onAddRow}
                  className="text-point-gray-500 hover:bg-primary-50 hover:text-primary-500 flex h-10 w-full items-center justify-center gap-1 text-sm transition-colors"
                >
                  <Plus className="size-4" />행 추가
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <p className="text-point-gray-500 text-xs">
        총 {members.length}행 · {columns.length}열
      </p>
    </div>
  );
}

interface ViewModeTableProps {
  table: TanstackTable<AddressBookMember>;
  totalCount: number;
}

function ViewModeTable({ table, totalCount }: ViewModeTableProps) {
  return <DataTable table={table} totalCount={totalCount} />;
}
