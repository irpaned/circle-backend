const { execSync } = require("child_process");

try {
  execSync("prisma generate", { stdio: "inherit" });
  execSync("prisma migrate deploy", { stdio: "inherit" });
} catch (error) {
  console.error("Failed to run postinstall script", error);
  process.exit(1);
}
