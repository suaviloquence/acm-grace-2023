export function getUsernameCookie(): string | null {
	return localStorage.getItem("username");
}