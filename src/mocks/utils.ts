import { HttpResponse } from "msw";

export const API_BASE = "/api/v1";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
};

export function ok<T>(data: T, message = "") {
  return HttpResponse.json({
    success: true,
    code: 0,
    message,
    data,
  });
}

export function created<T>(data: T, message = "") {
  return HttpResponse.json(
    { success: true, code: 0, message, data },
    { status: 201 },
  );
}

export function notFound(message: string) {
  return HttpResponse.json(
    { success: false, code: 404, message, data: null },
    { status: 404 },
  );
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PageResponse<T> {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const content = items.slice(start, start + pageSize);

  return {
    content,
    totalElements,
    totalPages,
    page: safePage,
    pageSize,
    size: pageSize,
    number: safePage,
    numberOfElements: content.length,
    first: safePage === 1,
    last: safePage === totalPages,
  };
}

export function getSearchKeyword(url: URL) {
  return (
    url.searchParams.get("keyword") ??
    url.searchParams.get("q") ??
    url.searchParams.get("search") ??
    ""
  ).trim();
}

export function getPaginationParams(url: URL) {
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(
    url.searchParams.get("pageSize") ?? url.searchParams.get("size") ?? "10",
  );

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
  };
}
