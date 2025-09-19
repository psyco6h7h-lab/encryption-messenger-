import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateEncryptionKey } from "@/lib/encryption";
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Moon, 
  Sun, 
  User, 
  Bell,
  Trash2,
  Key,
  Globe,
  Smartphone,
  Camera
} from "lucide-react";

interface SettingsProps {
  currentUser: any;
  onBack: () => void;
}

export function Settings({ currentUser, onBack }: SettingsProps) {
  const [settings, setSettings] = useState({
    // Security Settings
    endToEndEncryption: true,
    useEncoding: false,
    requirePasscode: false,
    
    // Privacy Settings
    lastSeenVisibility: "contacts",
    profilePictureVisibility: "everyone",
    
    // General Settings
    darkMode: false,
    notifications: true,
    soundEnabled: true,
    
    // Profile
    profileImage: "",
    
    // Account
    newPassword: "",
    confirmPassword: ""
  });

  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
    
    // Generate encryption key if encryption is enabled
    if (key === 'endToEndEncryption' && value) {
      const encryptionKey = generateEncryptionKey();
      localStorage.setItem('encryption_key', encryptionKey);
    }
    
    // Show confirmation for important changes
    if (['endToEndEncryption', 'useEncoding', 'requirePasscode'].includes(key)) {
      toast({
        title: "Security Setting Updated",
        description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${value ? 'enabled' : 'disabled'}`,
      });
    }
  };

  const handlePasswordChange = () => {
    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New password and confirmation don't match",
      });
      return;
    }
    
    if (settings.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
      });
      return;
    }
    
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed",
    });
    
    setSettings(prev => ({
      ...prev,
      newPassword: "",
      confirmPassword: ""
    }));
  };

  const handleDeleteAccount = () => {
    toast({
      variant: "destructive",
      title: "Account Deletion",
      description: "This feature requires additional confirmation. Contact support for account deletion.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card/80 backdrop-blur-md shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Profile Section */}
        <Card className="transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30 hover:scale-[1.02] group bg-card/60 backdrop-blur-sm border-2">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-all duration-300">
                <User className="h-6 w-6 text-primary" />
              </div>
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative group/avatar">
                <Avatar className="h-20 w-20 ring-2 ring-primary/20 transition-all duration-300 group-hover/avatar:ring-primary/40">
                  <AvatarImage src={settings.profileImage || ""} />
                  <AvatarFallback className="text-xl gradient-primary text-white font-semibold">
                    {currentUser?.display_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">{currentUser?.display_name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                  onClick={() => document.getElementById('profile-upload')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setSettings(prev => ({
                          ...prev,
                          profileImage: e.target?.result as string
                        }));
                        toast({
                          title: "Profile Photo Updated",
                          description: "Your profile picture has been changed successfully",
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/30 hover:scale-[1.02] group bg-card/60 backdrop-blur-sm border-2">
          <CardHeader className="pb-4 bg-gradient-to-r from-red-500/5 to-transparent dark:from-red-500/10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-red-500/10 rounded-full group-hover:bg-red-500/20 transition-all duration-300">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              Security Settings
            </CardTitle>
            <CardDescription className="text-sm opacity-80">
              Control how your messages are protected and secured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">End-to-End Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Protect all messages so only you and your contact can read them
                </p>
              </div>
              <Switch
                checked={settings.endToEndEncryption}
                onCheckedChange={(checked) => handleSettingChange('endToEndEncryption', checked)}
                className="transition-all duration-300 hover:scale-110 data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-muted"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Use Encoding Instead of Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Messages are encoded (lighter but less secure) and can only be decoded inside this app
                </p>
              </div>
              <Switch
                checked={settings.useEncoding}
                onCheckedChange={(checked) => handleSettingChange('useEncoding', checked)}
                className="transition-all duration-300 hover:scale-110"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Require Passcode for Encrypted Chats</Label>
                <p className="text-sm text-muted-foreground">
                  Adds an extra layer of security — enter passcode to open encrypted conversations
                </p>
              </div>
              <Switch
                checked={settings.requirePasscode}
                onCheckedChange={(checked) => handleSettingChange('requirePasscode', checked)}
                className="transition-all duration-300 hover:scale-110"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/30 hover:scale-[1.02] group bg-card/60 backdrop-blur-sm border-2">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/5 to-transparent dark:from-blue-500/10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-all duration-300">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
              Privacy Settings
            </CardTitle>
            <CardDescription className="text-sm opacity-80">
              Control who can see your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Last Seen Visibility</Label>
              <Select 
                value={settings.lastSeenVisibility} 
                onValueChange={(value) => handleSettingChange('lastSeenVisibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="contacts">Contacts Only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-base font-medium">Profile Picture Visibility</Label>
              <Select 
                value={settings.profilePictureVisibility} 
                onValueChange={(value) => handleSettingChange('profilePictureVisibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="contacts">Contacts Only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card className="transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 hover:scale-[1.02] group bg-card/60 backdrop-blur-sm border-2">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-500/5 to-transparent dark:from-green-500/10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-all duration-300">
                <Smartphone className="h-6 w-6 text-green-500" />
              </div>
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for new messages
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for messages and calls
                </p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-500/30 hover:scale-[1.02] group bg-card/60 backdrop-blur-sm border-2">
          <CardHeader className="pb-4 bg-gradient-to-r from-orange-500/5 to-transparent dark:from-orange-500/10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-orange-500/10 rounded-full group-hover:bg-orange-500/20 transition-all duration-300">
                <Key className="h-6 w-6 text-orange-500" />
              </div>
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Change Password</Label>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="New password"
                  value={settings.newPassword}
                  onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={settings.confirmPassword}
                  onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                />
                <Button 
                  onClick={handlePasswordChange}
                  disabled={!settings.newPassword || !settings.confirmPassword}
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="text-base font-medium text-destructive">Danger Zone</Label>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="w-full hover:bg-destructive/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
