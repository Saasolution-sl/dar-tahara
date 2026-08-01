type UnitProperty = { id: string };

export type UnitLinkedRecord = {
  id: string;
  properties: UnitProperty[] | UnitProperty | null;
};

export function invoiceUnitId(record: UnitLinkedRecord): string {
  const property = Array.isArray(record.properties)
    ? record.properties[0]
    : record.properties;
  return property?.id || record.id;
}

export function filterRecordsByUnit<T extends UnitLinkedRecord>(
  records: T[],
  selectedUnitId: string | null,
): T[] {
  if (!selectedUnitId) return records;
  return records.filter((record) => invoiceUnitId(record) === selectedUnitId);
}
