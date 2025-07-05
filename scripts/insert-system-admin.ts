import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const email = "system.admin@gmail.com";
  const username = "sysadmin";
  const password = "SysAdmin@1234";
  const fullName = "System Admin";
  const role = "admin";
  const isVerified = true;
  const createdAt = new Date();

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Remove any existing user with this email or username
  await db.delete(users).where(eq(users.email, email));
  await db.delete(users).where(eq(users.username, username));

  // Insert the system admin user
  await db.insert(users).values({
    username,
    password: hashedPassword,
    email,
    fullName,
    role,
    isVerified,
    createdAt
  });

  console.log("System admin user inserted:", email);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error inserting system admin:", err);
  process.exit(1);
});
