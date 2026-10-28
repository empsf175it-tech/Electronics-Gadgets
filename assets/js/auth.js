/**
 * VOLTARIS AUTHENTICATION & ROLE MANAGEMENT MODULE (auth.js)
 * Demo credentials, session persistence, role permissions, and route protection.
 */

export const DEMO_ACCOUNTS = [
  { email: 'admin@voltaris.demo', password: 'Admin@123', name: 'Dr. Ronald Vance', role: 'Admin', avatar: 'RV' },
  { email: 'manager@voltaris.demo', password: 'Manager@123', name: 'Elena Rostova', role: 'Manager', avatar: 'ER' },
  { email: 'analyst@voltaris.demo', password: 'Analyst@123', name: 'Kaito Tanaka', role: 'Analyst', avatar: 'KT' },
  { email: 'viewer@voltaris.demo', password: 'Viewer@123', name: 'Sophia Morales', role: 'Viewer', avatar: 'SM' }
];

export const DEFAULT_PERMISSIONS = {
  Admin: {
    viewOverview: true,
    viewInventory: true,
    manageInventory: true,
    deleteInventory: true,
    viewAnalytics: true,
    viewReports: true,
    exportData: true,
    manageUsers: true,
    manageSettings: true
  },
  Manager: {
    viewOverview: true,
    viewInventory: true,
    manageInventory: true,
    deleteInventory: false,
    viewAnalytics: true,
    viewReports: true,
    exportData: true,
    manageUsers: false,
    manageSettings: false
  },
  Analyst: {
    viewOverview: true,
    viewInventory: true,
    manageInventory: false,
    deleteInventory: false,
    viewAnalytics: true,
    viewReports: true,
    exportData: true,
    manageUsers: false,
    manageSettings: false
  },
  Viewer: {
    viewOverview: true,
    viewInventory: false,
    manageInventory: false,
    deleteInventory: false,
    viewAnalytics: false,
    viewReports: false,
    exportData: false,
    manageUsers: false,
    manageSettings: false
  }
};

const SESSION_KEY = 'voltaris_session';
const PERMS_KEY = 'voltaris_permissions';

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getPermissions() {
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PERMISSIONS;
  } catch (e) {
    return DEFAULT_PERMISSIONS;
  }
}

export function updateRolePermission(role, permissionKey, value) {
  const perms = getPermissions();
  if (perms[role]) {
    perms[role][permissionKey] = value;
    localStorage.setItem(PERMS_KEY, JSON.stringify(perms));
  }
}

export function hasPermission(permissionKey) {
  const session = getSession();
  if (!session) return false;
  const perms = getPermissions();
  const rolePerms = perms[session.role];
  return rolePerms ? !!rolePerms[permissionKey] : false;
}

export function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = DEMO_ACCOUNTS.find(
    acc => acc.email.toLowerCase() === normalizedEmail && acc.password === password
  );

  if (user) {
    setSession({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      loginTime: new Date().toISOString()
    });
    return { success: true, user };
  }
  return { success: false, message: 'Invalid credentials. Please use one of the quick demo buttons.' };
}

export function logout() {
  clearSession();
  window.location.href = 'login.html';
}

export function requireAuth() {
  let session = getSession();
  if (!session) {
    // Automatically initialize with default Admin session so users directly access the dashboard
    const defaultUser = DEMO_ACCOUNTS[0]; // Dr. Ronald Vance (Admin)
    session = {
      name: defaultUser.name,
      email: defaultUser.email,
      role: defaultUser.role,
      avatar: defaultUser.avatar,
      loginTime: new Date().toISOString()
    };
    setSession(session);
  }
  return session;
}

export function redirectIfAuthenticated() {
  // Allow visiting login page to view or switch demo roles
}
