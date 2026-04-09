export interface Organization {
  organizationId: string;
  organizationName: string;
  organizationType: string;
}

export const MOCK_ORGANIZATIONS: Organization[] = [
  { organizationId: "org-001", organizationName: "행정안전부", organizationType: "중앙행정기관" },
  { organizationId: "org-002", organizationName: "보건복지부", organizationType: "중앙행정기관" },
  { organizationId: "org-003", organizationName: "서울특별시청", organizationType: "광역지방자치단체" },
  { organizationId: "org-004", organizationName: "경기도청", organizationType: "광역지방자치단체" },
  { organizationId: "org-005", organizationName: "인천광역시청", organizationType: "광역지방자치단체" },
  { organizationId: "org-006", organizationName: "부산광역시청", organizationType: "광역지방자치단체" },
  { organizationId: "org-007", organizationName: "강남구청", organizationType: "기초지방자치단체" },
  { organizationId: "org-008", organizationName: "성남시청", organizationType: "기초지방자치단체" },
  { organizationId: "org-009", organizationName: "서울대학교병원", organizationType: "공공의료기관" },
  { organizationId: "org-010", organizationName: "국민건강보험공단", organizationType: "공공기관" },
  { organizationId: "org-011", organizationName: "한국교육방송공사", organizationType: "공공기관" },
  { organizationId: "org-012", organizationName: "국세청", organizationType: "중앙행정기관" },
];

export interface SmsService {
  serviceId: string;
  serviceName: string;
  createTime: string;
  updateTime: string;
  useBlockService: boolean;
}

export interface KkoBizMsgService {
  serviceId: string;
  serviceName: string;
  createTime: string;
  updateTime: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  projectDesc: string;
  organizationId: string;
  useSms: boolean;
  useKkoBizMsg: boolean;
  smsService?: SmsService;
  kkoBizMsgService?: KkoBizMsgService;
  createTime: string;
  updateTime?: string;
}

export const MOCK_PROJECTS: Project[] = [
  {
    projectId: "c665f4dc-1234-5678-abcd-b1c7880a9b4a",
    projectName: "wiseon-gov",
    projectDesc: "정부기관 SMS/알림톡 통합 발송 서비스",
    organizationId: "org-001",
    useSms: true,
    useKkoBizMsg: true,
    smsService: {
      serviceId: "ncp:sms:kr:500000000010:wiseon-gov",
      serviceName: "wiseon-gov",
      createTime: "2025-03-15T09:00:00.000",
      updateTime: "2025-11-20T14:30:00.000",
      useBlockService: true,
    },
    kkoBizMsgService: {
      serviceId: "ncp:kkobizmsg:kr:500000000025:wiseon-gov",
      serviceName: "wiseon-gov",
      createTime: "2025-03-15T09:00:00.000",
      updateTime: "2025-11-20T14:30:00.000",
    },
    createTime: "2025-03-15T09:00:00.000",
    updateTime: "2025-11-20T14:30:00.000",
  },
  {
    projectId: "5c7c325a-9876-5432-efgh-42ef00c15265",
    projectName: "wiseon-edu",
    projectDesc: "교육기관 공지 및 안내 문자 발송",
    organizationId: "org-011",
    useSms: true,
    useKkoBizMsg: false,
    smsService: {
      serviceId: "ncp:sms:kr:500000000011:wiseon-edu",
      serviceName: "wiseon-edu",
      createTime: "2025-05-20T11:00:00.000",
      updateTime: "2025-10-01T09:15:00.000",
      useBlockService: false,
    },
    createTime: "2025-05-20T11:00:00.000",
    updateTime: "2025-10-01T09:15:00.000",
  },
  {
    projectId: "a1b2c3d4-1111-2222-3333-444455556666",
    projectName: "wiseon-health",
    projectDesc: "보건소 예약 확인 및 건강정보 알림",
    organizationId: "org-009",
    useSms: false,
    useKkoBizMsg: true,
    kkoBizMsgService: {
      serviceId: "ncp:kkobizmsg:kr:500000000030:wiseon-health",
      serviceName: "wiseon-health",
      createTime: "2025-08-01T08:00:00.000",
      updateTime: "2025-09-10T16:45:00.000",
    },
    createTime: "2025-08-01T08:00:00.000",
    updateTime: "2025-09-10T16:45:00.000",
  },
  {
    projectId: "d7e8f9a0-aaaa-bbbb-cccc-dddd11112222",
    projectName: "wiseon-tax",
    projectDesc: "세무 관련 납부 안내 및 고지 발송",
    organizationId: "org-012",
    useSms: true,
    useKkoBizMsg: true,
    smsService: {
      serviceId: "ncp:sms:kr:500000000012:wiseon-tax",
      serviceName: "wiseon-tax",
      createTime: "2025-01-10T10:00:00.000",
      updateTime: "2025-12-01T12:00:00.000",
      useBlockService: true,
    },
    kkoBizMsgService: {
      serviceId: "ncp:kkobizmsg:kr:500000000031:wiseon-tax",
      serviceName: "wiseon-tax",
      createTime: "2025-01-10T10:00:00.000",
      updateTime: "2025-12-01T12:00:00.000",
    },
    createTime: "2025-01-10T10:00:00.000",
    updateTime: "2025-12-01T12:00:00.000",
  },
];
