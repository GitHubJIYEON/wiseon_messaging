import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  MessageSquareIcon,
  PencilIcon,
  SmartphoneIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type {
  KkoBizMsgService,
  Project,
  SmsService,
} from "@/features/messaging/components/project/projectData";
import {
  MOCK_ORGANIZATIONS,
  MOCK_PROJECTS,
} from "@/features/messaging/components/project/projectData";
import { Badge } from "@/shared/components/ui/badge";
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

const PROJECT_DESC_MAX = 128;

interface EditForm {
  projectDesc: string;
  useSms: boolean;
  useKkoBizMsg: boolean;
}

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return format(new Date(value), "yyyy.MM.dd HH:mm:ss");
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-3 text-[14px]">
      <span className="font-apple-medium w-[160px] shrink-0 text-gray-500">
        {label}
      </span>
      <span className="font-apple-light break-all text-gray-800">{value}</span>
    </div>
  );
}

function EditRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-4 py-3 text-[14px]">
      <span className="font-apple-medium w-[160px] shrink-0 pt-0.5 text-gray-500">
        {label}
      </span>
      <div className="flex-1">
        {children}
        {hint && (
          <p className="font-apple-light mt-1 text-[12px] text-gray-400">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function ReadOnlyRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-3 text-[14px]">
      <span className="font-apple-medium w-[160px] shrink-0 text-gray-400">
        {label}
      </span>
      <span className="font-apple-light break-all text-gray-400">{value}</span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
        {icon && <span className="text-gray-500">{icon}</span>}
        <h3 className="font-apple-medium text-[15px] text-gray-800">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100 px-6">{children}</div>
    </div>
  );
}

function ServiceBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-gray-200 bg-gray-100 text-gray-400"
      }
    >
      {active ? "사용" : "미사용"}
    </Badge>
  );
}

function SmsServiceSection({ sms }: { sms: SmsService }) {
  return (
    <SectionCard
      icon={<SmartphoneIcon className="size-4" />}
      title="SMS 서비스"
    >
      <DetailRow label="서비스 ID" value={sms.serviceId} />
      <DetailRow label="서비스명" value={sms.serviceName} />
      <DetailRow
        label="080 수신거부 서비스"
        value={
          <Badge
            variant="outline"
            className={
              sms.useBlockService
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-gray-200 bg-gray-100 text-gray-400"
            }
          >
            {sms.useBlockService ? "사용" : "미사용"}
          </Badge>
        }
      />
      <DetailRow label="생성일시" value={formatDateTime(sms.createTime)} />
      <DetailRow label="수정일시" value={formatDateTime(sms.updateTime)} />
    </SectionCard>
  );
}

function KkoServiceSection({ kko }: { kko: KkoBizMsgService }) {
  return (
    <SectionCard
      icon={<MessageSquareIcon className="size-4" />}
      title="Biz Message 서비스 (알림톡)"
    >
      <DetailRow label="서비스 ID" value={kko.serviceId} />
      <DetailRow label="서비스명" value={kko.serviceName} />
      <DetailRow label="생성일시" value={formatDateTime(kko.createTime)} />
      <DetailRow label="수정일시" value={formatDateTime(kko.updateTime)} />
    </SectionCard>
  );
}

function ProjectNotFound() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto flex w-[1200px] flex-col items-center gap-4 px-8 py-20">
      <p className="font-apple-medium text-[18px] text-gray-500">
        프로젝트를 찾을 수 없습니다.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/messaging/admin/organization-management")}
      >
        <ArrowLeftIcon className="size-4" />
        목록으로 돌아가기
      </Button>
    </section>
  );
}

