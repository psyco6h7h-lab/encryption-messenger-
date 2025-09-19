// Simple encryption/encoding utilities for the messaging app

// Simple Caesar cipher for encoding (basic obfuscation)
export function encodeMessage(message: string, shift: number = 3): string {
  return message
    .split('')
    .map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    })
    .join('');
}

export function decodeMessage(encodedMessage: string, shift: number = 3): string {
  return encodeMessage(encodedMessage, 26 - shift);
}

// Simple XOR encryption for more security
export function encryptMessage(message: string, password: string): string {
  if (!password) return message;
  
  let result = '';
  for (let i = 0; i < message.length; i++) {
    const messageChar = message.charCodeAt(i);
    const passwordChar = password.charCodeAt(i % password.length);
    result += String.fromCharCode(messageChar ^ passwordChar);
  }
  return btoa(result); // Base64 encode
}

export function decryptMessage(encryptedMessage: string, password: string): string {
  if (!password) return encryptedMessage;
  
  try {
    const decoded = atob(encryptedMessage); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const encryptedChar = decoded.charCodeAt(i);
      const passwordChar = password.charCodeAt(i % password.length);
      result += String.fromCharCode(encryptedChar ^ passwordChar);
    }
    return result;
  } catch (error) {
    return encryptedMessage; // Return original if decryption fails
  }
}

// Generate a random encryption key
export function generateEncryptionKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Hash password for storage (simple version)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  return {
    isValid: score >= 3,
    score,
    feedback
  };
}

// Additional cipher methods
export function base64Encode(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function base64Decode(encodedText: string): string {
  try {
    return decodeURIComponent(escape(atob(encodedText)));
  } catch (error) {
    throw new Error('Invalid Base64 text');
  }
}

export function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, function(char) {
    const start = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
  });
}

export function reverseText(text: string): string {
  return text.split('').reverse().join('');
}

export function textToBinary(text: string): string {
  return text.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join(' ');
}

export function binaryToText(binary: string): string {
  try {
    return binary.split(' ').map(bin => 
      String.fromCharCode(parseInt(bin, 2))
    ).join('');
  } catch (error) {
    throw new Error('Invalid binary format');
  }
}

export function textToHex(text: string): string {
  return text.split('').map(char => 
    char.charCodeAt(0).toString(16).padStart(2, '0')
  ).join(' ');
}

export function hexToText(hex: string): string {
  try {
    return hex.split(' ').map(h => 
      String.fromCharCode(parseInt(h, 16))
    ).join('');
  } catch (error) {
    throw new Error('Invalid hex format');
  }
}

export function generateMD5Hash(text: string): string {
  // Simple hash function (not real MD5, but good for demo)
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function calculateStrength(text: string): { score: number; label: string; color: string } {
  let score = 0;
  
  if (text.length > 50) score += 20;
  if (text.length > 100) score += 20;
  if (/[A-Z]/.test(text)) score += 15;
  if (/[a-z]/.test(text)) score += 15;
  if (/[0-9]/.test(text)) score += 15;
  if (/[^A-Za-z0-9]/.test(text)) score += 15;
  
  if (score >= 80) return { score, label: 'Very Strong', color: 'green' };
  if (score >= 60) return { score, label: 'Strong', color: 'blue' };
  if (score >= 40) return { score, label: 'Medium', color: 'yellow' };
  if (score >= 20) return { score, label: 'Weak', color: 'orange' };
  return { score, label: 'Very Weak', color: 'red' };
}

export function autoDetectCipher(text: string): string {
  // Simple cipher detection
  if (/^[A-Za-z0-9+/]*={0,2}$/.test(text)) return 'Base64';
  if (/^[01\s]+$/.test(text)) return 'Binary';
  if (/^[0-9a-fA-F\s]+$/.test(text)) return 'Hexadecimal';
  if (text === text.split('').reverse().join('')) return 'Reversed';
  if (/^[A-Za-z\s]+$/.test(text)) return 'Possible Caesar/ROT13';
  return 'Unknown/Custom Encryption';
}
