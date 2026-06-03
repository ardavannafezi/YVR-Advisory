const PT = "America/Vancouver";

function fmt(date: Date, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: PT }).format(date);
}

/** "Jun" */
export function ptMonthShort(date: Date): string {
  return fmt(date, { month: "short" });
}

/** "7" */
export function ptDay(date: Date): string {
  return fmt(date, { day: "numeric" });
}

/** "Sat, 9:00 PM" */
export function ptWeekdayTime(date: Date): string {
  const wd = fmt(date, { weekday: "short" });
  const time = fmt(date, { hour: "numeric", minute: "2-digit", hour12: true });
  return `${wd}, ${time}`;
}

/** "9:00 PM" */
export function ptTime(date: Date): string {
  return fmt(date, { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "Jun 7, 2025" */
export function ptDateShort(date: Date): string {
  return fmt(date, { month: "short", day: "numeric", year: "numeric" });
}

/** "June 7, 2025" */
export function ptDateLong(date: Date): string {
  return fmt(date, { month: "long", day: "numeric", year: "numeric" });
}

/** "Sat, Jun 7 · 9:00 PM" */
export function ptGuestlistClose(date: Date): string {
  const wd = fmt(date, { weekday: "short" });
  const monthDay = fmt(date, { month: "short", day: "numeric" });
  const time = fmt(date, { hour: "numeric", minute: "2-digit", hour12: true });
  return `${wd}, ${monthDay} · ${time}`;
}
