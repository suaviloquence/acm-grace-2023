export function getUsernameCookie(): string | null {
	return document.cookie.split("; ").find((row) => row.startsWith("username="))?.split("=")[1];
}