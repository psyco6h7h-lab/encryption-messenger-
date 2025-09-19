import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Lock, 
  Unlock, 
  Shield, 
  RotateCcw,
  Reply,
  Trash2,
  CheckSquare
} from "lucide-react";
import { encryptMessage, decryptMessage, encodeMessage, decodeMessage } from "@/lib/encryption";

interface MessageContextMenuProps {
  children: React.ReactNode;
  messageContent: string;
  onLoadToInput: (text: string) => void;
  onLoadToCryptoPanel?: (text: string) => void;
  onStartSelection?: () => void;
}

export function MessageContextMenu({ 
  children, 
  messageContent, 
  onLoadToInput,
  onLoadToCryptoPanel,
  onStartSelection
}: MessageContextMenuProps) {
  const { toast } = useToast();

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      toast({
        title: "Message Copied",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy message",
      });
    }
  };

  const handleQuickEncrypt = () => {
    try {
      const encrypted = encryptMessage(messageContent, 'quickkey123');
      onLoadToInput(`🔒 ${encrypted}`);
      toast({
        title: "Message Encrypted",
        description: "Encrypted message loaded to input",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Encryption Failed",
        description: "Failed to encrypt message",
      });
    }
  };

  const handleQuickDecrypt = () => {
    try {
      const textToDecrypt = messageContent.startsWith('🔒 ') 
        ? messageContent.slice(2) 
        : messageContent;
      
      const decrypted = decryptMessage(textToDecrypt, 'quickkey123');
      onLoadToInput(decrypted);
      toast({
        title: "Message Decrypted",
        description: "Decrypted message loaded to input",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Decryption Failed",
        description: "Failed to decrypt message. May not be encrypted with default key.",
      });
    }
  };

  const handleQuickEncode = () => {
    try {
      const encoded = encodeMessage(messageContent);
      onLoadToInput(`🔐 ${encoded}`);
      toast({
        title: "Message Encoded",
        description: "Encoded message loaded to input",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Encoding Failed",
        description: "Failed to encode message",
      });
    }
  };

  const handleQuickDecode = () => {
    try {
      const textToDecode = messageContent.startsWith('🔐 ') 
        ? messageContent.slice(2) 
        : messageContent;
      
      const decoded = decodeMessage(textToDecode);
      onLoadToInput(decoded);
      toast({
        title: "Message Decoded",
        description: "Decoded message loaded to input",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Decoding Failed",
        description: "Failed to decode message",
      });
    }
  };

  const handleLoadToCryptoPanel = () => {
    if (onLoadToCryptoPanel) {
      const cleanText = messageContent.startsWith('🔒 ') ? messageContent.slice(2) : 
                       messageContent.startsWith('🔐 ') ? messageContent.slice(2) : messageContent;
      onLoadToCryptoPanel(cleanText);
      toast({
        title: "Loaded to Crypto Panel",
        description: "Message loaded to crypto panel for advanced processing",
      });
    }
  };

  const isEncrypted = messageContent.startsWith('🔒');
  const isEncoded = messageContent.startsWith('🔐');

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleCopyMessage}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Message
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => onLoadToInput(messageContent)}>
          <Reply className="h-4 w-4 mr-2" />
          Load to Input
        </ContextMenuItem>
        
        {onLoadToCryptoPanel && (
          <ContextMenuItem onClick={handleLoadToCryptoPanel}>
            <Shield className="h-4 w-4 mr-2" />
            Open in Crypto Panel
          </ContextMenuItem>
        )}
        
        {onStartSelection && (
          <ContextMenuItem onClick={() => {
            onStartSelection();
            toast({
              title: "Selection Mode",
              description: "Click messages to select them for batch operations",
            });
          }}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Select Messages
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleQuickEncrypt}>
          <Lock className="h-4 w-4 mr-2 text-red-500" />
          Quick Encrypt
        </ContextMenuItem>
        
        {isEncrypted && (
          <ContextMenuItem onClick={handleQuickDecrypt}>
            <Unlock className="h-4 w-4 mr-2 text-green-500" />
            Quick Decrypt
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleQuickEncode}>
          <Shield className="h-4 w-4 mr-2 text-blue-500" />
          Quick Encode
        </ContextMenuItem>
        
        {isEncoded && (
          <ContextMenuItem onClick={handleQuickDecode}>
            <RotateCcw className="h-4 w-4 mr-2 text-orange-500" />
            Quick Decode
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Message
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
