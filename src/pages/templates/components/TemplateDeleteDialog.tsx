import Modal from "components/modal/Modal";
import "./TemplateDeleteDialog.css";

interface TemplateDeleteDialogProps {
  saving: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function TemplateDeleteDialog({ saving, onClose, onDelete }: TemplateDeleteDialogProps) {
  return (
    <Modal
      className="template-delete-dialog"
      eyebrow=""
      title="템플릿을 삭제할까요?"
      description={"삭제된 템플릿은 삭제된 항목으로 이동하며,\n30일 이내 복구하지 않으면 영구 삭제됩니다."}
      submitLabel={saving ? "삭제 중…" : "삭제"}
      submitDisabled={saving}
      onClose={onClose}
      onSubmit={event => { event.preventDefault(); if (!saving) void onDelete(); }}
    >
      {null}
    </Modal>
  );
}
