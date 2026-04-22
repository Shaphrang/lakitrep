export type AdminSession = {
  isAuthenticated: boolean;
  adminEmail?: string;
};

export async function getAdminSession(): Promise<AdminSession> {
  // TODO: enforce admin_users auth check using Supabase session and role data.
  return {
    isAuthenticated: true,
    adminEmail: "demo-admin@lakitrep.com",
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    throw new Error("Unauthorized admin access");
  }

  return session;
}
