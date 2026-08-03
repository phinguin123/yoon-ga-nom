import bcrypt from "bcryptjs";

/**
 * One-off CLI helper to generate the ADMIN_PASSWORD_HASH value for
 * backend/.env. Usage:
 *
 *   npm run hash-password -- "your-strong-password"
 */
const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run hash-password -- <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log("\nAdd this line to backend/.env:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
