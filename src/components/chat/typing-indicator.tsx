import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  isTyping: boolean;
  userName: string;
  userAvatar?: string;
}

export function TypingIndicator({ isTyping, userName, userAvatar }: TypingIndicatorProps) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (!isTyping) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping]);

  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 animate-fade-in">
      <Avatar className="h-6 w-6">
        <AvatarImage src={userAvatar} />
        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
          {userName[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
        <span className="text-sm text-muted-foreground">
          {userName} is typing{dots}
        </span>
      </div>
    </div>
  );
}

// Add this to your global CSS for the fade-in animation
// @keyframes fade-in {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fade-in {
//   animation: fade-in 0.3s ease-out;
// }
