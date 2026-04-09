import type { CallingNumberAttachment, CallingNumberStatus } from "./CallingNumberTable";

export interface AdminCallingNumber {
  id: number;
  // 기관/프로젝트 정보
  organizationId: string;
  organizationName: string;
  projectId: string;
  projectName: string;
  // 발신번호 정보
  phoneNumber: string;
  name: string;
  registeredAt: string;
  certExpiredAt: string;
  status: CallingNumberStatus;
  /** 활성(true) / 비활성(false). 발송·노출 등 서비스 반영 여부 (관리 설정 또는 API 연동). 신청상태와 별개. */
  inUse: boolean;
  // 첨부파일
  attachments?: CallingNumberAttachment[];
  // 신청 관련
  requestNote?: string;
  rejectReason?: string;
  // 관리자 전용
  reviewedAt?: string;   // 검수 완료일
  reviewerName?: string; // 검수자
}

export const MOCK_ADMIN_CALLING_NUMBERS: AdminCallingNumber[] = [
  {
    id: 1,
    organizationId: "org-001",
    organizationName: "행정안전부",
    projectId: "c665f4dc-1234-5678-abcd-b1c7880a9b4a",
    projectName: "wiseon-gov",
    phoneNumber: "02-1234-5678",
    name: "행안부 대표번호",
    registeredAt: "2025-01-10T09:00:00",
    certExpiredAt: "2026-01-10T09:00:00",
    status: "정상",
    inUse: true,
    reviewedAt: "2025-01-15T14:30:00",
    reviewerName: "관리자1",
    attachments: [
      { label: "사업자 등록증", fileName: "사업자등록증_행안부.pdf" },
      { label: "통신 서비스 이용증명원", fileName: "이용증명원_02-1234-5678.pdf" },
      { label: "위임장", fileName: "위임장_행안부.docx" },
      { label: "대표자 신분증", fileName: "신분증_사본.jpg" },
    ],
    requestNote: "부처 공지 및 국민 안내 문자 발송용으로 사용합니다.",
  },
  {
    id: 2,
    organizationId: "org-002",
    organizationName: "보건복지부",
    projectId: "a1b2c3d4-1111-2222-3333-444455556666",
    projectName: "wiseon-health",
    phoneNumber: "044-202-3000",
    name: "복지부 민원 안내",
    registeredAt: "2025-03-05T11:00:00",
    certExpiredAt: "2026-03-05T11:00:00",
    status: "반려",
    inUse: false,
    rejectReason:
      "통신 서비스 이용증명원의 발신번호와 신청 발신번호가 일치하지 않습니다. 정확한 번호가 기재된 이용증명원을 재첨부해주세요.",
    reviewedAt: "2025-03-10T10:00:00",
    reviewerName: "관리자2",
    attachments: [
      { label: "사업자 등록증", fileName: "사업자등록증_보건복지부.pdf" },
      { label: "통신 서비스 이용증명원", fileName: "이용증명원_044-202-3000.pdf" },
    ],
    requestNote: "건강보험 및 복지 서비스 안내 문자 발송용",
  },
  {
    id: 3,
    organizationId: "org-003",
    organizationName: "서울특별시청",
    projectId: "c665f4dc-1234-5678-abcd-b1c7880a9b4a",
    projectName: "wiseon-gov",
    phoneNumber: "02-120",
    name: "다산콜센터",
    registeredAt: "2024-12-20T14:00:00",
    certExpiredAt: "2025-12-20T14:00:00",
    status: "만료",
    inUse: false,
    reviewedAt: "2024-12-24T09:00:00",
    reviewerName: "관리자1",
    attachments: [
      { label: "사업자 등록증", fileName: "사업자등록증_서울시.pdf" },
      { label: "통신 서비스 이용증명원", fileName: "이용증명원_02-120.pdf" },
      { label: "위임장", fileName: "위임장_서울시.pdf" },
      { label: "재직증명서", fileName: "재직증명서_김철수.pdf" },
    ],
  },
  {
    id: 4,
    organizationId: "org-004",
    organizationName: "경기도청",
    projectId: "5c7c325a-9876-5432-efgh-42ef00c15265",
    projectName: "wiseon-edu",
    phoneNumber: "031-8008-1000",
    name: "경기도 교육지원",
    registeredAt: "2026-03-20T10:00:00",
    certExpiredAt: "2027-03-20T10:00:00",
    status: "검수중",
    inUse: false,
    attachments: [
      { label: "사업자 등록증", fileName: "사업자등록증_경기도.pdf" },
      { label: "통신 서비스 이용증명원", fileName: "이용증명원_031-8008-1000.pdf" },
      { label: "위임장", fileName: "위임장_경기도.docx" },
      { label: "대표자 신분증", fileName: "신분증_사본.jpg" },
    ],
    requestNote: "도민 교육 프로그램 안내 및 일정 알림 발송 예정",
  },
  {
    id: 5,
    organizationId: "org-010",
    organizationName: "국민건강보험공단",
    projectId: "a1b2c3d4-1111-2222-3333-444455556666",
    projectName: "wiseon-health",
    phoneNumber: "1577-1000",
    name: "건보공단 안내번호",
    registeredAt: "2025-06-01T09:00:00",
    certExpiredAt: "2026-06-01T09:00:00",
    status: "정상",
    inUse: true,
    reviewedAt: "2025-06-05T11:30:00",
    reviewerName: "관리자3",
    attachments: [
      { label: "사업자 등록증", fileName: "사업자등록증_건보공단.pdf" },
      { label: "통신 서비스 이용증명원", fileName: "이용증명원_1577-1000.pdf" },
      { label: "위임장", fileName: "위임장_건보공단.pdf" },
      { label: "재직증명서", fileName: "재직증명서_이영희.pdf" },
    ],
    requestNote: "건강검진 예약 확인 및 결과 안내 문자 발송",
  },
  {
    id: 6,
    organizationId: "org-012",
    organizationName: "국세청",
    projectId: "d7e8f9a0-aaaa-bbbb-cccc-dddd11112222",
    projectName: "wiseon-tax",
    phoneNumber: "126",
    name: "국세청 납부 안내",
    registeredAt: "2025-08-15T09:00:00",
    certExpiredAt: "2026-08-15T09:00:00",
    status: "정상",
    inUse: false,
    reviewedAt: "2025-08-20T16:00:00",
    reviewerName: "관리자1",
    attachments: [
      { label: "사업자 등록증", fileName: "사업자등록증_국세청.pdf" },
      { label: "통신 서비스 이용증명원", fileName: "이용증명원_126.pdf" },
      { label: "위임장", fileName: "위임장_국세청.pdf" },
      { label: "대표자 신분증", fileName: "신분증_사본.jpg" },
    ],
    requestNote: "세금 납부 기한 알림 및 고지 문자 발송용",
  },
  {
    id: 7,
    organizationId: "org-007",
    organizationName: "강남구청",
    projectId: "5c7c325a-9876-5432-efgh-42ef00c15265",
    projectName: "wiseon-edu",
    phoneNumber: "02-3423-5555",
    name: "강남구 평생학습",
    registeredAt: "2026-02-10T10:00:00",
    certExpiredAt: "2027-02-10T10:00:00",
    status: "검수중",
    inUse: false,
    attachments: [
      { label: "사업자 등록증", fileName: "사업자등록증_강남구.pdf" },
      { label: "통신 서비스 이용증명원", fileName: "이용증명원_02-3423-5555.pdf" },
      { label: "위임장", fileName: "위임장_강남구.pdf" },
      { label: "재직증명서", fileName: "재직증명서_박민준.pdf" },
    ],
    requestNote: "평생학습원 강좌 신청 안내 및 수강 확인 문자",
  },
];
