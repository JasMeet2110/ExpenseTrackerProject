import { useMemo, useState } from "react";

export function useMonthRange(initial?: Date) {
  const [cursor, setCursor] = useState<Date>(initial ?? new Date());

  const monthStart = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth(), 1, 0, 0, 0, 0),
    [cursor]
  );
  const monthEnd = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 0, 0, 0, 0),
    [cursor]
  );
  const label = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(cursor),
    [cursor]
  );

  const prev = () => setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return { monthStart, monthEnd, label, prev, next, cursor, setCursor };
}
