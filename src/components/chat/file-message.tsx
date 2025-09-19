import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Lock, 
  Unlock, 
  Shield, 
  RotateCcw,
  Image,
  Music,
  Video,
  Archive
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileMessageProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  isEncrypted?: boolean;
  isOwn?: boolean;
  onDownload?: () => void;
  onEncrypt?: () => void;
  onDecrypt?: () => void;
}

export function FileMessage({ 
  fileName, 
  fileSize, 
  fileType, 
  isEncrypted = false,
  isOwn = false,
  onDownload,
  onEncrypt,
  onDecrypt
}: FileMessageProps) {
  const { toast } = useToast();

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />;
    if (fileType.startsWith('audio/')) return <Music className="h-6 w-6 text-green-500" />;
    if (fileType.startsWith('video/')) return <Video className="h-6 w-6 text-purple-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-6 w-6 text-orange-500" />;
    return <FileText className="h-6 w-6 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn(
      "max-w-sm p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg",
      isOwn 
        ? "bg-primary/10 border-primary/20 hover:border-primary/40" 
        : "bg-muted border-muted-foreground/20 hover:border-muted-foreground/40"
    )}>
      <div className="flex items-center gap-3">
        <div className="relative">
          {getFileIcon()}
          {isEncrypted && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Lock className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{fileName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</span>
            {isEncrypted && (
              <Badge variant="destructive" className="text-xs">
                <Lock className="h-2 w-2 mr-1" />
                Encrypted
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="flex-1"
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
        
        {isEncrypted ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onDecrypt}
            className="flex-1 text-green-600 border-green-600/20 hover:bg-green-600/10"
          >
            <Unlock className="h-3 w-3 mr-1" />
            Decrypt
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onEncrypt}
            className="flex-1 text-red-600 border-red-600/20 hover:bg-red-600/10"
          >
            <Lock className="h-3 w-3 mr-1" />
            Encrypt
          </Button>
        )}
      </div>
    </div>
  );
}

