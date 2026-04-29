import { execSync } from "child_process";

function run(cmd) {
  console.log(`$ ${cmd}`);
  const out = execSync(cmd, { cwd: "/vercel/share/v0-project", encoding: "utf8" });
  if (out) console.log(out);
  return out;
}

run("git fetch origin main");
run("git rebase origin/main");
console.log("Rebase complete.");
