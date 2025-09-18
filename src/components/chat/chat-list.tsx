import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
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
  participants: Array<{
    user_id: string;
    profiles: {
      display_name: string | null;
      avatar_url: string | null;
      status: string;
    } | null;
  }>;
  messages: Array<{
    content: string;
    created_at: string;
    sender_id: string;
  }>;
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

interface ChatListProps {
  currentUser: any;
  onChatSelect: (chatId: string) => void;
  onSignOut: () => void;
}

export function ChatList({ currentUser, onChatSelect, onSignOut }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchChats();
    
    // Subscribe to real-time chat updates
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchChats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats' },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', currentUser.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          id,
          name,
          is_group,
          updated_at
        `)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Fetch participants and messages separately to avoid complex joins
      const chatsWithDetails = await Promise.all(
        (chatsData || []).map(async (chat) => {
          // Get participants with profiles
          const { data: participants } = await supabase
            .from('chat_participants')
            .select(`
              user_id
            `)
            .eq('chat_id', chat.id);

          // Get profiles for participants
          const participantsWithProfiles = await Promise.all(
            (participants || []).map(async (participant) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url, status')
                .eq('user_id', participant.user_id)
                .single();

              return {
                user_id: participant.user_id,
                profiles: profile
              };
            })
          );

          // Get latest messages
          const { data: messages } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...chat,
            participants: participantsWithProfiles,
            messages: messages || []
          };
        })
      );
      
      setChats(chatsWithDetails);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chats"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const chatName = chat.is_group 
      ? chat.name || "Group Chat"
      : chat.participants
          .find(p => p.user_id !== currentUser.id)
          ?.profiles?.display_name || "Unknown User";
    
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
    
    const otherParticipant = chat.participants.find(p => p.user_id !== currentUser.id);
    return {
      name: otherParticipant?.profiles?.display_name || "Unknown User",
      avatar: otherParticipant?.profiles?.avatar_url,
      status: otherParticipant?.profiles?.status || "offline"
    };
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="gradient-primary text-white">
                {profile?.display_name?.[0] || currentUser.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h2 className="font-semibold text-sm">{profile?.display_name || "User"}</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
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
        
        <Button className="w-full gradient-primary text-white" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
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
              const lastMessage = chat.messages[0];
              
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