const METADATA_LABELS: Record<string, string> = {
  // Ya existían antes de este cambio
  fromIndex: "Mes Inicial",
  toIndex: "Mes Final",
  differences: "Diferencias Encontradas",
  finalBalance: "Saldo Final",
  initialBalance: "Saldo Inicial",
  quantity: "Cantidad",
  unitCost: "Costo Unitario",
  totalCost: "Costo Total",
  expectedQuantity: "Cantidad Esperada",
  actualQuantity: "Cantidad Encontrada",
  expectedCost: "Costo Esperado",
  actualCost: "Costo Encontrado",
  document: "Documento",
  movement: "Movimiento",
  warehouse: "Almacén",

  // Vistas en RULE_002 (continuidad de saldos entre meses)
  toMonth: "Mes Hasta",
  fromMonth: "Mes Desde",
  difference: "Diferencia",
  finalQuantity: "Cantidad Final",
  initialQuantity: "Cantidad Inicial",

  // Vistas en RULE_001 (inventario vs. kardex) — ver executive-dashboard.helper.ts
  inventoryTotalCost: "Costo Total Inventario",
  kardexTotalCost: "Costo Total Kardex",

  // Vistas en RULE_009 (ajustes por sobrantes)
  date: "Fecha",
  month: "Mes",
  operation: "Tipo de Operación",
  entryQuantity: "Cantidad de Ingreso",
  entryUnitCost: "Costo Unitario de Ingreso",
  entryTotalCost: "Costo Total de Ingreso",
  balanceQuantity: "Cantidad de Saldo",
  balanceUnitCost: "Costo Unitario de Saldo",
  balanceTotalCost: "Costo Total de Saldo",
};

function humanizeKey(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatMetadataLabel(key: string): string {
  return METADATA_LABELS[key] ?? humanizeKey(key);
}
