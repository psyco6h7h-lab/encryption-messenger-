import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Shield,
  Edit
} from "lucide-react";

interface StoredPassword {
  id: string;
  name: string;
  password: string;
  createdAt: string;
  usageCount: number;
}

interface PasswordManagerProps {
  onPasswordSelect?: (password: string) => void;
}

export function PasswordManager({ onPasswordSelect }: PasswordManagerProps) {
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [newPasswordName, setNewPasswordName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  // Load passwords from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('crypto_passwords');
    if (stored) {
      setPasswords(JSON.parse(stored));
    }
  }, []);

  // Save passwords to localStorage
  const savePasswords = (updatedPasswords: StoredPassword[]) => {
    setPasswords(updatedPasswords);
    localStorage.setItem('crypto_passwords', JSON.stringify(updatedPasswords));
  };

  const addPassword = () => {
    if (!newPasswordName.trim() || !newPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both name and password",
      });
      return;
    }

    const newStoredPassword: StoredPassword = {
      id: Date.now().toString(),
      name: newPasswordName,
      password: newPassword,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    savePasswords([...passwords, newStoredPassword]);
    setNewPasswordName("");
    setNewPassword("");
    
    toast({
      title: "Password Saved",
      description: `Password "${newPasswordName}" saved successfully`,
    });
  };

  const deletePassword = (id: string) => {
    const updated = passwords.filter(p => p.id !== id);
    savePasswords(updated);
    toast({
      title: "Password Deleted",
      description: "Password removed from manager",
    });
  };

  const usePassword = (password: StoredPassword) => {
    // Increment usage count
    const updated = passwords.map(p => 
      p.id === password.id 
        ? { ...p, usageCount: p.usageCount + 1 }
        : p
    );
    savePasswords(updated);

    if (onPasswordSelect) {
      onPasswordSelect(password.password);
    }

    toast({
      title: "Password Selected",
      description: `Using password: ${password.name}`,
    });
  };

  const copyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Password Copied",
        description: "Password copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy password",
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Key className="h-4 w-4 text-primary" />
          Password Manager
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add New Password */}
        <div className="space-y-2">
          <Label className="text-xs">Add New Password</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Name..."
              value={newPasswordName}
              onChange={(e) => setNewPasswordName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="password"
              placeholder="Password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={addPassword}
              size="sm"
              className="bg-primary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stored Passwords */}
        <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
          {passwords.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-xs">
              No saved passwords
            </div>
          ) : (
            passwords.map((pwd) => (
              <div key={pwd.id} className="p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">{pwd.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Used {pwd.usageCount}x
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-mono">
                        {showPasswords[pwd.id] ? pwd.password : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => togglePasswordVisibility(pwd.id)}
                      >
                        {showPasswords[pwd.id] ? 
                          <EyeOff className="h-3 w-3" /> : 
                          <Eye className="h-3 w-3" />
                        }
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => usePassword(pwd)}
                    >
                      <Shield className="h-3 w-3 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyPassword(pwd.password)}
                    >
                      <Copy className="h-3 w-3 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => deletePassword(pwd.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
