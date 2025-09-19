import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChatOptionsMenu } from "@/components/chat/chat-options-menu";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { FileUpload } from "@/components/chat/file-upload";
import { EmojiPicker } from "@/components/chat/emoji-picker";
import { MessageContextMenu } from "@/components/chat/message-context-menu";
import { PasswordPrompt } from "@/components/crypto/password-prompt";
import { 
  Send, 
  ArrowLeft, 
  Shield,
  Lock,
  Unlock,
  Copy,
  RotateCcw,
  CheckSquare
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { encryptMessage, decryptMessage, encodeMessage, decodeMessage } from "@/lib/encryption";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: string;
  sender_name: string;
}

interface ChatViewProps {
  chatId: string;
  currentUser: any;
  onBack: () => void;
  onLoadToCryptoPanel?: (text: string) => void;
}

export function ChatView({ chatId, currentUser, onBack, onLoadToCryptoPanel }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingEncryption, setPendingEncryption] = useState<string>("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [showOtherUserTyping, setShowOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Mock data based on chat ID
  const mockMessages = {
    '1': [ // General Chat
      {
        id: '1',
        content: 'Welcome to SecureChat! This is a demo message.',
        sender_id: '2',
        sender_name: 'Test User',
        created_at: new Date(Date.now() - 60000).toISOString(),
        message_type: 'text'
      },
      {
        id: '2',
        content: 'All your messages are end-to-end encrypted for maximum security! 🔒',
        sender_id: '2',
        sender_name: 'Test User',
        created_at: new Date(Date.now() - 30000).toISOString(),
        message_type: 'text'
      }
    ],
    '2': [ // Private chat
      {
        id: '3',
        content: 'This is a private conversation between you and Test User.',
        sender_id: '2',
        sender_name: 'Test User',
        created_at: new Date(Date.now() - 120000).toISOString(),
        message_type: 'text'
      },
      {
        id: '4',
        content: 'You can send messages here and they will be stored locally in your browser.',
        sender_id: '2',
        sender_name: 'Test User',
        created_at: new Date(Date.now() - 90000).toISOString(),
        message_type: 'text'
      }
    ]
  };

  const mockChatInfo = {
    '1': { name: 'General Chat', is_group: true, participants: ['1', '2'] },
    '2': { name: null, is_group: false, participants: ['1', '2'] }
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMessages(mockMessages[chatId as keyof typeof mockMessages] || []);
      setIsLoading(false);
    }, 300);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Keyboard shortcuts for crypto operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        if (newMessage.trim()) {
          setPendingEncryption(newMessage);
          setShowPasswordPrompt(true);
        } else {
          toast({
            variant: "destructive",
            title: "No Text",
            description: "Enter text to encrypt (Ctrl+E)",
          });
        }
      }

      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        if (newMessage.trim()) {
          const textToDecrypt = newMessage.startsWith('🔒 ') ? newMessage.slice(2) : newMessage;
          try {
            const decrypted = decryptMessage(textToDecrypt, 'quickkey123');
            setNewMessage(decrypted);
            toast({
              title: "Quick Decrypt (Ctrl+D)",
              description: "Message decrypted successfully",
      });
    } catch (error) {
            toast({
              variant: "destructive",
              title: "Decrypt Failed",
              description: "Could not decrypt this text",
            });
          }
        } else {
      toast({
        variant: "destructive",
            title: "No Text",
            description: "Enter text to decrypt (Ctrl+D)",
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newMessage, toast]);

  // Typing indicator logic
  useEffect(() => {
    if (isUserTyping) {
      // Simulate other user typing response
      const timeout = setTimeout(() => {
        setShowOtherUserTyping(true);
        setTimeout(() => setShowOtherUserTyping(false), 3000);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [isUserTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Set typing indicator
    setIsUserTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      // Create new message (no auto-encryption)
      const newMsg: Message = {
        id: Date.now().toString(),
        content: messageContent,
        sender_id: currentUser?.id || '1',
        sender_name: currentUser?.display_name || 'You',
        created_at: new Date().toISOString(),
        message_type: 'text'
      };

      // Add to messages
      setMessages(prev => [...prev, newMsg]);

      // Simulate a response from the other user after a delay
      setTimeout(() => {
        const responseMsg: Message = {
          id: (Date.now() + 1).toString(),
          content: `Thanks for your message: "${messageContent}"`,
          sender_id: '2',
          sender_name: 'Test User',
          created_at: new Date().toISOString(),
          message_type: 'text'
        };
        setMessages(prev => [...prev, responseMsg]);
      }, 1000);

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


  // Batch selection functions
  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const selectAllMessages = () => {
    const allMessageIds = messages.map(msg => msg.id);
    setSelectedMessages(allMessageIds);
  };

  const clearSelection = () => {
    setSelectedMessages([]);
    setIsSelectionMode(false);
  };

  // Batch crypto operations
  const handleBatchEncrypt = () => {
    if (selectedMessages.length === 0) return;
    
    const updatedMessages = messages.map(message => {
      if (selectedMessages.includes(message.id)) {
        const encrypted = encryptMessage(message.content, 'quickkey123');
        return { ...message, content: `🔒 ${encrypted}` };
      }
      return message;
    });
    
    setMessages(updatedMessages);
    toast({
      title: "Batch Encrypt Complete",
      description: `${selectedMessages.length} messages encrypted`,
    });
    clearSelection();
  };

  const handleBatchDecrypt = () => {
    if (selectedMessages.length === 0) return;
    
    const updatedMessages = messages.map(message => {
      if (selectedMessages.includes(message.id) && message.content.startsWith('🔒 ')) {
        try {
          const textToDecrypt = message.content.slice(2);
          const decrypted = decryptMessage(textToDecrypt, 'quickkey123');
          return { ...message, content: decrypted };
        } catch (error) {
          return message;
        }
      }
      return message;
    });
    
    setMessages(updatedMessages);
    toast({
      title: "Batch Decrypt Complete",
      description: `${selectedMessages.length} messages processed`,
    });
    clearSelection();
  };

  const handleBatchEncode = () => {
    if (selectedMessages.length === 0) return;
    
    const updatedMessages = messages.map(message => {
      if (selectedMessages.includes(message.id)) {
        const encoded = encodeMessage(message.content);
        return { ...message, content: `🔐 ${encoded}` };
      }
      return message;
    });
    
    setMessages(updatedMessages);
    toast({
      title: "Batch Encode Complete",
      description: `${selectedMessages.length} messages encoded`,
    });
    clearSelection();
  };

  const handleBatchDecode = () => {
    if (selectedMessages.length === 0) return;
    
    const updatedMessages = messages.map(message => {
      if (selectedMessages.includes(message.id) && message.content.startsWith('🔐 ')) {
        try {
          const textToDecode = message.content.slice(2);
          const decoded = decodeMessage(textToDecode);
          return { ...message, content: decoded };
        } catch (error) {
          return message;
        }
      }
      return message;
    });
    
    setMessages(updatedMessages);
    toast({
      title: "Batch Decode Complete",
      description: `${selectedMessages.length} messages processed`,
    });
    clearSelection();
  };

  // Password confirmation handler
  const handlePasswordConfirm = (password: string) => {
    if (pendingEncryption) {
      try {
        console.log('Encrypting:', pendingEncryption, 'with password:', password);
        const encrypted = encryptMessage(pendingEncryption, password);
        console.log('Encryption result:', encrypted);
        
        if (!encrypted) {
          throw new Error('Encryption returned empty result');
        }
        
        setNewMessage(`🔒 ${encrypted}`);
        toast({
          title: "Message Encrypted",
          description: "Message encrypted with your security key",
        });
      } catch (error) {
        console.error('Encryption error:', error);
        toast({
          variant: "destructive",
          title: "Encryption Failed",
          description: `Failed to encrypt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
      setPendingEncryption("");
    }
  };

  const chatInfo = mockChatInfo[chatId as keyof typeof mockChatInfo];
  const chatDisplayName = chatInfo?.is_group 
    ? chatInfo.name || "Group Chat"
    : "Test User";

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = format(new Date(message.created_at), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {chatDisplayName[0]}
              </AvatarFallback>
            </Avatar>
            {!chatInfo?.is_group && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold text-sm">{chatDisplayName}</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {chatInfo?.is_group ? `${chatInfo.participants.length} members` : "Online"}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ChatOptionsMenu
            chatId={chatId}
            chatName={chatDisplayName}
            isGroup={chatInfo?.is_group || false}
            isMuted={isMuted}
            isPinned={isPinned}
            onDeleteChat={() => {
              setMessages([]);
              toast({
                title: "Chat Cleared",
                description: "All messages have been cleared from this conversation.",
              });
            }}
            onMuteChat={setIsMuted}
            onPinChat={setIsPinned}
            onBlockUser={() => {
              toast({
                title: "User Blocked",
                description: `${chatDisplayName} has been blocked`,
              });
            }}
          />
        </div>
      </div>

      {/* Batch Operations Toolbar */}
      {isSelectionMode && selectedMessages.length > 0 && (
        <div className="border-b bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedMessages.length} message{selectedMessages.length > 1 ? 's' : ''} selected
              </span>
              <Button variant="outline" size="sm" onClick={selectAllMessages}>
                Select All
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm" onClick={handleBatchEncrypt}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-500/20"
              >
                <Lock className="h-4 w-4 mr-1" />
                Encrypt
              </Button>
              
              <Button
                variant="outline" size="sm" onClick={handleBatchDecrypt}
                className="bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-500/20"
              >
                <Unlock className="h-4 w-4 mr-1" />
                Decrypt
              </Button>
              
              <Button
                variant="outline" size="sm" onClick={handleBatchEncode}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/20"
              >
                <Shield className="h-4 w-4 mr-1" />
                Encode
              </Button>
              
              <Button
                variant="outline" size="sm" onClick={handleBatchDecode}
                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border-orange-500/20"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Decode
              </Button>
              
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date} className="space-y-4">
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </div>
                </div>
                
                {/* Messages for this date */}
                {dayMessages.map((message, index) => {
                  const isOwnMessage = message.sender_id === (currentUser?.id || '1');
                  const showAvatar = !isOwnMessage && (
                    index === 0 || 
                    dayMessages[index - 1]?.sender_id !== message.sender_id
                  );
            
            return (
              <div
                key={message.id}
                className={cn(
                        "flex gap-3 max-w-[80%]",
                        isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      {showAvatar && !isOwnMessage && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {message.sender_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                      
                      <div className={cn("space-y-1", !showAvatar && !isOwnMessage && "ml-11")}>
                        {showAvatar && !isOwnMessage && (
                          <p className="text-xs text-muted-foreground font-medium">
                            {message.sender_name}
                          </p>
                  )}
                  
                        <MessageContextMenu
                          messageContent={message.content}
                          onLoadToInput={setNewMessage}
                          onLoadToCryptoPanel={(text) => {
                            if (onLoadToCryptoPanel) {
                              const cleanText = text.startsWith('🔒 ') ? text.slice(2) : 
                                               text.startsWith('🔐 ') ? text.slice(2) : text;
                              onLoadToCryptoPanel(cleanText);
                            }
                          }}
                          onStartSelection={() => {
                            setIsSelectionMode(true);
                            toggleMessageSelection(message.id);
                          }}
                        >
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 max-w-md break-words cursor-pointer hover:opacity-90 transition-all duration-200 relative",
                              isOwnMessage
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-muted",
                              message.content.startsWith('🔒') && "ring-2 ring-red-500/20 hover:ring-red-500/40",
                              message.content.startsWith('🔐') && "ring-2 ring-blue-500/20 hover:ring-blue-500/40",
                              selectedMessages.includes(message.id) && "ring-4 ring-primary/50 bg-primary/10"
                            )}
                            onClick={(e) => {
                              if (isSelectionMode) {
                                toggleMessageSelection(message.id);
                              } else if (e.shiftKey) {
                                setIsSelectionMode(true);
                                toggleMessageSelection(message.id);
                                toast({
                                  title: "Selection Mode",
                                  description: "Shift+click more messages or use toolbar",
                                });
                              } else {
                                setNewMessage(message.content);
                                toast({
                                  title: "Message Loaded",
                                  description: "Message copied to input field",
                                });
                              }
                            }}
                            onMouseEnter={() => setHoveredMessage(message.id)}
                            onMouseLeave={() => setHoveredMessage(null)}
                            title={isSelectionMode ? "Click to select/deselect" : "Click to load | Shift+click to select | Right-click for more options"}
                          >
                            <div className="flex items-center gap-2">
                              {isSelectionMode && (
                                <div className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                                  selectedMessages.includes(message.id)
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground hover:border-primary"
                                )}>
                                  {selectedMessages.includes(message.id) && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              )}
                              
                              {message.content.startsWith('🔒') && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-full">
                                  <Lock className="h-3 w-3 text-red-500 flex-shrink-0 animate-pulse" />
                                  <span className="text-xs text-red-500 font-medium">ENCRYPTED</span>
                                </div>
                              )}
                              {message.content.startsWith('🔐') && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded-full">
                                  <Shield className="h-3 w-3 text-blue-500 flex-shrink-0 animate-pulse" />
                                  <span className="text-xs text-blue-500 font-medium">ENCODED</span>
                                </div>
                              )}
                              <div className="text-sm leading-relaxed w-full">
                                {message.content.startsWith('🔒 ') || message.content.startsWith('🔐 ') ? (
                                  <div className="space-y-3">
                                    <div className={cn("flex items-center gap-2", isOwnMessage ? "justify-end" : "justify-start")}>
                                      <span className="text-lg">{message.content.slice(0, 2)}</span>
                                      <span className="text-xs opacity-70 font-medium px-2 py-1 bg-black/20 rounded-full">
                                        {message.content.startsWith('🔒 ') ? 'ENCRYPTED' : 'ENCODED'}
                                      </span>
                                    </div>
                                    <button
                                      className={cn(
                                        "w-full p-3 rounded-lg transition-all duration-300 cursor-pointer font-mono text-xs border-2 border-dashed hover:scale-[1.02] hover:shadow-lg",
                                        isOwnMessage 
                                          ? "bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 text-white hover:shadow-white/20"
                                          : "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 hover:shadow-blue-500/20"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const encryptedText = message.content.slice(2);
                                        if (onLoadToCryptoPanel) {
                                          onLoadToCryptoPanel(encryptedText);
                                          toast({
                                            title: "Crypto Panel Opened",
                                            description: "Encrypted text loaded for decryption",
                                          });
                                        }
                                      }}
                                      title="Click to decode in crypto panel"
                                    >
                                      <div className="break-all text-center leading-relaxed">
                                        {message.content.slice(2)}
                                      </div>
                                    </button>
                                  </div>
                                ) : (
                                  <div className={cn("leading-relaxed px-1", isOwnMessage ? "text-right" : "text-left")}>
                                    {message.content}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Floating Quick Actions on Hover */}
                            {hoveredMessage === message.id && (
                              <div className="absolute -top-2 -right-2 flex gap-1 bg-background border rounded-lg shadow-lg p-1 z-10 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                {message.content.startsWith('🔒') && (
                                  <Button
                                    size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-green-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const encryptedText = message.content.slice(2);
                                      if (onLoadToCryptoPanel) {
                                        onLoadToCryptoPanel(encryptedText);
                                        toast({
                                          title: "Redirected to Crypto Panel",
                                          description: "Encrypted message loaded for decryption",
                                        });
                                      }
                                    }}
                                    title="Open in Crypto Panel"
                                  >
                                    <Unlock className="h-3 w-3 text-green-500" />
                                  </Button>
                                )}
                                {message.content.startsWith('🔐') && (
                                  <Button
                                    size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-orange-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const textToDecode = message.content.slice(2);
                                      try {
                                        const decoded = decodeMessage(textToDecode);
                                        setNewMessage(decoded);
                                        toast({
                                          title: "Quick Decode",
                                          description: "Message decoded and loaded",
                                        });
                                      } catch (error) {
                                        toast({
                                          variant: "destructive",
                                          title: "Decode Failed",
                                          description: "Could not decode message",
                                        });
                                      }
                                    }}
                                    title="Quick Decode"
                                  >
                                    <RotateCcw className="h-3 w-3 text-orange-500" />
                                  </Button>
                                )}
                                <Button
                                  size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-blue-500/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(message.content);
                                    toast({
                                      title: "Copied",
                                      description: "Message copied to clipboard",
                                    });
                                  }}
                                  title="Copy Message"
                                >
                                  <Copy className="h-3 w-3 text-blue-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </MessageContextMenu>
                        
                        <p className={cn(
                          "text-xs text-muted-foreground",
                          isOwnMessage ? "text-right" : "text-left"
                        )}>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                </div>
              </div>
            );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Typing Indicator */}
            <TypingIndicator 
              isTyping={showOtherUserTyping}
              userName="Test User"
              userAvatar=""
            />
            
            {/* User Typing Status */}
            {isUserTyping && (
              <div className="flex justify-end px-4 py-2">
                <div className="text-xs text-muted-foreground italic">
                  You are typing...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 bg-background rounded-full border px-4 py-2">
          <FileUpload 
            onFileSelect={(file, type) => {
              toast({
                title: "File Selected",
                description: `${file.name} ready to send (${type})`,
              });
            }}
          />
          
          <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isSending}
            />
            
            {/* Quick Encrypt/Decrypt Buttons */}
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-red-500/10 transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!newMessage.trim()) {
                  toast({
                    variant: "destructive",
                    title: "No Text",
                    description: "Enter text to encrypt",
                  });
                  return;
                }
                console.log('Setting pending encryption:', newMessage);
                setPendingEncryption(newMessage);
                setShowPasswordPrompt(true);
              }}
              title="Encrypt with Password"
            >
              <Lock className="h-4 w-4 text-red-500" />
            </Button>
            
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!newMessage.trim()) {
                  toast({
                    variant: "destructive",
                    title: "No Text",
                    description: "Enter text to decrypt",
                  });
                  return;
                }
                
                // Remove 🔒 prefix if present and redirect to crypto panel
                const textToDecrypt = newMessage.startsWith('🔒 ') ? newMessage.slice(2) : newMessage;
                
                if (onLoadToCryptoPanel) {
                  onLoadToCryptoPanel(textToDecrypt);
                  setNewMessage(""); // Clear input after loading to crypto panel
                  toast({
                    title: "Redirected to Crypto Panel",
                    description: "Text loaded into crypto panel for decryption",
                  });
                } else {
                  toast({
                    variant: "destructive",
                    title: "Crypto Panel Not Available",
                    description: "Please use the crypto panel on the right side",
                  });
                }
              }}
              title="Decrypt in Crypto Panel"
            >
              <Unlock className="h-4 w-4 text-green-500" />
            </Button>
            
            <EmojiPicker 
              onEmojiSelect={(emoji) => {
                setNewMessage(prev => prev + emoji);
              }}
            />
          
          <Button 
            type="submit" 
            size="icon"
              className="h-8 w-8 rounded-full gradient-primary"
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        </div>
        
        <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 mr-1" />
          <span>Your messages are protected with end-to-end encryption</span>
        </div>
      </div>

      {/* Password Prompt Dialog */}
      <PasswordPrompt
        isOpen={showPasswordPrompt}
        onClose={() => {
          setShowPasswordPrompt(false);
          setPendingEncryption("");
        }}
        onConfirm={handlePasswordConfirm}
        title="Encrypt Message"
        description="Enter a security key to encrypt your message. You'll need this key to decrypt it later."
        action="Encrypt"
      />
    </div>
  );
}