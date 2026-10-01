// Client-side authentication helpers for Phase 7.4
const TOKEN_KEY = 'alias_auth_token';
const SESSION_KEY = 'alias_auth_session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserSession {
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  role: string;
  access_token: string;
}

export function getAuthSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, session.access_token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const session = getAuthSession();
  if (!session?.access_token) return {};
  return {
    Authorization: `Bearer ${session.access_token}`,
    'X-Tenant-ID': session.tenant?.id || '',
  };
}

export async function loginWithDevCredentials(
  email: string = 'developer@example.com',
  tenantId?: string
): Promise<{ success: boolean; session?: UserSession; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, tenant_id: tenantId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      return { success: false, error: err.detail || 'Authentication failed' };
    }

    const data = await res.json();
    const session: UserSession = {
      user: data.user,
      tenant: data.tenant,
      role: data.role,
      access_token: data.access_token,
    };
    setAuthSession(session);
    return { success: true, session };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error during login';
    return { success: false, error: message };
  }
}
