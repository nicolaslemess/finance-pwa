export function formatDateForStorage(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalTodayDate() {
  return formatDateForStorage(new Date());
}

export function addDaysToLocalDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return formatDateForStorage(date);
}

export function createValidLocalDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}
