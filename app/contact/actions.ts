"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";

function value(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

export async function submitContactMessage(formData: FormData) {
  const website = value(formData, "website", 200);

  if (website) {
    redirect("/contact?sent=1");
  }

  const name = value(formData, "name", 191);
  const email = value(formData, "email", 191).toLowerCase();
  const phone = value(formData, "phone", 100) || null;
  const subject = value(formData, "subject", 255) || null;
  const message = value(formData, "message", 10000);

  if (name.length < 2 || !email.includes("@") || message.length < 10) {
    redirect("/contact?error=validation");
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim().slice(0, 64) ||
    requestHeaders.get("x-real-ip")?.slice(0, 64) ||
    null;
  const userAgent =
    requestHeaders.get("user-agent")?.slice(0, 500) || null;

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone,
      subject,
      message,
      ipAddress,
      userAgent,
    },
  });

  redirect("/contact?sent=1");
}
