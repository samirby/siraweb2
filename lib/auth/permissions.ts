import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function requirePermission(permissionKey: string) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email.toLowerCase(),
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    redirect("/admin/login");
  }

  const allowed = user.role.permissions.some(
    (item) => item.permission.key === permissionKey,
  );

  if (!allowed) {
    throw new Error(`Forbidden: missing permission ${permissionKey}`);
  }

  return user;
}
