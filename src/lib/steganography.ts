// Simple steganography - hide text in images using LSB method
// This is a simplified version for demonstration

export function hideTextInImage(imageData: ImageData, text: string): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const binaryText = text.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('') + '1111111111111110'; // End marker
  
  let textIndex = 0;
  
  for (let i = 0; i < data.length && textIndex < binaryText.length; i += 4) {
    if (textIndex < binaryText.length) {
      // Modify the least significant bit of the red channel
      data[i] = (data[i] & 0xFE) | parseInt(binaryText[textIndex]);
      textIndex++;
    }
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

export function extractTextFromImage(imageData: ImageData): string {
  const data = imageData.data;
  let binaryText = '';
  
  for (let i = 0; i < data.length; i += 4) {
    binaryText += (data[i] & 1).toString();
  }
  
  // Find end marker
  const endMarker = '1111111111111110';
  const endIndex = binaryText.indexOf(endMarker);
  
  if (endIndex === -1) {
    throw new Error('No hidden text found in image');
  }
  
  binaryText = binaryText.substring(0, endIndex);
  
  // Convert binary to text
  let text = '';
  for (let i = 0; i < binaryText.length; i += 8) {
    const byte = binaryText.substr(i, 8);
    if (byte.length === 8) {
      text += String.fromCharCode(parseInt(byte, 2));
    }
  }
  
  return text;
}

export function createHiddenImageCanvas(file: File, text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hiddenImageData = hideTextInImage(imageData, text);
        ctx.putImageData(hiddenImageData, 0, 0);
        
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function extractFromImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hiddenText = extractTextFromImage(imageData);
        resolve(hiddenText);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

