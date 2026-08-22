import { createLabelTranslator } from "./label-translator";

export const RISK_LEVEL_LABELS: Record<string, string> = {
  CRITICO: "Crítico",
  ALTO: "Alto",
  MEDIO: "Medio",
  BAJO: "Bajo",
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  CRITICO: "bg-red-100 text-red-700",
  ALTO: "bg-orange-100 text-orange-700",
  MEDIO: "bg-yellow-100 text-yellow-700",
  BAJO: "bg-green-100 text-green-700",
};

const riskLevelTranslator = createLabelTranslator(RISK_LEVEL_LABELS, {
  colors: RISK_LEVEL_COLORS,
});

export const translateRiskLevel = riskLevelTranslator.translate;
export const getRiskLevelColor = riskLevelTranslator.getColor;
