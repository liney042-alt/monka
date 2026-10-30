import { clerkClient, getAuth } from "@clerk/express";
import { and, eq } from "drizzle-orm";
import type { RequestHandler } from "express";
import { db, userProfilesTable, type UserProfile } from "@workspace/db";

export type EffectiveRole = "owner" | "provider" | "admin";

export function getConfiguredAdminEmails(): Set<string> {
  return new Set(
    (process.env.PETPULSE_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isConfiguredAdmin(
  email: string | null | undefined,
  emailVerified: boolean,
): boolean {
  return Boolean(
    email &&
      emailVerified &&
      getConfiguredAdminEmails().has(email.trim().toLowerCase()),
  );
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Se requiere iniciar sesión." });
    return;
  }

  req.clerkUserId = userId;
  next();
};

export function requireRole(...allowedRoles: EffectiveRole[]): RequestHandler {
  return async (req, res, next): Promise<void> => {
    const clerkUserId = req.clerkUserId;
    if (!clerkUserId) {
      res.status(401).json({ error: "Se requiere iniciar sesión." });
      return;
    }

    const [profile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.clerkUserId, clerkUserId))
      .limit(1);

    if (!profile || !profile.onboardingCompleted) {
      res.status(403).json({ error: "Completa la configuración de tu cuenta." });
      return;
    }

    let effectiveRole: EffectiveRole = profile.role;
    if (allowedRoles.includes("admin")) {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const primaryEmail = clerkUser.primaryEmailAddress;
      if (
        isConfiguredAdmin(
          primaryEmail?.emailAddress,
          primaryEmail?.verification?.status === "verified",
        )
      ) {
        effectiveRole = "admin";
      }
    }

    if (!allowedRoles.includes(effectiveRole)) {
      res.status(403).json({ error: "Tu cuenta no tiene permiso para esta acción." });
      return;
    }

    req.petPulseProfile = profile;
    req.petPulseRole = effectiveRole;
    next();
  };
}

export async function findProfileByClerkUserId(
  clerkUserId: string,
): Promise<UserProfile | undefined> {
  const [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.clerkUserId, clerkUserId))
    .limit(1);
  return profile;
}

export async function loadClerkIdentity(clerkUserId: string) {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const primaryEmail = clerkUser.primaryEmailAddress;
  if (!primaryEmail?.emailAddress) {
    return null;
  }

  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .trim();

  return {
    clerkUserId,
    email: primaryEmail.emailAddress,
    emailVerified: primaryEmail.verification?.status === "verified",
    displayName: fullName || primaryEmail.emailAddress.split("@")[0],
  };
}

export async function createOrSyncProfile(
  identity: NonNullable<Awaited<ReturnType<typeof loadClerkIdentity>>>,
): Promise<UserProfile> {
  const admin = isConfiguredAdmin(identity.email, identity.emailVerified);
  const existing = await findProfileByClerkUserId(identity.clerkUserId);

  if (!existing) {
    await db
      .insert(userProfilesTable)
      .values({
        clerkUserId: identity.clerkUserId,
        email: identity.email,
        emailVerified: identity.emailVerified,
        displayName: identity.displayName,
        role: "owner",
        onboardingCompleted: admin,
      })
      .onConflictDoNothing({ target: userProfilesTable.clerkUserId });
  } else if (
    existing.email !== identity.email ||
    existing.emailVerified !== identity.emailVerified ||
    (admin && !existing.onboardingCompleted)
  ) {
    await db
      .update(userProfilesTable)
      .set({
        email: identity.email,
        emailVerified: identity.emailVerified,
        ...(admin ? { onboardingCompleted: true } : {}),
      })
      .where(
        and(
          eq(userProfilesTable.id, existing.id),
          eq(userProfilesTable.clerkUserId, identity.clerkUserId),
        ),
      );
  }

  const profile = await findProfileByClerkUserId(identity.clerkUserId);
  if (!profile) {
    throw new Error("No fue posible crear el perfil de PetPulse.");
  }
  return profile;
}
