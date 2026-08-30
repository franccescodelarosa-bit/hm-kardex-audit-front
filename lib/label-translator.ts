export interface LabelTranslator<K extends string = string> {
  translate: (key: K | string | null | undefined) => string;
  getColor: (key: K | string | null | undefined) => string;
  options: { value: K; label: string }[];
}

export interface CreateLabelTranslatorOptions {
  colors?: Record<string, string>;
  fallbackColor?: string;
  emptyLabel?: string;
}

export function createLabelTranslator<K extends string>(
  labels: Record<K, string>,
  options: CreateLabelTranslatorOptions = {}
): LabelTranslator<K> {
  const {
    colors,
    fallbackColor = "bg-slate-100 text-slate-700",
    emptyLabel = "—",
  } = options;

  const translate: LabelTranslator<K>["translate"] = (key) => {
    if (!key) return emptyLabel;
    return key in labels ? labels[key as K] : key;
  };

  const getColor: LabelTranslator<K>["getColor"] = (key) => {
    if (!key || !colors || !(key in colors)) return fallbackColor;
    return colors[key];
  };

  const translatorOptions = Object.entries(labels).map(([value, label]) => ({
    value: value as K,
    label: label as string,
  }));

  return { translate, getColor, options: translatorOptions };
}
