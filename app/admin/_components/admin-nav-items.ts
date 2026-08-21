export const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/posts", label: "Posts" },
{ href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/menus", label: "Menus" },
  { href: "/admin/users", label: "Users", permission: "users.manage" },
  { href: "/admin/roles", label: "Roles", permission: "roles.manage" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/design", label: "Design", permission: "roles.manage" },
  { href: "/admin/settings", label: "Settings", permission: "roles.manage" },
] as const;
