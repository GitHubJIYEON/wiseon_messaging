import { http } from "msw";
import addressbookData from "@/features/address-book/data/addressbook.json";
import {
  API_BASE,
  created,
  getPaginationParams,
  getSearchKeyword,
  notFound,
  ok,
  paginate,
} from "../utils";

type AddressBookGroup = (typeof addressbookData)[number];
type AddressBookMember = AddressBookGroup["members"][number] & {
  address?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

const addressBooks: AddressBookGroup[] = structuredClone(addressbookData);

function toAddressBookMember(
  member: AddressBookGroup["members"][number],
  groupRegisteredAt: string,
): AddressBookMember {
  return {
    ...member,
    address: "서울시 강남구 역삼동",
    memo: "메모",
    createdAt: groupRegisteredAt,
    updatedAt: groupRegisteredAt,
  };
}

function toAddressBookDetailMember(
  member: AddressBookGroup["members"][number],
  groupId: number,
  registeredAt: string,
) {
  return {
    groupId,
    memberId: member.id,
    phoneNumber: member.phoneNumber,
    memberName: member.name,
    position: "",
    organization: "",
    variables1: member.email,
    variables2: "",
    variables3: "",
    isBlocked: false,
    memberComment: "",
    createdAt: registeredAt,
    updatedAt: registeredAt,
  };
}

export const addressBookHandlers = [
  http.get(`${API_BASE}/address-books/groups`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = getSearchKeyword(url);
    const { page, pageSize } = getPaginationParams(url);

    const filtered = addressBooks.filter((group) =>
      !keyword ? true : group.groupName.includes(keyword),
    );

    const summaries = filtered.map(
      ({ members: _members, registeredAt, ...group }) => ({
        ...group,
        createdAt: registeredAt,
        updatedAt: registeredAt,
      }),
    );
    return ok(paginate(summaries, page, pageSize));
  }),

  http.get(`${API_BASE}/address-books/members/:groupId`, ({ params }) => {
    const groupId = Number(params.groupId);
    const group = addressBooks.find((item) => item.groupId === groupId);

    if (!group) return notFound("주소록을 찾을 수 없습니다.");

    return ok({
      groupId: group.groupId,
      groupName: group.groupName,
      members: group.members.map((member) =>
        toAddressBookDetailMember(member, group.groupId, group.registeredAt),
      ),
    });
  }),

  http.get(`${API_BASE}/address-books/:id`, ({ params }) => {
    const id = Number(params.id);
    const group = addressBooks.find((item) => item.groupId === id);

    if (!group) return notFound("주소록을 찾을 수 없습니다.");

    const { members: _members, ...summary } = group;
    return ok(summary);
  }),

  http.get(`${API_BASE}/address-books/:id/members`, ({ params, request }) => {
    const id = Number(params.id);
    const group = addressBooks.find((item) => item.groupId === id);

    if (!group) return notFound("주소록을 찾을 수 없습니다.");

    const url = new URL(request.url);
    const keyword = getSearchKeyword(url);
    const { page, pageSize } = getPaginationParams(url);

    const members = group.members
      .map((member) => toAddressBookMember(member, group.registeredAt))
      .filter((member) =>
        !keyword
          ? true
          : member.name.includes(keyword) ||
            member.phoneNumber.includes(keyword),
      );

    return ok(paginate(members, page, pageSize));
  }),

  // 그룹 추가
  http.post(`${API_BASE}/address-books/groups`, async ({ request }) => {
    const body = (await request.json()) as { groupName: string };
    const nextId = Math.max(0, ...addressBooks.map((item) => item.groupId)) + 1;

    const now = new Date().toISOString();
    const newGroup: AddressBookGroup = {
      groupId: nextId,
      groupName: body.groupName,
      groupCount: 0,
      registeredAt: now,
      members: [],
    };

    addressBooks.push(newGroup);
    return created(
      {
        groupId: nextId,
        groupName: body.groupName,
        createdAt: now,
        updatedAt: now,
      },
      "그룹이 추가되었습니다.",
    );
  }),

  // 그룹 삭제
  http.delete(`${API_BASE}/address-books/groups`, async ({ request }) => {
    const ids = (await request.json()) as number[];

    ids.forEach((id) => {
      const index = addressBooks.findIndex((item) => item.groupId === id);
      if (index !== -1) addressBooks.splice(index, 1);
    });

    return ok(null, `${ids.length}건 그룹이 삭제되었습니다.`);
  }),

  // 구성원 추가
  http.post(
    `${API_BASE}/address-books/:id/members`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const group = addressBooks.find((item) => item.groupId === id);

      if (!group) return notFound("주소록을 찾을 수 없습니다.");

      const body = (await request.json()) as {
        rows?: Array<{ name: string; phone: string }>;
      };

      const rows = body.rows ?? [];
      const nextId =
        Math.max(
          0,
          ...addressBooks.flatMap((item) => item.members.map((m) => m.id)),
        ) + 1;

      const createdMembers = rows.map((row, index) => ({
        id: nextId + index,
        name: row.name,
        phoneNumber: row.phone.replace(/\D/g, ""),
        email: `${row.name.toLowerCase()}@example.com`,
      }));

      group.members.push(...createdMembers);
      group.groupCount = group.members.length;

      return created(
        { addedCount: createdMembers.length },
        "구성원이 추가되었습니다.",
      );
    },
  ),

  http.delete(
    `${API_BASE}/address-books/:groupId/members/:memberId`,
    ({ params }) => {
      const groupId = Number(params.groupId);
      const memberId = Number(params.memberId);
      const group = addressBooks.find((item) => item.groupId === groupId);

      if (!group) return notFound("주소록을 찾을 수 없습니다.");

      const index = group.members.findIndex((member) => member.id === memberId);
      if (index === -1) return notFound("구성원을 찾을 수 없습니다.");

      group.members.splice(index, 1);
      group.groupCount = group.members.length;

      return ok(null, "구성원이 삭제되었습니다.");
    },
  ),
];
