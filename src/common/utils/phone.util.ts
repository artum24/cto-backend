/** Strips all non-digit characters and keeps the last 10 digits (Ukrainian local format). */
export const normalizePhone = (phone: string): string =>
  phone.replace(/\D/g, '').slice(-10);
