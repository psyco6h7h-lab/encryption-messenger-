// Mock data for chats and messages
export interface MockChat {
  id: string;
  name?: string;
  is_group: boolean;
  created_by: string;
  participants: string[];
  created_at: string;
  updated_at: string;
}

export interface MockMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'audio';
  created_at: string;
  updated_at: string;
}

export interface MockProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  status: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

// Storage keys
const CHATS_KEY = 'mock_chats';
const MESSAGES_KEY = 'mock_messages';
const PROFILES_KEY = 'mock_profiles';

// Default data
const defaultProfiles: MockProfile[] = [
  {
    id: '1',
    user_id: '1',
    display_name: 'Demo User',
    status: 'online',
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '2',
    display_name: 'Test User',
    status: 'online',
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const defaultChats: MockChat[] = [
  {
    id: '1',
    name: 'General Chat',
    is_group: true,
    created_by: '1',
    participants: ['1', '2'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    is_group: false,
    created_by: '1',
    participants: ['1', '2'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const defaultMessages: MockMessage[] = [
  {
    id: '1',
    chat_id: '1',
    sender_id: '2',
    content: 'Welcome to SecureChat! This is a demo message.',
    message_type: 'text',
    created_at: new Date(Date.now() - 60000).toISOString(),
    updated_at: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: '2',
    chat_id: '1',
    sender_id: '2',
    content: 'All your messages are end-to-end encrypted for maximum security! 🔒',
    message_type: 'text',
    created_at: new Date(Date.now() - 30000).toISOString(),
    updated_at: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: '3',
    chat_id: '2',
    sender_id: '2',
    content: 'This is a private conversation between you and Test User.',
    message_type: 'text',
    created_at: new Date(Date.now() - 120000).toISOString(),
    updated_at: new Date(Date.now() - 120000).toISOString(),
  }
];

// Initialize data if not exists
function initializeData() {
  if (!localStorage.getItem(PROFILES_KEY)) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(defaultProfiles));
  }
  if (!localStorage.getItem(CHATS_KEY)) {
    localStorage.setItem(CHATS_KEY, JSON.stringify(defaultChats));
  }
  if (!localStorage.getItem(MESSAGES_KEY)) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(defaultMessages));
  }
}

// Mock database operations
export const mockDB = {
  // Profiles
  profiles: {
    select: () => ({
      eq: (column: string, value: string) => ({
        single: async () => {
          initializeData();
          const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
          const profile = profiles.find((p: MockProfile) => p[column as keyof MockProfile] === value);
          return { data: profile, error: null };
        }
      })
    }),
    insert: async (data: Partial<MockProfile>) => {
      initializeData();
      const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
      const newProfile: MockProfile = {
        id: Math.random().toString(36).substring(2),
        user_id: data.user_id || '',
        display_name: data.display_name || '',
        avatar_url: data.avatar_url,
        status: data.status || 'online',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(newProfile);
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      return { data: newProfile, error: null };
    }
  },

  // Chats
  chats: {
    select: (columns?: string) => ({
      eq: (column: string, value: string) => ({
        single: async () => {
          initializeData();
          const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
          const chat = chats.find((c: MockChat) => c[column as keyof MockChat] === value);
          return { data: chat, error: null };
        }
      }),
      order: (column: string, options?: any) => ({
        async: async () => {
          initializeData();
          const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
          const currentUser = JSON.parse(localStorage.getItem('mock_session') || '{}').user;
          
          // Filter chats where user is a participant
          const userChats = chats.filter((chat: MockChat) => 
            chat.participants.includes(currentUser?.id)
          );
          
          return { data: userChats, error: null };
        }
      })
    })
  },

  // Messages
  messages: {
    select: (columns?: string) => ({
      eq: (column: string, value: string) => ({
        order: (orderColumn: string, options?: any) => ({
          async: async () => {
            initializeData();
            const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
            const chatMessages = messages.filter((m: MockMessage) => m[column as keyof MockMessage] === value);
            
            // Sort by created_at
            chatMessages.sort((a: MockMessage, b: MockMessage) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            return { data: chatMessages, error: null };
          }
        })
      })
    }),
    insert: async (data: Partial<MockMessage>) => {
      initializeData();
      const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
      const newMessage: MockMessage = {
        id: Math.random().toString(36).substring(2),
        chat_id: data.chat_id || '',
        sender_id: data.sender_id || '',
        content: data.content || '',
        message_type: data.message_type || 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      messages.push(newMessage);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
      return { data: newMessage, error: null };
    }
  }
};