export default function AdminOrganizationManagementDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // 실제 구현 시 API 호출: GET /common/v2/projects/{projectId}
  const project: Project | undefined = MOCK_PROJECTS.find(
    (p) => p.projectId === projectId,
  );

  const organization = MOCK_ORGANIZATIONS.find(
    (o) => o.organizationId === project?.organizationId,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    projectDesc: "",
    useSms: false,
    useKkoBizMsg: false,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  if (!project) return <ProjectNotFound />;

  const DELETE_CONFIRM_TEXT = project.projectName;
  const isDeleteConfirmed = deleteConfirmInput === DELETE_CONFIRM_TEXT;

  const handleStartEdit = () => {
    setEditForm({
      projectDesc: project.projectDesc ?? "",
      useSms: project.useSms,
      useKkoBizMsg: project.useKkoBizMsg,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmitEdit = () => {
    // 실제 구현 시 API 호출: PUT /common/v2/projects/{projectId}
    // body: { projectDesc, useSms, useKkoBizMsg }
    toast.success("프로젝트가 수정되었습니다.");
    setIsEditing(false);
  };

  const handleOpenDeleteModal = () => {
    setDeleteConfirmInput("");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmInput("");
  };

  const handleConfirmDelete = () => {
    if (!isDeleteConfirmed) return;
    // 실제 구현 시 API 호출: DELETE /common/v2/projects/{projectId}
    // 응답: 204 No Content
    toast.success(`프로젝트 "${project.projectName}"이(가) 삭제되었습니다.`);
    navigate("/messaging/admin/organization-management");
  };

  const isDescValid = editForm.projectDesc.length <= PROJECT_DESC_MAX;

  return (
    <section className="mx-auto w-[1200px] px-8 pb-[80px]">
      {/* 헤더 */}
      <div className="flex items-center gap-3 pt-10 pb-8">
        <Separator orientation="vertical" className="h-5 bg-gray-200" />
        <div>
          <h1 className="font-apple-bold text-[24px] leading-tight text-gray-900">
            {project.projectName}
          </h1>
          {project.projectDesc && !isEditing && (
            <p className="font-apple-light mt-0.5 text-[14px] text-gray-500">
              {project.projectDesc}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* 기본 정보 */}
        <SectionCard title="기본 정보">
          {/* 프로젝트 ID - 항상 읽기 전용 */}
          <DetailRow label="프로젝트 ID" value={project.projectId} />

          {/* 프로젝트명 - 수정 불가 (API 명세에 없음) */}
          {isEditing ? (
            <ReadOnlyRow
              label="프로젝트명"
              value={
                <span className="flex items-center gap-2">
                  {project.projectName}
                  <span className="font-apple-light rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-400">
                    수정 불가
                  </span>
                </span>
              }
            />
          ) : (
            <DetailRow label="프로젝트명" value={project.projectName} />
          )}

          {/* 기관 - 항상 읽기 전용 */}
          {isEditing ? (
            <ReadOnlyRow
              label="기관"
              value={
                <span className="flex items-center gap-2">
                  {organization?.organizationName ?? "-"}
                  <span className="font-apple-light rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-400">
                    수정 불가
                  </span>
                </span>
              }
            />
          ) : (
            <DetailRow
              label="기관"
              value={
                organization ? (
                  <span className="flex flex-col gap-0.5">
                    <span>{organization.organizationName}</span>
                    <span className="font-apple-light text-[12px] text-gray-400">
                      {organization.organizationType}
                    </span>
                  </span>
                ) : (
                  "-"
                )
              }
            />
          )}

          {/* 프로젝트 설명 - 수정 가능 */}
          {isEditing ? (
            <EditRow
              label="프로젝트 설명"
              hint={`${editForm.projectDesc.length}/${PROJECT_DESC_MAX}자`}
            >
              <Textarea
                value={editForm.projectDesc}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    projectDesc: e.target.value,
                  }))
                }
                placeholder="프로젝트에 대한 설명을 입력해주세요."
                className="min-h-[72px] resize-none text-[13px]"
                maxLength={PROJECT_DESC_MAX}
              />
            </EditRow>
          ) : (
            <DetailRow
              label="프로젝트 설명"
              value={project.projectDesc || "-"}
            />
          )}

          {/* SMS 사용 여부 - 수정 가능 */}
          {isEditing ? (
            <EditRow label="SMS 사용 여부">
              <div className="flex items-center gap-3 pt-0.5">
                <Switch
                  id="edit-use-sms"
                  checked={editForm.useSms}
                  onCheckedChange={(checked) =>
                    setEditForm((prev) => ({ ...prev, useSms: checked }))
                  }
                />
                <Label
                  htmlFor="edit-use-sms"
                  className="font-apple-light cursor-pointer text-[13px] text-gray-600"
                >
                  {editForm.useSms ? "사용" : "미사용"}
                </Label>
              </div>
            </EditRow>
          ) : (
            <DetailRow
              label="SMS 사용 여부"
              value={<ServiceBadge active={project.useSms} />}
            />
          )}

          {/* 알림톡 사용 여부 - 수정 가능 */}
          {isEditing ? (
            <EditRow label="알림톡 사용 여부">
              <div className="flex items-center gap-3 pt-0.5">
                <Switch
                  id="edit-use-kko"
                  checked={editForm.useKkoBizMsg}
                  onCheckedChange={(checked) =>
                    setEditForm((prev) => ({ ...prev, useKkoBizMsg: checked }))
                  }
                />
                <Label
                  htmlFor="edit-use-kko"
                  className="font-apple-light cursor-pointer text-[13px] text-gray-600"
                >
                  {editForm.useKkoBizMsg ? "사용" : "미사용"}
                </Label>
              </div>
            </EditRow>
          ) : (
            <DetailRow
              label="알림톡 사용 여부"
              value={<ServiceBadge active={project.useKkoBizMsg} />}
            />
          )}

          {/* 생성일시 / 수정일시 - 항상 읽기 전용 */}
          <DetailRow
            label="생성일시"
            value={formatDateTime(project.createTime)}
          />
          {project.updateTime && (
            <DetailRow
              label="최종 수정일시"
              value={formatDateTime(project.updateTime)}
            />
          )}
        </SectionCard>

        {/* SMS 서비스 메타 정보 */}
        {project.smsService && <SmsServiceSection sms={project.smsService} />}

        {/* Biz Message 서비스 메타 정보 */}
        {project.kkoBizMsgService && (
          <KkoServiceSection kko={project.kkoBizMsgService} />
        )}
      </div>

      {/* 하단 버튼 바 */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
        <Button
          type="button"
          variant="ghost"
          className="h-[38px] gap-1.5 px-3 text-gray-500 hover:text-gray-800"
          onClick={() => navigate("/messaging/admin/organization-management")}
        >
          <ArrowLeftIcon className="size-4" />
          목록으로
        </Button>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-[38px] gap-1.5 text-gray-600"
              onClick={handleCancelEdit}
            >
              <XIcon className="size-4" />
              취소
            </Button>
            <Button
              type="button"
              className="h-[38px]"
              onClick={handleSubmitEdit}
              disabled={!isDescValid}
            >
              저장하기
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-[38px] gap-1.5 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleOpenDeleteModal}
            >
              <Trash2Icon className="size-4" />
              삭제
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-[38px] gap-1.5 text-gray-700"
              onClick={handleStartEdit}
            >
              <PencilIcon className="size-4" />
              수정하기
            </Button>
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => !open && handleCloseDeleteModal()}
      >
        <DialogContent className="w-[520px] p-0" showCloseButton>
          <DialogHeader>
            <DialogTitle>프로젝트 삭제</DialogTitle>
          </DialogHeader>

          <div className="px-8 py-6">
            <p className="font-apple-light text-[14px] leading-6 text-gray-700">
              프로젝트{" "}
              <span className="font-apple-medium text-gray-900">
                {project.projectName}
              </span>
              을(를) 삭제하시겠습니까?
            </p>
            <p className="font-apple-light mt-2 text-[13px] leading-5 text-gray-500">
              삭제된 프로젝트는 복구할 수 없으며, 해당 프로젝트에 연결된 SMS 및
              알림톡 서비스도 함께 비활성화됩니다.
            </p>

            <div className="mt-5 space-y-2">
              <Label
                htmlFor="delete-confirm-input"
                className="font-apple-medium text-[13px] text-gray-600"
              >
                확인을 위해 프로젝트 이름을 입력해주세요.
              </Label>
              <p className="font-apple-light rounded border border-red-100 bg-red-50/50 px-3 py-2 text-[13px] text-red-500 select-none">
                {DELETE_CONFIRM_TEXT}
              </p>
              <Input
                id="delete-confirm-input"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="프로젝트 이름을 입력해주세요"
                className="h-[42px] text-[13px]"
              />
            </div>

            <DialogFooter className="mt-6 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteModal}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                onClick={handleConfirmDelete}
                disabled={!isDeleteConfirmed}
              >
                삭제하기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
