"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth.schema";
import { slugify } from "@/lib/utils/format";
import { signIn } from "@/lib/auth/config";

export async function register(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, organizationName } = parsed.data;

  // Check duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate unique org slug
  let slug = slugify(organizationName);
  const slugExists = await prisma.organization.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  // Create org + user in transaction
  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: organizationName, slug },
    });

    await tx.user.create({
      data: {
        name,
        email,
        hashedPassword,
        organizationId: org.id,
        role: "ADMIN",
      },
    });
  });

  // Auto sign-in after registration
  await signIn("credentials", { email, password, redirect: false });

  return { success: true };
}
