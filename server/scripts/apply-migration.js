// One-off helper: applies a hand-written migration.sql via $executeRawUnsafe
// (statement-by-statement, since prisma migrate dev fails non-interactively
// in this environment). Usage: node scripts/apply-migration.js <migration-folder-name>
require("dotenv/config");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: node scripts/apply-migration.js <migration-folder-name>");
  process.exit(1);
}

const sqlPath = path.join(__dirname, "..", "prisma", "migrations", folder, "migration.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const sqlWithoutComments = sql
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = sqlWithoutComments
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const prisma = new PrismaClient();

(async () => {
  for (const statement of statements) {
    console.log("Executing:", statement.slice(0, 80).replace(/\n/g, " "), "...");
    await prisma.$executeRawUnsafe(statement);
  }
  await prisma.$disconnect();
  console.log("Done.");
})().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
