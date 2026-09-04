import { createLabelTranslator } from "./label-translator";

export const AUDIT_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "READY_FOR_AUDIT",
  "AUDITING",
  "COMPLETED",
  "ERROR",
] as const;

export type AuditStatus = (typeof AUDIT_STATUSES)[number];

export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Progreso",
  READY_FOR_AUDIT: "Lista para Auditoría",
  AUDITING: "Auditando",
  COMPLETED: "Completada",
  ERROR: "Error en el procesamiento",
};

export const AUDIT_STATUS_COLORS: Record<AuditStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  READY_FOR_AUDIT: "bg-green-100 text-green-700",
  AUDITING: "bg-purple-100 text-purple-700 animate-pulse",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ERROR: "bg-red-100 text-red-700",
};

const auditStatusTranslator = createLabelTranslator(AUDIT_STATUS_LABELS, {
  colors: AUDIT_STATUS_COLORS,
});

export const translateAuditStatus = auditStatusTranslator.translate;
export const getAuditStatusColor = auditStatusTranslator.getColor;
export const AUDIT_STATUS_OPTIONS = auditStatusTranslator.options;
