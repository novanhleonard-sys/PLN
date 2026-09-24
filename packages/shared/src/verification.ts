export function verifyLogic(data: any): boolean {
  if (!data) return false;
  if (data.isValid === true) return true;
  return false;
}