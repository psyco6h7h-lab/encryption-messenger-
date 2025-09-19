import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { mockAuth } from "@/lib/mock-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Search, 
  Plus, 
  Settings, 
  LogOut,
  User,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Chat {
  id: string;
  name: string | null;
  is_group: boolean;
  updated_at: string;
  participants: string[];
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

interface ChatListProps {
  currentUser: any;
  onChatSelect: (chatId: string) => void;
  onSignOut: () => void;
  onShowSettings: () => void;
}

export function ChatList({ currentUser, onChatSelect, onSignOut, onShowSettings }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'busy'>('online');
  const { toast } = useToast();

  // Mock data
  const mockChats: Chat[] = [
    {
      id: '1',
      name: 'General Chat',
      is_group: true,
      participants: ['1', '2'],
      updated_at: new Date().toISOString(),
      lastMessage: {
        content: 'Welcome to SecureChat! This is a demo message.',
        created_at: new Date(Date.now() - 60000).toISOString(),
        sender_id: '2'
      }
    },
    {
      id: '2',
      name: null,
      is_group: false,
      participants: ['1', '2'],
      updated_at: new Date(Date.now() - 120000).toISOString(),
      lastMessage: {
        content: 'This is a private conversation between you and Test User.',
        created_at: new Date(Date.now() - 120000).toISOString(),
        sender_id: '2'
      }
    }
  ];

  const mockProfiles = {
    '1': { display_name: 'Demo User', avatar_url: null, status: 'online' },
    '2': { display_name: 'Test User', avatar_url: null, status: 'online' }
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProfile({
        display_name: currentUser?.display_name || 'Demo User',
        avatar_url: null
      });
      setChats(mockChats);
      setIsLoading(false);
    }, 500);
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await mockAuth.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const chatName = chat.is_group 
      ? chat.name || "Group Chat"
      : mockProfiles['2']?.display_name || "Unknown User";
    
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getChatDisplayInfo = (chat: Chat) => {
    if (chat.is_group) {
      return {
        name: chat.name || "Group Chat",
        avatar: null,
        status: `${chat.participants.length} members`
      };
    }
    
    // For private chats, show the other user
    const otherUserId = chat.participants.find(id => id !== currentUser?.id) || '2';
    const otherUser = mockProfiles[otherUserId as keyof typeof mockProfiles];
    
    return {
      name: otherUser?.display_name || "Test User",
      avatar: otherUser?.avatar_url,
      status: otherUser?.status || "online"
    };
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <div className="relative flex-shrink-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                {profile?.display_name?.[0] || currentUser?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-success rounded-full border border-background"></div>
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h2 className="font-semibold text-xs sm:text-sm truncate">{profile?.display_name || "User"}</h2>
            <p className="text-xs text-muted-foreground capitalize hidden sm:block">{userStatus}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0"
            onClick={onShowSettings}
            title="Settings"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading chats...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start a new chat to begin messaging
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {filteredChats.map((chat) => {
              const displayInfo = getChatDisplayInfo(chat);
              const lastMessage = chat.lastMessage;
              
              return (
                <Card
                  key={chat.id}
                  className="p-3 cursor-pointer hover:bg-accent/50 transition-colors border-0 bg-transparent shadow-none"
                  onClick={() => onChatSelect(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={displayInfo.avatar || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {displayInfo.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {!chat.is_group && displayInfo.status === "online" && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate text-sm">
                          {displayInfo.name}
                        </h3>
                        {lastMessage && (
                          <time className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                          </time>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage ? lastMessage.content : "No messages yet"}
                        </p>
                        <div className="flex items-center gap-1">
                          {!chat.is_group && (
                            <Badge 
                              variant={displayInfo.status === "online" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {displayInfo.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}