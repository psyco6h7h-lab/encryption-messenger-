import { useState, useEffect } from "react";
import { mockAuth, MockUser, MockSession } from "@/lib/mock-auth";
import { AuthForm } from "@/components/auth/auth-form";
import { ChatList } from "@/components/chat/chat-list";
import { ChatView } from "@/components/chat/chat-view";
import { Settings } from "@/pages/Settings";
import { EnhancedCryptoPanel } from "@/components/crypto/enhanced-crypto-panel";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [cryptoPanelInput, setCryptoPanelInput] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up mock auth state listener
    const subscription = mockAuth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setSelectedChatId(null);
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome!",
            description: "You have been signed in successfully.",
          });
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    const currentSession = mockAuth.getSession();
    console.log('Current session on load:', currentSession);
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setIsLoading(false);

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleAuthSuccess = () => {
    // Manually check for session after auth success
    setTimeout(() => {
      const currentSession = mockAuth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    }, 200);
  };

  const handleSignOut = async () => {
    await mockAuth.signOut();
    setUser(null);
    setSession(null);
    setSelectedChatId(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleBackFromSettings = () => {
    setShowSettings(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">Loading SecureChat...</h2>
          <p className="text-muted-foreground">Please wait while we set up your secure connection</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !session) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // Show Settings if requested
  if (showSettings) {
    return <Settings currentUser={user} onBack={handleBackFromSettings} />;
  }

  // Authenticated - show chat interface
  return (
    <div className="h-screen overflow-hidden relative">
      <div className="flex h-full">
        {/* Mobile: Show either chat list OR chat view */}
        <div className="flex-1 md:hidden">
          {selectedChatId ? (
            <ChatView 
              chatId={selectedChatId} 
              currentUser={user}
              onBack={handleBackToChats}
              onLoadToCryptoPanel={setCryptoPanelInput}
              onLoadToCryptoPanel={setCryptoPanelInput}
            />
          ) : (
            <ChatList 
              currentUser={user}
              onChatSelect={handleChatSelect}
              onSignOut={handleSignOut}
              onShowSettings={handleShowSettings}
            />
          )}
        </div>

        {/* Desktop: Show both chat list and chat view side by side */}
        <div className="hidden md:flex w-full h-full">
          {/* Chat List Sidebar */}
          <div className="w-80 border-r bg-card/30 backdrop-blur-sm">
            <ChatList 
              currentUser={user}
              onChatSelect={handleChatSelect}
              onSignOut={handleSignOut}
              onShowSettings={handleShowSettings}
            />
          </div>

          {/* Chat View */}
          <div className="flex-1">
            {selectedChatId ? (
              <ChatView 
                chatId={selectedChatId} 
                currentUser={user}
                onBack={handleBackToChats}
              onLoadToCryptoPanel={setCryptoPanelInput}
                onLoadToCryptoPanel={setCryptoPanelInput}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-background/50">
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                      Welcome to SecureChat
                    </h2>
                    <p className="text-muted-foreground">
                      Select a conversation from the sidebar to start messaging
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>End-to-end encrypted</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Crypto Panel */}
      <EnhancedCryptoPanel 
        onPasteToChat={(text) => {
          console.log('Paste to chat:', text);
        }}
        inputFromChat={cryptoPanelInput}
        onInputReceived={() => setCryptoPanelInput("")}
      />
    </div>
  );
};

export default Index;