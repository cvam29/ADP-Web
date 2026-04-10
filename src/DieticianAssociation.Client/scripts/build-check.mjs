import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

console.log("[v0] Starting build in:", projectRoot);

try {
  const output = execSync("npm run build", {
    cwd: projectRoot,
    encoding: "utf-8",
    stdio: "pipe",
  });
  console.log(output);
  console.log("[v0] Build succeeded.");
} catch (err) {
  console.error("[v0] Build FAILED:");
  console.error(err.stdout || "");
  console.error(err.stderr || "");
  process.exit(1);
}
