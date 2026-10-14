// Only allow redirects to paths inside this site (blocks "//evil.com" and "https://...").
export function safeNext(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}