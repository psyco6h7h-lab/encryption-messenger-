// Mock authentication system to replace Supabase
export interface MockUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface MockSession {
  user: MockUser;
  access_token: string;
}

// Mock users database (stored in localStorage)
const USERS_KEY = 'mock_users';
const SESSION_KEY = 'mock_session';

// Default users
const defaultUsers: MockUser[] = [
  {
    id: '1',
    email: 'demo@example.com',
    display_name: 'Demo User',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'test@example.com',
    display_name: 'Test User',
    created_at: new Date().toISOString(),
  }
];

// Initialize users if not exists
function initializeUsers() {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
}

// Get all users
function getUsers(): MockUser[] {
  initializeUsers();
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : defaultUsers;
}

// Save users
function saveUsers(users: MockUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Generate random ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Mock authentication service
export const mockAuth = {
  // Sign up
  signUp: async (email: string, password: string, displayName?: string): Promise<{ user?: MockUser; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { error: 'User already exists' };
    }
    
    // Create new user
    const newUser: MockUser = {
      id: generateId(),
      email,
      display_name: displayName || email.split('@')[0],
      created_at: new Date().toISOString(),
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto sign in the user
    const session: MockSession = {
      user: newUser,
      access_token: `mock_token_${newUser.id}`,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Trigger auth state change
    setTimeout(() => {
      const callback = (window as any).__authCallback;
      if (callback) {
        callback('SIGNED_IN', session);
      }
    }, 100);
    
    return { user: newUser };
  },

  // Sign in
  signIn: async (email: string, password: string): Promise<{ user?: MockUser; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { error: 'Invalid login credentials' };
    }
    
    // Create session
    const session: MockSession = {
      user,
      access_token: `mock_token_${user.id}`,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Trigger auth state change
    setTimeout(() => {
      const callback = (window as any).__authCallback;
      if (callback) {
        callback('SIGNED_IN', session);
      }
    }, 100);
    
    return { user };
  },

  // Sign out
  signOut: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
    
    // Trigger auth state change
    setTimeout(() => {
      const callback = (window as any).__authCallback;
      if (callback) {
        callback('SIGNED_OUT', null);
      }
    }, 100);
  },

  // Get current session
  getSession: (): MockSession | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Get current user
  getUser: (): MockUser | null => {
    const session = mockAuth.getSession();
    return session?.user || null;
  },

  // Auth state change listener (mock)
  onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
    // Store callback for later use
    (window as any).__authCallback = callback;
    
    // Return current session immediately
    const session = mockAuth.getSession();
    setTimeout(() => callback('INITIAL_SESSION', session), 0);
    
    // Return cleanup function
    return {
      unsubscribe: () => {
        delete (window as any).__authCallback;
      }
    };
  }
};
