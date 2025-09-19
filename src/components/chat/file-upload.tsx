import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Paperclip, 
  Image, 
  File, 
  Camera, 
  MapPin,
  Music,
  Video
} from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File, type: 'image' | 'file' | 'audio' | 'video') => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (type: 'image' | 'file' | 'audio' | 'video', inputRef: React.RefObject<HTMLInputElement>) => {
    inputRef.current?.click();
    setIsOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file' | 'audio' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
        });
        return;
      }

      onFileSelect(file, type);
      toast({
        title: "File Selected",
        description: `${file.name} is ready to send`,
      });
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast({
            title: "Location Shared",
            description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          });
          
          // Create a mock location "file"
          const locationData = new Blob([JSON.stringify({ latitude, longitude })], { type: 'application/json' });
          const locationFile = new File([locationData], 'location.json', { type: 'application/json' });
          onFileSelect(locationFile, 'file');
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Location Access Denied",
            description: "Please enable location access to share your location",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Location Not Supported",
        description: "Your browser doesn't support location sharing",
      });
    }
    setIsOpen(false);
  };

  const handleCameraCapture = () => {
    // In a real app, this would open the camera
    toast({
      title: "Camera",
      description: "Camera capture feature coming soon!",
    });
    setIsOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Paperclip className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => handleFileSelect('image', imageInputRef)}>
            <Image className="h-4 w-4 mr-2 text-blue-500" />
            Photo & Video
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCameraCapture}>
            <Camera className="h-4 w-4 mr-2 text-green-500" />
            Camera
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleFileSelect('file', fileInputRef)}>
            <File className="h-4 w-4 mr-2 text-purple-500" />
            Document
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleFileSelect('audio', audioInputRef)}>
            <Music className="h-4 w-4 mr-2 text-orange-500" />
            Audio
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleLocationShare}>
            <MapPin className="h-4 w-4 mr-2 text-red-500" />
            Location
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={(e) => handleFileChange(e, 'file')}
        className="hidden"
      />
      
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileChange(e, 'audio')}
        className="hidden"
      />
      
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileChange(e, 'video')}
        className="hidden"
      />
    </>
  );
}
