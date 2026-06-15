import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import type { AddressBookMember } from "../types/addressBookDetail";

type EditableField = keyof Pick<
  AddressBookMember,
  | "memberName"
  | "phoneNumber"
  | "position"
  | "organization"
  | "variables1"
  | "variables2"
  | "variables3"
  | "memberComment"
>;

interface SampleTableColumnsOptions {
  editMode: boolean;
  getOriginalMember: (memberId: number) => AddressBookMember | undefined;
  onCellChange: (
    memberId: number,
    field: EditableField | "isBlocked",
    value: string | boolean,
  ) => void;
}

const inputClassName =
  "h-8 border-0 bg-transparent px-2 shadow-none focus-visible:ring-1";

function isFieldDirty(
  original: AddressBookMember | undefined,
  current: AddressBookMember,
  field: keyof AddressBookMember,
) {
  return original?.[field] !== current[field];
}

function EditableTextCell({
  row,
  field,
  placeholder,
  getOriginalMember,
  onCellChange,
  type = "text",
}: {
  row: { original: AddressBookMember };
  field: EditableField;
  placeholder?: string;
  getOriginalMember: SampleTableColumnsOptions["getOriginalMember"];
  onCellChange: SampleTableColumnsOptions["onCellChange"];
  type?: "text" | "tel";
}) {
  const member = row.original;
  const original = getOriginalMember(member.memberId);
  const dirty = isFieldDirty(original, member, field);

  return (
    <Input
      type={type}
      value={member[field]}
      placeholder={placeholder}
      onChange={(e) => onCellChange(member.memberId, field, e.target.value)}
      className={cn(
        inputClassName,
        dirty && "bg-amber-50 focus-visible:ring-amber-300",
      )}
      aria-label={placeholder ?? field}
    />
  );
}

export function createSampleTableColumns({
  editMode,
  getOriginalMember,
  onCellChange,
}: SampleTableColumnsOptions): ColumnDef<AddressBookMember>[] {
  const cellProps = { getOriginalMember, onCellChange };

  return [
    {
      id: "memberName",
      header: "이름",
      accessorKey: "memberName",
      size: 120,
      cell: ({ row }) =>
        editMode ? (
          <EditableTextCell
            row={row}
            field="memberName"
            placeholder="이름"
            {...cellProps}
          />
        ) : (
          <div className="px-2">{row.original.memberName}</div>
        ),
    },
    {
      id: "phoneNumber",
      header: "전화번호",
      accessorKey: "phoneNumber",
      size: 140,
      cell: ({ row }) =>
        editMode ? (
          <EditableTextCell
            row={row}
            field="phoneNumber"
            placeholder="01012345678"
            type="tel"
            {...cellProps}
          />
        ) : (
          <div className="px-2">{row.original.phoneNumber}</div>
        ),
    },
    {
      id: "position",
      header: "직책",
      accessorKey: "position",
      size: 100,
      cell: ({ row }) =>
        editMode ? (
          <EditableTextCell
            row={row}
            field="position"
            placeholder="직책"
            {...cellProps}
          />
        ) : (
          <div className="px-2">{row.original.position || "-"}</div>
        ),
    },
    {
      id: "organization",
      header: "소속",
      accessorKey: "organization",
      size: 180,
      cell: ({ row }) =>
        editMode ? (
          <EditableTextCell
            row={row}
            field="organization"
            placeholder="소속"
            {...cellProps}
          />
        ) : (
          <div className="px-2">{row.original.organization || "-"}</div>
        ),
    },
    {
      id: "variables1",
      header: "변수1",
      accessorKey: "variables1",
      size: 180,
      cell: ({ row }) =>
        editMode ? (
          <EditableTextCell
            row={row}
            field="variables1"
            placeholder="변수1"
            {...cellProps}
          />
        ) : (
          <div className="px-2">{row.original.variables1 || "-"}</div>
        ),
    },
    {
      id: "variables2",
      header: "변수2",
      accessorKey: "variables2",
      size: 120,
      cell: ({ row }) =>
        editMode ? (
          <EditableTextCell
            row={row}
            field="variables2"
            placeholder="변수2"
            {...cellProps}
          />
        ) : (
          <div className="px-2">{row.original.variables2 || "-"}</div>
        ),
    },
    {
      id: "variables3",
      header: "변수3",
      accessorKey: "variables3",
      size: 120,
      cell: ({ row }) =>
        editMode ? (
          <EditableTextCell
            row={row}
            field="variables3"
            placeholder="변수3"
            {...cellProps}
          />
        ) : (
          <div className="px-2">{row.original.variables3 || "-"}</div>
        ),
    },
    {
      id: "isBlocked",
      header: "수신거부",
      accessorKey: "isBlocked",
      size: 80,
      cell: ({ row }) => {
        const member = row.original;
        const original = getOriginalMember(member.memberId);
        const dirty = isFieldDirty(original, member, "isBlocked");

        if (!editMode) {
          return <div>{member.isBlocked ? "Y" : "N"}</div>;
        }

        return (
          <div
            className={cn(
              "flex justify-center rounded-md py-1",
              dirty && "bg-amber-50",
            )}
          >
            <Checkbox
              checked={member.isBlocked}
              onCheckedChange={(checked) =>
                onCellChange(member.memberId, "isBlocked", !!checked)
              }
              aria-label="수신거부"
            />
          </div>
        );
      },
    },
    {
      id: "memberComment",
      header: "메모",
      accessorKey: "memberComment",
      size: 160,
      cell: ({ row }) =>
        editMode ? (
          <EditableTextCell
            row={row}
            field="memberComment"
            placeholder="메모"
            {...cellProps}
          />
        ) : (
          <div className="px-2">{row.original.memberComment || "-"}</div>
        ),
    },
  ];
}
