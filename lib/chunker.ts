export function chunkText(text: string, chunkSize = 500, chunkOverlap = 100): string[] {
  // 1. Clean up excessive white spaces and normalize line breaks into single spaces
  const cleanedText = text.replace(/\s+/g, " ").trim();
  
  if (cleanedText.length <= chunkSize) {
    return [cleanedText];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  // 2. Slide the window across the text string
  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + chunkSize;

    // If we are not at the end of the document, try to break gracefully at a space
    if (endIndex < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(" ", endIndex);
      if (lastSpace > startIndex) {
        endIndex = lastSpace;
      }
    }

    const chunk = cleanedText.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move forward by the chunk size MINUS the overlap to keep them connected
    startIndex = endIndex - chunkOverlap;
  }

  return chunks;
}