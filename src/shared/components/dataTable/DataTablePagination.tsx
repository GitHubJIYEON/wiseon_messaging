import { type Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  className?: string;
  totalCount?: number;
  pageSizeOptions?: number[];
}

const MAX_VISIBLE_PAGES = 3;

export function DataTablePagination<TData>({
  table,
  className,
  totalCount,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
  const currentPageIndex = table.getState().pagination.pageIndex;
  const currentPageNumber = currentPageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const displayTotal = totalCount ?? table.getFilteredRowModel().rows.length;

  const generatePaginationNumbers = () => {
    if (totalPages <= 0) return [];

    let startPage = Math.max(
      currentPageNumber - Math.floor(MAX_VISIBLE_PAGES / 2),
      1,
    );
    let endPage = startPage + MAX_VISIBLE_PAGES - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - MAX_VISIBLE_PAGES + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  };

  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex >= totalPages - 1;

  const handlePageChange = (pageNumber: number) => {
    table.setPageIndex(pageNumber - 1);
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* 좌: 총 개수 */}
      <span className="font-apple-medium text-[13px] text-gray-500">
        총{" "}
        <span className="font-apple-medium text-gray-600">{displayTotal}</span>
        개
      </span>

      {/* 중: 페이지네이션 */}
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => handlePageChange(currentPageNumber - 1)}
          disabled={isFirstPage}
          className="h-[28px] w-[26px]"
        >
          <span className="sr-only">이전 페이지로</span>
          <ChevronLeft />
        </Button>

        <div className="flex items-center gap-1">
          {generatePaginationNumbers().map((pageNumber) => (
            <Button
              type="button"
              key={pageNumber}
              variant={pageNumber === currentPageNumber ? "outline" : "ghost"}
              className="font-apple-medium h-[28px] w-[30px] rounded p-0 text-sm text-gray-900 transition-none"
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => handlePageChange(currentPageNumber + 1)}
          disabled={isLastPage}
          className="h-[28px] w-[26px]"
        >
          <span className="sr-only">다음 페이지로</span>
          <ChevronRight />
        </Button>
      </div>

      {/* 우: 페이지 사이즈 선택 */}
      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
            table.setPageIndex(0);
          }}
        >
          <SelectTrigger size="sm" className="h-[32px] w-fit gap-1 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-apple-medium text-[13px] text-gray-500">
          개씩 보기
        </span>
      </div>
    </div>
  );
}
