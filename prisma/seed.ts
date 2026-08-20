import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";

const databaseUrl = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace(/^\//, ""),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const roles = [
  {
    name: "Super Admin",
    slug: "super-admin",
    description: "Full access to the entire SIRA CMS.",
  },
  {
    name: "Administrator",
    slug: "administrator",
    description: "Administrative access to CMS features.",
  },
  {
    name: "Editor",
    slug: "editor",
    description: "Can manage and publish website content.",
  },
  {
    name: "Author",
    slug: "author",
    description: "Can create and manage own content.",
  },
  {
    name: "Viewer",
    slug: "viewer",
    description: "Read-only administrative access.",
  },
];

const permissions = [
  "dashboard.view",

  "pages.view",
  "pages.create",
  "pages.update",
  "pages.delete",
  "pages.publish",

  "posts.view",
  "posts.create",
  "posts.update",
  "posts.delete",
  "posts.publish",

  "media.view",
  "media.upload",
  "media.delete",

  "menus.view",
  "menus.manage",

  "users.view",
  "users.create",
  "users.update",
  "users.delete",

  "settings.view",
  "settings.manage",

  "messages.view",
  "messages.manage",

  "activity.view",
];

async function main() {
  console.log("Starting SIRA CMS seed...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });
  }

  console.log("Roles ready.");

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { slug: "super-admin" },
  });

  for (const key of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: {
        key,
        description: key,
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("Permissions ready.");

  const menus = [
    {
      name: "Top Menu",
      slug: "top-menu",
      location: "TOP" as const,
    },
    {
      name: "Footer Menu",
      slug: "footer-menu",
      location: "FOOTER" as const,
    },
    {
      name: "Secondary Menu",
      slug: "secondary-menu",
      location: "SECONDARY" as const,
    },
  ];

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { slug: menu.slug },
      update: {
        name: menu.name,
        location: menu.location,
      },
      create: menu,
    });
  }

  console.log("Menus ready.");

  const settings = [
    {
      key: "site.name",
      value: "SIRA Web",
      group: "general",
      isPublic: true,
    },
    {
      key: "site.description",
      value: "Powered by SIRA CMS",
      group: "general",
      isPublic: true,
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Settings ready.");

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName =
    process.env.SEED_ADMIN_NAME ?? "SIRA Administrator";

  if (!adminEmail || !adminPassword) {
    console.log(
      "Super Admin not created: SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is missing.",
    );
    return;
  }

  if (adminPassword.length < 12) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must contain at least 12 characters.",
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: {
      email: adminEmail.toLowerCase().trim(),
    },
    update: {
      name: adminName,
      roleId: superAdminRole.id,
      passwordHash,
      status: "ACTIVE",
    },
    create: {
      email: adminEmail.toLowerCase().trim(),
      name: adminName,
      passwordHash,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  });

  console.log("Super Admin ready.");
  console.log("SIRA CMS seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });