<script>
	import { path } from "../stores";
	import { getUsernameCookie } from "../util";
	if (getUsernameCookie()) {
		$path = "/dashboard";
	}
</script>

<button on:click={() => ($path = "/login")}>Login</button>
<button on:click={() => ($path = "/signup")}>Signup</button>
