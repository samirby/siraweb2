"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function validatePassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
}

async function ensureUniqueEmail(
  email: string,
  currentId?: bigint,
) {
  const existing = await prisma.user.findFirst({
    where: {
      email,
      ...(currentId ? { id: { not: currentId } } : {}),
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    throw new Error("A user with this email already exists.");
  }
}

async function ensureRole(roleId: bigint) {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!role) {
    throw new Error("Selected role does not exist.");
  }

  return role;
}

export async function createUserAction(formData: FormData) {
  const actor = await requirePermission("users.manage");

  const name = text(formData, "name");
  const email = normalizeEmail(text(formData, "email"));
  const password = text(formData, "password");
  const roleId = BigInt(text(formData, "roleId"));
  const status = text(formData, "status");

  if (!name) throw new Error("Name is required.");
  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }

  validatePassword(password);
  await ensureUniqueEmail(email);
  const role = await ensureRole(roleId);

  if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
    throw new Error("Invalid user status.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roleId,
      status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      action: "user.create",
      entityType: "User",
      entityId: user.id.toString(),
      metadata: {
        name: user.name,
        email: user.email,
        role: role.slug,
        status: user.status,
      },
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  redirect("/admin/users?created=1");
}

export async function updateUserAction(formData: FormData) {
  const actor = await requirePermission("users.manage");

  const id = BigInt(text(formData, "id"));
  const existing = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
    },
  });

  if (!existing) {
    redirect("/admin/users");
  }

  const isSelf = existing.id === actor.id;

  const name = text(formData, "name");
  const requestedEmail = normalizeEmail(text(formData, "email"));
  const email = isSelf ? existing.email : requestedEmail;
  const requestedRoleId = BigInt(text(formData, "roleId"));
  const roleId = isSelf ? existing.roleId : requestedRoleId;
  const requestedStatus = text(formData, "status");
  const status = isSelf ? "ACTIVE" : requestedStatus;
  const password = text(formData, "password");

  if (!name) throw new Error("Name is required.");

  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }

  if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
    throw new Error("Invalid user status.");
  }

  await ensureUniqueEmail(email, id);
  const role = await ensureRole(roleId);

  const data: {
    name: string;
    email: string;
    roleId: bigint;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    passwordHash?: string;
  } = {
    name,
    email,
    roleId,
    status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED",
  };

  if (password) {
    validatePassword(password);
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      action: "user.update",
      entityType: "User",
      entityId: user.id.toString(),
      metadata: {
        name: user.name,
        email: user.email,
        role: role.slug,
        status: user.status,
        passwordChanged: Boolean(password),
        selfProtected: isSelf,
      },
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id.toString()}/edit`);
  revalidatePath("/admin");
  redirect("/admin/users?saved=1");
}

export async function toggleUserStatusAction(
  formData: FormData,
) {
  const actor = await requirePermission("users.manage");

  const id = BigInt(text(formData, "id"));

  if (id === actor.id) {
    redirect("/admin/users?selfProtected=1");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  });

  if (!user) {
    redirect("/admin/users");
  }

  const nextStatus =
    user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  const updated = await prisma.user.update({
    where: { id },
    data: {
      status: nextStatus,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      action: "user.status",
      entityType: "User",
      entityId: updated.id.toString(),
      metadata: {
        email: updated.email,
        from: user.status,
        to: updated.status,
      },
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?statusChanged=1");
}
