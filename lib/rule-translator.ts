import { createLabelTranslator, type LabelTranslator } from "./label-translator";

//todo: traduci las reglas :D
interface RuleLike {
  code: string;
  name: string;
}

export function createRuleTranslator(
  rules: RuleLike[]
): LabelTranslator<string> {
  const labels = Object.fromEntries(
    rules.map((rule) => [rule.code, rule.name])
  );

  return createLabelTranslator(labels);
}

export function formatRuleCode(code: string | null | undefined): string {
  if (!code) return "—";

  const match = code.match(/^RULE_(\d+)$/i);
  return match ? `Regla ${match[1]}` : code;
}

export function ruleNumber(code: string | null | undefined): string {
  if (!code) return "—";

  const match = code.match(/^RULE_(\d+)$/i);
  return match ? match[1] : code;
}
