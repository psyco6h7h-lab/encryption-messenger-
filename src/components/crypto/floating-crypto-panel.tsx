import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Lock, 
  Unlock, 
  Copy, 
  RotateCcw, 
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Key,
  Send,
  FileText,
  QrCode,
  Hash,
  Binary,
  Zap,
  Search,
  Upload,
  Download,
  Image,
  Gauge
} from "lucide-react";
import { 
  encryptMessage, 
  decryptMessage, 
  encodeMessage, 
  decodeMessage,
  generateEncryptionKey 
} from "@/lib/encryption";
import { cn } from "@/lib/utils";

interface FloatingCryptoPanelProps {
  onPasteToChat?: (text: string) => void;
}

export function FloatingCryptoPanel({ onPasteToChat }: FloatingCryptoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleEncrypt = () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter text to encrypt",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a password",
      });
      return;
    }

    try {
      const encrypted = encryptMessage(inputText, password);
      setOutputText(encrypted);
      toast({
        title: "Text Encrypted",
        description: "Your text has been encrypted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Encryption Failed",
        description: "Failed to encrypt the text",
      });
    }
  };

  const handleDecrypt = () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter encrypted text to decrypt",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter the password",
      });
      return;
    }

    try {
      const decrypted = decryptMessage(inputText, password);
      setOutputText(decrypted);
      toast({
        title: "Text Decrypted",
        description: "Your text has been decrypted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Decryption Failed",
        description: "Failed to decrypt the text. Check your password.",
      });
    }
  };

  const handleEncode = () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter text to encode",
      });
      return;
    }

    try {
      const encoded = encodeMessage(inputText);
      setOutputText(encoded);
      toast({
        title: "Text Encoded",
        description: "Your text has been encoded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Encoding Failed",
        description: "Failed to encode the text",
      });
    }
  };

  const handleDecode = () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter encoded text to decode",
      });
      return;
    }

    try {
      const decoded = decodeMessage(inputText);
      setOutputText(decoded);
      toast({
        title: "Text Decoded",
        description: "Your text has been decoded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Decoding Failed",
        description: "Failed to decode the text",
      });
    }
  };

  const handleCopy = async () => {
    if (!outputText) {
      toast({
        variant: "destructive",
        title: "Nothing to Copy",
        description: "No output text available",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
      });
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setPassword("");
    toast({
      title: "Cleared",
      description: "All fields have been cleared",
    });
  };

  const generateRandomPassword = () => {
    const newPassword = generateEncryptionKey();
    setPassword(newPassword);
    toast({
      title: "Password Generated",
      description: "A secure password has been generated",
    });
  };

  return (
    <div className={cn(
      "fixed right-4 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300",
      isExpanded ? "w-96" : "w-12"
    )}>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg",
          "gradient-primary text-white hover:scale-110 transition-all duration-300"
        )}
        size="icon"
      >
        {isExpanded ? <ChevronRight className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
      </Button>

      {/* Main Panel */}
      {isExpanded && (
        <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Crypto Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input Text */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Input Text</Label>
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Password (for encryption/decryption)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomPassword}
                  title="Generate Random Password"
                >
                  <Key className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <Tabs defaultValue="encrypt" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="encrypt">Encryption</TabsTrigger>
                <TabsTrigger value="encode">Encoding</TabsTrigger>
              </TabsList>
              
              <TabsContent value="encrypt" className="space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleEncrypt}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Encrypt
                  </Button>
                  <Button
                    onClick={handleDecrypt}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Decrypt
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="encode" className="space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleEncode}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Encode
                  </Button>
                  <Button
                    onClick={handleDecode}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Decode
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Output Text */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Output</Label>
              <Textarea
                placeholder="Result will appear here..."
                value={outputText}
                readOnly
                className="min-h-[80px] resize-none bg-muted/50"
              />
            </div>

            {/* Utility Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={!outputText}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              {onPasteToChat && (
                <Button
                  onClick={() => {
                    if (!outputText) {
                      toast({
                        variant: "destructive",
                        title: "No Output",
                        description: "No text to paste to chat",
                      });
                      return;
                    }
                    onPasteToChat(outputText);
                    toast({
                      title: "Pasted to Chat",
                      description: "Text pasted to message input",
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!outputText}
                >
                  <Send className="h-4 w-4 mr-2" />
                  To Chat
                </Button>
              )}
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
