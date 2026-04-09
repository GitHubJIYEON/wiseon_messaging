import { useMemo, useRef, useState } from "react";
import { BuildingIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import type { Organization } from "@/features/messaging/components/project/projectData";
import { MOCK_ORGANIZATIONS } from "@/features/messaging/components/project/projectData";
import ProjectTable from "@/features/messaging/components/project/ProjectTable";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";

const PROJECT_NAME_REGEX = /^[a-z0-9_-]*$/;
const PROJECT_NAME_MAX = 24;
const PROJECT_DESC_MAX = 128;

interface CreateProjectForm {
  projectName: string;
  projectDesc: string;
  organizationId: string;
  useSms: boolean;
  useKkoBizMsg: boolean;
}

const INITIAL_FORM: CreateProjectForm = {
  projectName: "",
  projectDesc: "",
  organizationId: "",
  useSms: false,
  useKkoBizMsg: false,
};

export default function AdminOrganizationManagementPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProjectForm>(INITIAL_FORM);
  const [nameError, setNameError] = useState("");

  // 기관 검색
  const [orgSearchInput, setOrgSearchInput] = useState("");
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const orgInputRef = useRef<HTMLInputElement>(null);

  const selectedOrg: Organization | undefined = useMemo(
    () =>
      MOCK_ORGANIZATIONS.find(
        (o) => o.organizationId === createForm.organizationId,
      ),
    [createForm.organizationId],
  );

  const filteredOrgs = useMemo(() => {
    const keyword = orgSearchInput.trim().toLowerCase();
    if (!keyword) return MOCK_ORGANIZATIONS;
    return MOCK_ORGANIZATIONS.filter(
      (o) =>
        o.organizationName.toLowerCase().includes(keyword) ||
        o.organizationType.toLowerCase().includes(keyword),
    );
  }, [orgSearchInput]);

  const handleSelectOrg = (org: Organization) => {
    setCreateForm((prev) => ({ ...prev, organizationId: org.organizationId }));
    setOrgSearchInput("");
    setIsOrgDropdownOpen(false);
  };

  const handleClearOrg = () => {
    setCreateForm((prev) => ({ ...prev, organizationId: "" }));
    setOrgSearchInput("");
    setTimeout(() => orgInputRef.current?.focus(), 0);
  };

  const handleOpenCreateModal = () => {
    setCreateForm(INITIAL_FORM);
    setNameError("");
    setOrgSearchInput("");
    setIsOrgDropdownOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateForm(INITIAL_FORM);
    setNameError("");
    setOrgSearchInput("");
    setIsOrgDropdownOpen(false);
  };

  const handleProjectNameChange = (value: string) => {
    setCreateForm((prev) => ({ ...prev, projectName: value }));
    if (!value) {
      setNameError("프로젝트 이름은 필수입니다.");
    } else if (!PROJECT_NAME_REGEX.test(value)) {
      setNameError("영문 소문자, 숫자, -, _ 만 입력 가능합니다.");
    } else if (value.length > PROJECT_NAME_MAX) {
      setNameError(`최대 ${PROJECT_NAME_MAX}자까지 입력 가능합니다.`);
    } else {
      setNameError("");
    }
  };

  const isCreateFormValid =
    createForm.projectName.length > 0 &&
    !nameError &&
    createForm.projectDesc.length <= PROJECT_DESC_MAX &&
    createForm.organizationId !== "";

  const handleSubmitCreate = () => {
    if (!isCreateFormValid) return;
    toast.success(`프로젝트 "${createForm.projectName}"이(가) 생성되었습니다.`);
    handleCloseCreateModal();
  };

  return (
    <section className="mx-auto w-[1200px] rounded-xl px-8 pb-[30px]">
      <h1 className="font-apple-ultra pt-10 text-center text-[32px] leading-[45px] text-[#1B1D21]">
        발송 서비스 사용 기관
      </h1>
      <p className="font-apple-light mb-10 text-center text-[16px] leading-6 text-gray-500">
        발송 서비스는 "NCP의 콘솔 - 프로젝트 관리" 연동되어 있습니다.
      </p>

      {/* 프로젝트 목록 조회 테이블 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-apple-medium text-[20px] text-gray-800">
            발송 서비스 기관 목록
          </h2>
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="h-[40px]"
          >
            <PlusIcon className="size-4" />
            발송 서비스 기관 추가
          </Button>
        </div>
        <ProjectTable />
      </div>

      {/* 프로젝트 생성 모달 */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => !open && handleCloseCreateModal()}
      >
        <DialogContent className="w-[520px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>프로젝트 생성</DialogTitle>
          </DialogHeader>

          <div className="px-8 py-6">
            {/* 기관 검색 */}
            <div className="mb-5">
              <Label
                htmlFor="org-search"
                className="font-apple-medium mb-1.5 block text-[14px] text-gray-700"
              >
                기관
                <span className="ml-1 text-red-500">*</span>
              </Label>

              {selectedOrg ? (
                /* 선택된 기관 표시 */
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <BuildingIcon className="size-4 shrink-0 text-gray-400" />
                    <div>
                      <p className="font-apple-medium text-[13px] text-gray-900">
                        {selectedOrg.organizationName}
                      </p>
                      <p className="font-apple-light text-[12px] text-gray-400">
                        {selectedOrg.organizationType}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearOrg}
                    className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    aria-label="기관 선택 해제"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ) : (
                /* 기관 검색 입력 + 드롭다운 */
                <div className="relative">
                  <div className="relative">
                    <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="org-search"
                      ref={orgInputRef}
                      value={orgSearchInput}
                      onChange={(e) => {
                        setOrgSearchInput(e.target.value);
                        setIsOrgDropdownOpen(true);
                      }}
                      onFocus={() => setIsOrgDropdownOpen(true)}
                      onBlur={() =>
                        setTimeout(() => setIsOrgDropdownOpen(false), 150)
                      }
                      placeholder="기관명을 검색하세요"
                      className="h-[42px] pl-9 text-[13px]"
                      autoComplete="off"
                    />
                  </div>

                  {isOrgDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                      {filteredOrgs.length === 0 ? (
                        <p className="font-apple-light px-4 py-3 text-[13px] text-gray-400">
                          검색 결과가 없습니다.
                        </p>
                      ) : (
                        <ul className="max-h-[220px] overflow-y-auto py-1">
                          {filteredOrgs.map((org) => (
                            <li key={org.organizationId}>
                              <button
                                type="button"
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                                onMouseDown={() => handleSelectOrg(org)}
                              >
                                <BuildingIcon className="size-4 shrink-0 text-gray-400" />
                                <div>
                                  <p className="font-apple-medium text-[13px] text-gray-800">
                                    {org.organizationName}
                                  </p>
                                  <p className="font-apple-light text-[12px] text-gray-400">
                                    {org.organizationType}
                                  </p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 프로젝트 이름 */}
            <div className="mb-5">
              <Label
                htmlFor="project-name"
                className="font-apple-medium mb-1.5 block text-[14px] text-gray-700"
              >
                프로젝트 이름
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                id="project-name"
                value={createForm.projectName}
                onChange={(e) => handleProjectNameChange(e.target.value)}
                placeholder="영문 소문자, 숫자, -, _ 사용 가능 (최대 24자)"
                maxLength={PROJECT_NAME_MAX}
                className={`h-[42px] text-[13px] ${nameError ? "border-red-300 focus-visible:ring-red-200" : ""}`}
              />
              <div className="mt-1 flex items-start justify-between">
                {nameError ? (
                  <p className="font-apple-light text-[12px] text-red-500">
                    {nameError}
                  </p>
                ) : (
                  <p className="font-apple-light text-[12px] text-gray-400">
                    영문 소문자, 숫자, -, _ 만 허용됩니다.
                  </p>
                )}
                <span className="font-apple-light ml-2 shrink-0 text-[12px] text-gray-400">
                  {createForm.projectName.length}/{PROJECT_NAME_MAX}
                </span>
              </div>
            </div>

            {/* 프로젝트 설명 */}
            <div className="mb-6">
              <Label
                htmlFor="project-desc"
                className="font-apple-medium mb-1.5 block text-[14px] text-gray-700"
              >
                프로젝트 설명
                <span className="font-apple-light ml-1 text-[12px] text-gray-400">
                  (선택)
                </span>
              </Label>
              <Textarea
                id="project-desc"
                value={createForm.projectDesc}
                onChange={(e) => {
                  if (e.target.value.length <= PROJECT_DESC_MAX) {
                    setCreateForm((prev) => ({
                      ...prev,
                      projectDesc: e.target.value,
                    }));
                  }
                }}
                placeholder="프로젝트에 대한 설명을 입력해주세요."
                className="min-h-[80px] resize-none text-[13px]"
                maxLength={PROJECT_DESC_MAX}
              />
              <p className="font-apple-light mt-1 text-right text-[12px] text-gray-400">
                {createForm.projectDesc.length}/{PROJECT_DESC_MAX}
              </p>
            </div>

            {/* 서비스 사용 여부 */}
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="font-apple-medium mb-1 text-[13px] text-gray-500">
                서비스 설정
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="use-sms"
                    className="font-apple-medium cursor-pointer text-[14px] text-gray-700"
                  >
                    SMS 서비스 사용
                  </Label>
                  <p className="font-apple-light text-[12px] text-gray-400">
                    미사용 시에도 서비스 메타 정보가 생성되며 추후 변경
                    가능합니다.
                  </p>
                </div>
                <Switch
                  id="use-sms"
                  checked={createForm.useSms}
                  onCheckedChange={(checked) =>
                    setCreateForm((prev) => ({ ...prev, useSms: checked }))
                  }
                />
              </div>

              <Separator className="bg-gray-200" />

              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="use-kko"
                    className="font-apple-medium cursor-pointer text-[14px] text-gray-700"
                  >
                    알림톡(Biz Message) 서비스 사용
                  </Label>
                  <p className="font-apple-light text-[12px] text-gray-400">
                    미사용 시에도 서비스 메타 정보가 생성되며 추후 변경
                    가능합니다.
                  </p>
                </div>
                <Switch
                  id="use-kko"
                  checked={createForm.useKkoBizMsg}
                  onCheckedChange={(checked) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      useKkoBizMsg: checked,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="mt-8 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateModal}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={handleSubmitCreate}
                disabled={!isCreateFormValid}
              >
                생성하기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
