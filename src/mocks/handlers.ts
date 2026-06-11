import { http } from "msw";
import callingNumberDetailData from "@/features/calling-number/data/callingNumberDetail.json";
import callingNumbersData from "@/features/calling-number/data/callingNumbers.json";
import type { CallingNumber } from "@/features/calling-number/types";
import messageResultDetailsData from "@/features/message-results/data/message-result-details.json";
import messageResultsData from "@/features/message-results/data/message-results.json";
import type {
  MessageResultDetail,
  MessageResultItem,
} from "@/features/message-results/types";
import unsubscribesData from "@/features/unsubscribes/data/unsubscribes.json";
import type { BlockItem } from "@/features/unsubscribes/types";
import { addressBookHandlers } from "./handlers/addressBookHandlers";
import {
  API_BASE,
  created,
  getPaginationParams,
  getSearchKeyword,
  notFound,
  ok,
  paginate,
} from "./utils";

type MessageResultDetailMeta = Omit<
  MessageResultDetail,
  keyof MessageResultItem
>;

let callingNumbers: CallingNumber[] = structuredClone(
  callingNumbersData as CallingNumber[],
);
const blockList: BlockItem[] = structuredClone(unsubscribesData.blockList);
const messageResults = structuredClone(
  messageResultsData.list,
) as MessageResultItem[];
const messageResultDetails = structuredClone(
  messageResultDetailsData.details,
) as (MessageResultDetailMeta & { id: number })[];

function buildMessageResultDetail(id: number): MessageResultDetail | undefined {
  const item = messageResults.find((entry) => entry.id === id);
  const meta = messageResultDetails.find((entry) => entry.id === id);

  if (!item || !meta) return undefined;

  const { id: _id, ...rest } = meta;
  return { ...item, ...rest };
}

export const handlers = [
  ...addressBookHandlers,

  // ── 발신 번호 ───────────────────────────────────────────
  http.get(`${API_BASE}/calling-numbers`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = getSearchKeyword(url);
    const { page, pageSize } = getPaginationParams(url);

    const filtered = callingNumbers.filter((item) =>
      !keyword
        ? true
        : item.phoneNumber.includes(keyword) ||
          item.name.includes(keyword) ||
          item.status.includes(keyword),
    );

    return ok(paginate(filtered, page, pageSize));
  }),

  http.get(`${API_BASE}/calling-numbers/:id`, ({ params }) => {
    const id = Number(params.id);
    const detail = callingNumberDetailData.find(
      (item) => item.senderNumberId === id,
    );

    if (!detail) return notFound("발신 번호 상세 정보를 찾을 수 없습니다.");

    return ok(detail);
  }),

  http.patch(
    `${API_BASE}/calling-numbers/:id/usage`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const index = callingNumbers.findIndex((item) => item.id === id);

      if (index === -1) return notFound("발신 번호를 찾을 수 없습니다.");

      const body = (await request.json()) as { usageEnabled: boolean };
      callingNumbers[index] = {
        ...callingNumbers[index],
        usageEnabled: body.usageEnabled,
      };

      return ok(callingNumbers[index]);
    },
  ),

  http.post(`${API_BASE}/calling-numbers`, async ({ request }) => {
    const contentType = request.headers.get("content-type") ?? "";
    let payload: Record<string, unknown>;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      payload = (await request.json()) as Record<string, unknown>;
    }

    const nextId = Math.max(0, ...callingNumbers.map((item) => item.id)) + 1;
    const newCallingNumber: CallingNumber = {
      id: nextId,
      phoneNumber: String(payload.telNo ?? payload.phoneNumber ?? ""),
      name: String(payload.ownerName ?? payload.name ?? "신규 발신번호"),
      registeredAt: new Date().toISOString(),
      certExpiredAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 365,
      ).toISOString(),
      status: "검수중",
      usageEnabled: false,
    };

    callingNumbers = [newCallingNumber, ...callingNumbers];

    return created(newCallingNumber, "발신번호 등록 신청이 접수되었습니다.");
  }),

  // ── 수신거부 ────────────────────────────────────────────
  http.get(`${API_BASE}/unsubscribes/080-number`, () => {
    return ok({ numberOf080: unsubscribesData.numberOf080 });
  }),

  http.get(`${API_BASE}/unsubscribes`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = getSearchKeyword(url);
    const { page, pageSize } = getPaginationParams(url);

    const filtered = blockList.filter((item) =>
      !keyword
        ? true
        : item.phoneNumber.includes(keyword) ||
          item.senderNumber.includes(keyword) ||
          item.blockType.includes(keyword),
    );

    return ok(paginate(filtered, page, pageSize));
  }),

  // ── 발송 결과 ───────────────────────────────────────────
  http.get(`${API_BASE}/message-results`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = getSearchKeyword(url);
    const { page, pageSize } = getPaginationParams(url);
    const status = url.searchParams.get("status");

    const filtered = messageResults.filter((item) => {
      const matchesKeyword =
        !keyword ||
        item.messageBody.includes(keyword) ||
        item.senderNumber.includes(keyword);
      const matchesStatus = !status || item.status === status;
      return matchesKeyword && matchesStatus;
    });

    return ok(paginate(filtered, page, pageSize));
  }),

  http.get(`${API_BASE}/message-results/:id`, ({ params }) => {
    const id = Number(params.id);
    const detail = buildMessageResultDetail(id);

    if (!detail) return notFound("발송 결과를 찾을 수 없습니다.");

    return ok(detail);
  }),
];
