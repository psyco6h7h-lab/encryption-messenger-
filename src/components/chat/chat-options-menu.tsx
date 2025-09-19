import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  MoreVertical, 
  Trash2, 
  UserX, 
  BellOff,
  Bell,
  Info,
  Archive,
  Pin,
  Search
} from "lucide-react";

interface ChatOptionsMenuProps {
  chatId: string;
  chatName: string;
  isGroup: boolean;
  isMuted: boolean;
  isPinned: boolean;
  onDeleteChat: () => void;
  onMuteChat: (muted: boolean) => void;
  onPinChat: (pinned: boolean) => void;
  onBlockUser?: () => void;
}

export function ChatOptionsMenu({ 
  chatId, 
  chatName, 
  isGroup, 
  isMuted, 
  isPinned,
  onDeleteChat,
  onMuteChat,
  onPinChat,
  onBlockUser 
}: ChatOptionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const { toast } = useToast();

  const handleDeleteChat = () => {
    onDeleteChat();
    setShowDeleteDialog(false);
    toast({
      title: "Chat Deleted",
      description: `${chatName || "Chat"} has been deleted`,
    });
  };

  const handleBlockUser = () => {
    if (onBlockUser) {
      onBlockUser();
      setShowBlockDialog(false);
      toast({
        title: "User Blocked",
        description: `${chatName} has been blocked`,
      });
    }
  };

  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    onMuteChat(newMutedState);
    toast({
      title: newMutedState ? "Chat Muted" : "Chat Unmuted",
      description: newMutedState 
        ? "You won't receive notifications from this chat" 
        : "You'll now receive notifications from this chat",
    });
  };

  const handlePinToggle = () => {
    const newPinnedState = !isPinned;
    onPinChat(newPinnedState);
    toast({
      title: newPinnedState ? "Chat Pinned" : "Chat Unpinned",
      description: newPinnedState 
        ? "This chat will appear at the top of your chat list" 
        : "This chat will appear in normal order",
    });
  };

  const handleArchiveChat = () => {
    toast({
      title: "Chat Archived",
      description: `${chatName || "Chat"} has been moved to archived chats`,
    });
  };

  const handleChatInfo = () => {
    toast({
      title: "Chat Info",
      description: `${isGroup ? "Group" : "Chat"} info: ${chatName || "Unknown"}`,
    });
  };

  const handleSearchInChat = () => {
    toast({
      title: "Search in Chat",
      description: "Search functionality coming soon!",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleChatInfo}>
            <Info className="h-4 w-4 mr-2" />
            Chat Info
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSearchInChat}>
            <Search className="h-4 w-4 mr-2" />
            Search in Chat
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handlePinToggle}>
            <Pin className="h-4 w-4 mr-2" />
            {isPinned ? "Unpin Chat" : "Pin Chat"}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleMuteToggle}>
            {isMuted ? (
              <Bell className="h-4 w-4 mr-2" />
            ) : (
              <BellOff className="h-4 w-4 mr-2" />
            )}
            {isMuted ? "Unmute Notifications" : "Mute Notifications"}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleArchiveChat}>
            <Archive className="h-4 w-4 mr-2" />
            Archive Chat
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {!isGroup && (
            <DropdownMenuItem 
              onClick={() => setShowBlockDialog(true)}
              className="text-orange-600 focus:text-orange-600"
            >
              <UserX className="h-4 w-4 mr-2" />
              Block User
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Chat Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChat}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will no longer be able to send you messages. You can unblock them later from settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockUser}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
