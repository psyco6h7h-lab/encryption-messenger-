// Simple QR code generation using a text-based approach
// In a real app, you'd use a proper QR code library

export function generateQRCode(text: string): string {
  // This creates a simple ASCII QR-like representation
  // In production, you'd use libraries like 'qrcode' or 'qr-code-generator'
  
  const size = Math.max(10, Math.min(20, Math.ceil(text.length / 10)));
  const matrix: boolean[][] = [];
  
  // Initialize matrix
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      matrix[i][j] = false;
    }
  }
  
  // Simple pattern generation based on text
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const row = (charCode + i) % size;
    const col = (charCode * 2 + i) % size;
    matrix[row][col] = true;
  }
  
  // Add corner markers (like real QR codes)
  const corners = [[0, 0], [0, size-3], [size-3, 0]];
  corners.forEach(([r, c]) => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (r + i < size && c + j < size) {
          matrix[r + i][c + j] = (i === 0 || i === 2 || j === 0 || j === 2);
        }
      }
    }
  });
  
  // Convert to ASCII art
  let qrString = '';
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      qrString += matrix[i][j] ? '██' : '  ';
    }
    qrString += '\n';
  }
  
  return qrString;
}

export function generateQRCodeSVG(text: string): string {
  // Generate SVG QR code representation
  const size = Math.max(15, Math.min(25, Math.ceil(text.length / 8)));
  const cellSize = 8;
  const totalSize = size * cellSize;
  
  let svg = `<svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="white"/>`;
  
  // Generate pattern
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const row = (charCode + i) % size;
    const col = (charCode * 2 + i) % size;
    
    const x = col * cellSize;
    const y = row * cellSize;
    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
  }
  
  // Add corner markers
  const corners = [[0, 0], [0, size-3], [size-3, 0]];
  corners.forEach(([r, c]) => {
    const x = c * cellSize;
    const y = r * cellSize;
    svg += `<rect x="${x}" y="${y}" width="${cellSize * 3}" height="${cellSize * 3}" fill="black"/>`;
    svg += `<rect x="${x + cellSize}" y="${y + cellSize}" width="${cellSize}" height="${cellSize}" fill="white"/>`;
  });
  
  svg += '</svg>';
  return svg;
}

export function createQRCodeDataURL(text: string): string {
  const svg = generateQRCodeSVG(text);
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

