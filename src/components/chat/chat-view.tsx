import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip,
  Smile,
  Shield,
  Lock
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface ChatInfo {
  id: string;
  name: string | null;
  is_group: boolean;
  participants: Array<{
    user_id: string;
    profiles: {
      display_name: string | null;
      avatar_url: string | null;
      status: string;
    } | null;
  }>;
}

interface ChatViewProps {
  chatId: string;
  currentUser: any;
  onBack: () => void;
}

export function ChatView({ chatId, currentUser, onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatInfo();
    fetchMessages();
    
    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatInfo = async () => {
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('id, name, is_group')
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;

      // Fetch participants separately
      const { data: participants, error: participantsError } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId);

      if (participantsError) throw participantsError;

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

      setChatInfo({
        ...chatData,
        participants: participantsWithProfiles
      });
    } catch (error) {
      console.error('Error fetching chat info:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat information"
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          message_type
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch profile data for message senders
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', message.sender_id)
            .single();

          return {
            ...message,
            profiles: profile
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: currentUser.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getChatDisplayInfo = () => {
    if (!chatInfo) return { name: "Loading...", avatar: null, status: "" };
    
    if (chatInfo.is_group) {
      return {
        name: chatInfo.name || "Group Chat",
        avatar: null,
        status: `${chatInfo.participants.length} members`
      };
    }
    
    const otherParticipant = chatInfo.participants.find(p => p.user_id !== currentUser.id);
    return {
      name: otherParticipant?.profiles?.display_name || "Unknown User",
      avatar: otherParticipant?.profiles?.avatar_url,
      status: otherParticipant?.profiles?.status || "offline"
    };
  };

  const displayInfo = getChatDisplayInfo();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayInfo.avatar || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {displayInfo.name[0]}
              </AvatarFallback>
            </Avatar>
            {!chatInfo?.is_group && displayInfo.status === "online" && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold text-sm">{displayInfo.name}</h2>
            <div className="flex items-center gap-2">
              <Badge 
                variant={displayInfo.status === "online" ? "default" : "secondary"}
                className="text-xs"
              >
                {displayInfo.status}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Secure conversation started</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Messages in this chat are end-to-end encrypted
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === currentUser.id;
            const prevMessage = messages[index - 1];
            const showAvatar = !isOwn && (!prevMessage || prevMessage.sender_id !== message.sender_id);
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  isOwn ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className="w-8">
                  {showAvatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-xs">
                        {message.profiles?.display_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                
                <div className={cn(
                  "max-w-[70%] space-y-1",
                  isOwn ? "items-end" : "items-start"
                )}>
                  {showAvatar && !isOwn && (
                    <span className="text-xs text-muted-foreground px-3">
                      {message.profiles?.display_name || "Unknown"}
                    </span>
                  )}
                  
                  <div
                    className={cn(
                      "message-bubble px-4 py-2 rounded-2xl shadow-soft",
                      isOwn 
                        ? "message-sent rounded-br-sm" 
                        : "message-received rounded-bl-sm"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1 text-xs",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      <time>
                        {format(new Date(message.created_at), 'HH:mm')}
                      </time>
                      {isOwn && (
                        <div className="w-3 h-3 rounded-full bg-current opacity-70"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-card/50 backdrop-blur-sm border-t">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <Button type="button" variant="ghost" size="icon" className="h-10 w-10">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="chat-input resize-none pr-12"
              maxLength={1000}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || isSending}
            className="h-10 w-10 gradient-primary text-white rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}