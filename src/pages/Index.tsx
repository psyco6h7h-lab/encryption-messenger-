import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/auth-form";
import { ChatList } from "@/components/chat/chat-list";
import { ChatView } from "@/components/chat/chat-view";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleAuthSuccess = () => {
    // Auth state change will be handled by the listener
  };

  const handleSignOut = () => {
    setSelectedChatId(null);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
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

  // Authenticated - show chat interface
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full">
        {/* Mobile: Show either chat list OR chat view */}
        <div className="flex-1 md:hidden">
          {selectedChatId ? (
            <ChatView 
              chatId={selectedChatId} 
              currentUser={user}
              onBack={handleBackToChats}
            />
          ) : (
            <ChatList 
              currentUser={user}
              onChatSelect={handleChatSelect}
              onSignOut={handleSignOut}
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
            />
          </div>

          {/* Chat View */}
          <div className="flex-1">
            {selectedChatId ? (
              <ChatView 
                chatId={selectedChatId} 
                currentUser={user}
                onBack={handleBackToChats}
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
    </div>
  );
};

export default Index;