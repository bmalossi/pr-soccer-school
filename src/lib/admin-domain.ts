export const ADMIN_HOSTNAME = "prsoccerschool.com";

export function isAdminHostname(hostname: string) {
  if (!hostname) return false;
  if (hostname === ADMIN_HOSTNAME) return true;
  // allow www.
  if (hostname === `www.${ADMIN_HOSTNAME}`) return true;
  return false;
}
