import { spawn, spawnSync } from "node:child_process";

if (process.platform === "win32") {
	process.exit(0);
}

const child = spawn("npm", ["run", "check"], { stdio: "inherit", shell: false });
let timedOut = false;

const timeout = setTimeout(() => {
	timedOut = true;
	try {
		child.kill("SIGKILL");
	} catch {}
}, 20_000);

child.on("exit", (code) => {
	clearTimeout(timeout);
	if (timedOut) {
		process.stderr.write("Check timed out after 20 seconds\n");
		process.exit(1);
	}
	process.exit(code ?? 1);
});

child.on("error", () => {
	clearTimeout(timeout);
	spawnSync("npm", ["run", "check"], { stdio: "inherit" });
	process.exit(1);
});
