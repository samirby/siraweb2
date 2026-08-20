import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function getApiUserWithPermission(permissionKey: string) {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
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
    return null;
  }

  const allowed = user.role.permissions.some(
    (item) => item.permission.key === permissionKey,
  );

  return allowed ? user : null;
}
