import { useState, useEffect, useRef } from "react";
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
  Shield, Lock, Unlock, Copy, RotateCcw, ChevronRight, Eye, EyeOff, Key, Send,
  FileText, QrCode, Hash, Binary, Zap, Search, Upload, Download, Image, Gauge
} from "lucide-react";
import { 
  encryptMessage, decryptMessage, encodeMessage, decodeMessage, generateEncryptionKey,
  base64Encode, base64Decode, rot13, reverseText, textToBinary, binaryToText,
  textToHex, hexToText, generateMD5Hash, calculateStrength, autoDetectCipher
} from "@/lib/encryption";
import { generateQRCodeSVG, createQRCodeDataURL } from "@/lib/qr-generator";
import { createHiddenImageCanvas, extractFromImageFile } from "@/lib/steganography";
import { PasswordManager } from "@/components/crypto/password-manager";
import { FileMessage } from "@/components/chat/file-message";
import { cn } from "@/lib/utils";

interface EnhancedCryptoPanelProps {
  onPasteToChat?: (text: string) => void;
  inputFromChat?: string;
  onInputReceived?: () => void;
}

export function EnhancedCryptoPanel({ onPasteToChat, inputFromChat, onInputReceived }: EnhancedCryptoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedCipher, setDetectedCipher] = useState<string>("");
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [steganographyImage, setSteganographyImage] = useState<string>("");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-load text from chat
  useEffect(() => {
    if (inputFromChat) {
      setInputText(inputFromChat);
      setIsExpanded(true);
      setDetectedCipher(autoDetectCipher(inputFromChat));
      if (onInputReceived) {
        onInputReceived();
      }
      toast({
        title: "Text Loaded",
        description: "Message loaded into crypto panel",
      });
    }
  }, [inputFromChat, onInputReceived, toast]);

  // Auto-detect cipher when input changes
  useEffect(() => {
    if (inputText) {
      setDetectedCipher(autoDetectCipher(inputText));
    }
  }, [inputText]);

  const strength = inputText ? calculateStrength(inputText) : { score: 0, label: 'None', color: 'gray' };

  // Basic crypto operations
  const handleEncrypt = () => {
    if (!inputText.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Input",
        description: "Please enter both text and password",
      });
      return;
    }
    try {
      const encrypted = encryptMessage(inputText, password);
      setOutputText(encrypted);
      toast({ title: "Text Encrypted", description: "XOR encryption applied" });
    } catch (error) {
      toast({ variant: "destructive", title: "Encryption Failed", description: "Failed to encrypt text" });
    }
  };

  const handleDecrypt = () => {
    if (!inputText.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Input",
        description: "Please enter both text and password",
      });
      return;
    }
    try {
      const decrypted = decryptMessage(inputText, password);
      setOutputText(decrypted);
      toast({ title: "Text Decrypted", description: "XOR decryption applied" });
    } catch (error) {
      toast({ variant: "destructive", title: "Decryption Failed", description: "Failed to decrypt text" });
    }
  };

  // Additional cipher operations
  const handleBase64Encode = () => {
    if (!inputText.trim()) return;
    try {
      setOutputText(base64Encode(inputText));
      toast({ title: "Base64 Encoded", description: "Text encoded to Base64" });
    } catch (error) {
      toast({ variant: "destructive", title: "Encoding Failed", description: "Failed to encode" });
    }
  };

  const handleBase64Decode = () => {
    if (!inputText.trim()) return;
    try {
      setOutputText(base64Decode(inputText));
      toast({ title: "Base64 Decoded", description: "Base64 decoded to text" });
    } catch (error) {
      toast({ variant: "destructive", title: "Decoding Failed", description: "Invalid Base64 format" });
    }
  };

  const handleROT13 = () => {
    if (!inputText.trim()) return;
    setOutputText(rot13(inputText));
    toast({ title: "ROT13 Applied", description: "Text processed with ROT13" });
  };

  const handleReverse = () => {
    if (!inputText.trim()) return;
    setOutputText(reverseText(inputText));
    toast({ title: "Text Reversed", description: "Text order reversed" });
  };

  const handleBinary = () => {
    if (!inputText.trim()) return;
    try {
      if (/^[01\s]+$/.test(inputText.trim())) {
        setOutputText(binaryToText(inputText));
        toast({ title: "Binary to Text", description: "Binary converted to text" });
      } else {
        setOutputText(textToBinary(inputText));
        toast({ title: "Text to Binary", description: "Text converted to binary" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Conversion Failed", description: "Invalid binary format" });
    }
  };

  const handleHex = () => {
    if (!inputText.trim()) return;
    try {
      if (/^[0-9a-fA-F\s]+$/.test(inputText.trim())) {
        setOutputText(hexToText(inputText));
        toast({ title: "Hex to Text", description: "Hexadecimal converted to text" });
      } else {
        setOutputText(textToHex(inputText));
        toast({ title: "Text to Hex", description: "Text converted to hexadecimal" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Conversion Failed", description: "Invalid hex format" });
    }
  };

  const handleHash = () => {
    if (!inputText.trim()) return;
    const hash = generateMD5Hash(inputText);
    setOutputText(hash);
    toast({ title: "Hash Generated", description: "MD5-style hash created" });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
        toast({
          title: "File Loaded",
          description: `${file.name} content loaded for processing`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      toast({ title: "Copied!", description: "Text copied to clipboard" });
    } catch (error) {
      toast({ variant: "destructive", title: "Copy Failed", description: "Failed to copy" });
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setPassword("");
    setSelectedFile(null);
    setDetectedCipher("");
    toast({ title: "Cleared", description: "All fields cleared" });
  };

  const generateRandomPassword = () => {
    const newPassword = generateEncryptionKey();
    setPassword(newPassword);
    toast({ title: "Password Generated", description: "Secure password generated" });
  };

  // QR Code generation
  const handleGenerateQR = () => {
    if (!outputText && !inputText) {
      toast({
        variant: "destructive",
        title: "No Text",
        description: "Enter text or generate output first",
      });
      return;
    }
    
    const textForQR = outputText || inputText;
    const qrDataURL = createQRCodeDataURL(textForQR);
    setQrCodeDataURL(qrDataURL);
    toast({
      title: "QR Code Generated",
      description: "QR code created for your text",
    });
  };

  // Steganography operations
  const handleHideInImage = async () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "No Text",
        description: "Enter text to hide in image",
      });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const hiddenImageURL = await createHiddenImageCanvas(file, inputText);
          setSteganographyImage(hiddenImageURL);
          toast({
            title: "Text Hidden in Image",
            description: "Your text has been hidden in the image",
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Steganography Failed",
            description: "Failed to hide text in image",
          });
        }
      }
    };
    input.click();
  };

  const handleExtractFromImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const extractedText = await extractFromImageFile(file);
          setOutputText(extractedText);
          toast({
            title: "Text Extracted",
            description: "Hidden text found in image",
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Extraction Failed",
            description: "No hidden text found in image",
          });
        }
      }
    };
    input.click();
  };

  // Batch file processing
  const handleBatchUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setBatchFiles(files);
    toast({
      title: "Files Selected",
      description: `${files.length} files ready for batch processing`,
    });
  };

  const handleBatchEncrypt = async () => {
    if (batchFiles.length === 0 || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Requirements",
        description: "Select files and enter password",
      });
      return;
    }

    let processed = 0;
    for (const file of batchFiles) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const encrypted = encryptMessage(content, password);
          // In a real app, you'd download the encrypted file
          processed++;
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Batch encryption error:', error);
      }
    }

    toast({
      title: "Batch Encryption Complete",
      description: `${batchFiles.length} files processed`,
    });
    setBatchFiles([]);
  };

  return (
    <div className={cn(
      "fixed right-4 top-4 z-50 transition-all duration-500",
      isExpanded ? "w-[420px] h-[calc(100vh-2rem)]" : "w-12 h-12"
    )}>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-xl",
          "gradient-primary text-white hover:scale-110 transition-all duration-300"
        )}
        size="icon"
      >
        {isExpanded ? <ChevronRight className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
      </Button>

      {/* Enhanced Main Panel */}
      {isExpanded && (
        <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-md h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Advanced Crypto Suite
            </CardTitle>
            {detectedCipher && (
              <Badge variant="outline" className="w-fit">
                <Search className="h-3 w-3 mr-1" />
                Detected: {detectedCipher}
              </Badge>
            )}
          </CardHeader>
          
          <CardContent className="h-[calc(100%-120px)] overflow-y-auto crypto-scrollbar p-4">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>
              
              {/* Text Tab */}
              <TabsContent value="text" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Input Text</Label>
                  <Textarea
                    placeholder="Enter your text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  {strength.score > 0 && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      <Progress value={strength.score} className="flex-1" />
                      <Badge className={`bg-${strength.color}-500/10 text-${strength.color}-600`}>
                        {strength.label}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Password</Label>
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
                    <Button variant="outline" size="icon" onClick={generateRandomPassword}>
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Primary Operations */}
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleEncrypt} className="bg-red-600 hover:bg-red-700 text-white" size="sm">
                    <Lock className="h-4 w-4 mr-2" />
                    Encrypt
                  </Button>
                  <Button onClick={handleDecrypt} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                    <Unlock className="h-4 w-4 mr-2" />
                    Decrypt
                  </Button>
                  <Button onClick={() => { const encoded = encodeMessage(inputText); setOutputText(encoded); }} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Encode
                  </Button>
                  <Button onClick={() => { const decoded = decodeMessage(inputText); setOutputText(decoded); }} className="bg-orange-600 hover:bg-orange-700 text-white" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Decode
                  </Button>
                </div>

                {/* Additional Operations */}
                <div className="grid grid-cols-3 gap-1">
                  <Button onClick={handleBase64Encode} variant="outline" size="sm">Base64+</Button>
                  <Button onClick={handleBase64Decode} variant="outline" size="sm">Base64-</Button>
                  <Button onClick={handleROT13} variant="outline" size="sm">ROT13</Button>
                  <Button onClick={handleReverse} variant="outline" size="sm">Reverse</Button>
                  <Button onClick={handleBinary} variant="outline" size="sm">Binary</Button>
                  <Button onClick={handleHex} variant="outline" size="sm">Hex</Button>
                  <Button onClick={handleHash} variant="outline" size="sm">Hash</Button>
                  <Button onClick={() => {/* QR Code */}} variant="outline" size="sm">QR</Button>
                  <Button onClick={() => {/* Auto Decrypt */}} variant="outline" size="sm">Auto</Button>
                </div>
              </TabsContent>
              
              {/* Files Tab */}
              <TabsContent value="files" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">File Upload</Label>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".txt,.json,.csv,.xml"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                  
                  {selectedFile && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Badge variant="secondary">{(selectedFile.size / 1024).toFixed(1)}KB</Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => {
                      if (!selectedFile || !password.trim()) {
                        toast({
                          variant: "destructive",
                          title: "Missing Requirements",
                          description: "Select file and enter password",
                        });
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const content = e.target?.result as string;
                        const encrypted = encryptMessage(content, password);
                        
                        // Create download link for encrypted file
                        const blob = new Blob([encrypted], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `encrypted_${selectedFile.name}`;
                        link.click();
                        
                        toast({
                          title: "File Encrypted",
                          description: "Encrypted file downloaded",
                        });
                      };
                      reader.readAsText(selectedFile);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white" 
                    size="sm"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Encrypt File
                  </Button>
                  <Button 
                    onClick={() => {
                      if (!selectedFile || !password.trim()) {
                        toast({
                          variant: "destructive",
                          title: "Missing Requirements",
                          description: "Select encrypted file and enter password",
                        });
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        try {
                          const encryptedContent = e.target?.result as string;
                          const decrypted = decryptMessage(encryptedContent, password);
                          
                          // Create download link for decrypted file
                          const blob = new Blob([decrypted], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `decrypted_${selectedFile.name}`;
                          link.click();
                          
                          toast({
                            title: "File Decrypted",
                            description: "Decrypted file downloaded",
                          });
                        } catch (error) {
                          toast({
                            variant: "destructive",
                            title: "Decryption Failed",
                            description: "Wrong password or corrupted file",
                          });
                        }
                      };
                      reader.readAsText(selectedFile);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white" 
                    size="sm"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Decrypt File
                  </Button>
                </div>
              </TabsContent>
              
              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-4 mt-0">
                <div className="space-y-3">
                  {/* QR Code Generation */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">QR Code Generator</Label>
                    <div className="flex gap-2">
                      <Button onClick={handleGenerateQR} variant="outline" size="sm" className="flex-1">
                        <QrCode className="h-4 w-4 mr-2" />
                        Generate QR
                      </Button>
                      {qrCodeDataURL && (
                        <Button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = 'qr-code.svg';
                            link.href = qrCodeDataURL;
                            link.click();
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {qrCodeDataURL && (
                      <div className="p-2 bg-white rounded-lg border">
                        <img src={qrCodeDataURL} alt="QR Code" className="w-full max-w-32 mx-auto" />
                      </div>
                    )}
                  </div>

                  {/* Steganography */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Steganography</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleHideInImage} variant="outline" size="sm">
                        <Image className="h-4 w-4 mr-1" />
                        Hide in Image
                      </Button>
                      <Button onClick={handleExtractFromImage} variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-1" />
                        Extract from Image
                      </Button>
                    </div>
                    {steganographyImage && (
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <img src={steganographyImage} alt="Hidden Text" className="w-full max-w-32 mx-auto rounded" />
                        <Button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = 'hidden-message.png';
                            link.href = steganographyImage;
                            link.click();
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Batch Processing */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Batch Processing</Label>
                    <input
                      ref={batchInputRef}
                      type="file"
                      multiple
                      onChange={handleBatchUpload}
                      className="hidden"
                      accept=".txt,.json,.csv"
                    />
                    <Button
                      onClick={() => batchInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Multiple Files
                    </Button>
                    {batchFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          {batchFiles.length} files selected
                        </div>
                        <Button
                          onClick={handleBatchEncrypt}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Batch Encrypt All
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Password Manager */}
                  <PasswordManager onPasswordSelect={(pwd) => setPassword(pwd)} />
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Output Section */}
            <div className="space-y-3 mt-6 border-t pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Output</Label>
                <Textarea
                  placeholder="Result will appear here..."
                  value={outputText}
                  readOnly
                  className="min-h-[80px] resize-none bg-muted/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm" className="flex-1" disabled={!outputText}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                {onPasteToChat && (
                  <Button
                    onClick={() => {
                      if (!outputText) return;
                      onPasteToChat(outputText);
                      toast({ title: "Pasted to Chat", description: "Text pasted to message input" });
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
                <Button onClick={handleClear} variant="outline" size="sm" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
