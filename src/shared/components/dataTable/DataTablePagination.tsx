import { type Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  className?: string;
  onPageChange?: (pageIndex: number) => void;
}

// 최대 3개의 페이지 번호만 표시
const MAX_VISIBLE_PAGES = 3;

export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  // TanStack Table은 0부터 인덱스 시작하지만 UI는 1부터 표시
  const currentPageIndex = table.getState().pagination.pageIndex;
  const currentPageNumber = currentPageIndex + 1; // UI에 표시할 페이지 번호 (1부터 시작)
  const totalPages = table.getPageCount();

  // 페이지 번호 목록 생성 함수
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
    // pageNumber는 1부터 시작하는 UI 페이지 번호
    // table.setPageIndex는 0부터 시작하는 인덱스를 요구함
    const pageIndex = pageNumber - 1;
    table.setPageIndex(pageIndex);
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
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
    </div>
  );
}
