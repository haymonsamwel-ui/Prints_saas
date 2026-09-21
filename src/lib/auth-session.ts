export type AppRole = "ADMIN" | "MANAGER" | "SALES" | "DESIGNER" | "PRODUCTION" | "FINANCE" | "DELIVERY";
export type UserStatus = "Active" | "Invited" | "Suspended";

export const roleAccess: Record<AppRole, string[]> = {
  ADMIN: ["/"],
  MANAGER: ["/"],
  SALES: ["/", "/customers", "/products", "/quotations", "/orders", "/invoices", "/payments"],
  DESIGNER: ["/", "/production"],
  PRODUCTION: ["/", "/production", "/inventory"],
  FINANCE: ["/", "/invoices", "/payments"],
  DELIVERY: ["/", "/orders", "/production"],
};

export function canAccessPath(role: AppRole, pathname: string) {
  if (role === "ADMIN" || role === "MANAGER") {
    return true;
  }

  return roleAccess[role].some((path) => path === "/" ? pathname === "/" : pathname.startsWith(path));
}

export type AppSession = {
  email: string;
  companyName: string;
  name: string;
  role: AppRole;
  status: UserStatus;
  isAuthenticated: boolean;
  loggedInAt: string;
};

export type StoredUser = {
  email: string;
  password: string;
  companyName: string;
  name: string;
  role: AppRole;
  status: UserStatus;
};

const sessionKey = "creative-business-os:session";
const usersKey = "creative-business-os:users";

export function readSession(): AppSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const session = window.localStorage.getItem(sessionKey);
    return session ? (JSON.parse(session) as AppSession) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: AppSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(sessionKey);
    return;
  }

  window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function readUsers(): StoredUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const users = window.localStorage.getItem(usersKey);
    return users ? (JSON.parse(users) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

export function saveUser(user: StoredUser) {
  if (typeof window === "undefined") {
    return;
  }

  const users = readUsers();
  const existingIndex = users.findIndex(
    (entry) => entry.email.toLowerCase() === user.email.toLowerCase() && entry.companyName === user.companyName,
  );

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }

  window.localStorage.setItem(usersKey, JSON.stringify(users));
}

export function deleteUser(email: string, companyName: string) {
  if (typeof window === "undefined") {
    return;
  }

  const users = readUsers().filter(
    (entry) => !(entry.email.toLowerCase() === email.toLowerCase() && entry.companyName === companyName),
  );
  window.localStorage.setItem(usersKey, JSON.stringify(users));
}

export function signOut() {
  void fetch("/api/auth/logout", { method: "POST" });
  writeSession(null);
  window.dispatchEvent(new Event("creative-business-os:session-updated"));
}

export function signIn(session: AppSession) {
  writeSession(session);
  window.dispatchEvent(new Event("creative-business-os:session-updated"));
}
