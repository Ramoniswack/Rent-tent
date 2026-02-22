// Utility functions for message handling

/**
 * Generates a unique client-side ID for messages
 * Format: userId_timestamp_randomString
 */
export function generateClientSideId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${userId}_${timestamp}_${random}`;
}

/**
 * Generates a sequence of client-side IDs for batch operations
 */
export function generateClientSideIds(userId: string, count: number): string[] {
  const baseTimestamp = Date.now();
  return Array.from({ length: count }, (_, index) => {
    const timestamp = baseTimestamp + index; // Ensure uniqueness
    const random = Math.random().toString(36).substring(2, 15);
    return `${userId}_${timestamp}_${random}`;
  });
}

/**
 * Extracts user ID from client-side ID
 */
export function extractUserIdFromClientSideId(clientSideId: string): string | null {
  const parts = clientSideId.split('_');
  return parts.length >= 3 ? parts[0] : null;
}

/**
 * Extracts timestamp from client-side ID
 */
export function extractTimestampFromClientSideId(clientSideId: string): number | null {
  const parts = clientSideId.split('_');
  if (parts.length >= 3) {
    const timestamp = parseInt(parts[1], 10);
    return isNaN(timestamp) ? null : timestamp;
  }
  return null;
}

/**
 * Validates client-side ID format
 */
export function isValidClientSideId(clientSideId: string): boolean {
  if (!clientSideId || typeof clientSideId !== 'string') {
    return false;
  }
  
  const parts = clientSideId.split('_');
  if (parts.length !== 3) {
    return false;
  }
  
  const [userId, timestamp, random] = parts;
  
  // Check if timestamp is a valid number
  const timestampNum = parseInt(timestamp, 10);
  if (isNaN(timestampNum) || timestampNum <= 0) {
    return false;
  }
  
  // Check if userId and random are non-empty strings
  if (!userId || !random) {
    return false;
  }
  
  return true;
}

/**
 * Sorts messages by timestamp and sequence for proper ordering
 */
export function sortMessagesBySequence(messages: any[]): any[] {
  return messages.sort((a, b) => {
    // Primary sort by timestamp
    const timeA = new Date(a.timestamp || a.createdAt).getTime();
    const timeB = new Date(b.timestamp || b.createdAt).getTime();
    
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    
    // Secondary sort by sequence number for tie-breaking
    const seqA = a.sequenceNumber || 0;
    const seqB = b.sequenceNumber || 0;
    
    if (seqA !== seqB) {
      return seqA - seqB;
    }
    
    // Tertiary sort by client-side ID timestamp as final tie-breaker
    const clientTimeA = extractTimestampFromClientSideId(a.clientSideId) || 0;
    const clientTimeB = extractTimestampFromClientSideId(b.clientSideId) || 0;
    
    return clientTimeA - clientTimeB;
  });
}

/**
 * Debounced function creator for read receipts
 */
export function createDebouncedReadReceipt(callback: (messageIds: string[]) => void, delay: number = 1000) {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingMessageIds: Set<string> = new Set();
  
  return (messageId: string) => {
    pendingMessageIds.add(messageId);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      const messageIds = Array.from(pendingMessageIds);
      pendingMessageIds.clear();
      callback(messageIds);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Message retry queue for handling failed sends
 */
export class MessageRetryQueue {
  private queue: Map<string, { message: any; retryCount: number; maxRetries: number }> = new Map();
  private retryCallback: (message: any) => Promise<boolean>;
  
  constructor(retryCallback: (message: any) => Promise<boolean>) {
    this.retryCallback = retryCallback;
  }
  
  add(message: any, maxRetries: number = 3) {
    if (!message.clientSideId) {
      console.error('Message must have clientSideId for retry queue');
      return;
    }
    
    this.queue.set(message.clientSideId, {
      message,
      retryCount: 0,
      maxRetries
    });
  }
  
  async retry(clientSideId: string): Promise<boolean> {
    const item = this.queue.get(clientSideId);
    if (!item) {
      return false;
    }
    
    item.retryCount++;
    
    try {
      const success = await this.retryCallback(item.message);
      if (success) {
        this.queue.delete(clientSideId);
        return true;
      }
    } catch (error) {
      console.error('Retry failed:', error);
    }
    
    if (item.retryCount >= item.maxRetries) {
      this.queue.delete(clientSideId);
      return false;
    }
    
    return false;
  }
  
  remove(clientSideId: string) {
    this.queue.delete(clientSideId);
  }
  
  getPendingMessages(): any[] {
    return Array.from(this.queue.values()).map(item => item.message);
  }
  
  clear() {
    this.queue.clear();
  }
}

/**
 * Image upload queue for handling image uploads with progress tracking
 */
export class ImageUploadQueue {
  private uploads: Map<string, {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    result?: any;
    error?: string;
    onProgress?: (progress: number) => void;
    onComplete?: (result: any) => void;
    onError?: (error: string) => void;
  }> = new Map();

  add(
    clientSideId: string,
    file: File,
    callbacks: {
      onProgress?: (progress: number) => void;
      onComplete?: (result: any) => void;
      onError?: (error: string) => void;
    } = {}
  ) {
    this.uploads.set(clientSideId, {
      file,
      progress: 0,
      status: 'pending',
      ...callbacks
    });
  }

  updateProgress(clientSideId: string, progress: number) {
    const upload = this.uploads.get(clientSideId);
    if (upload) {
      upload.progress = progress;
      upload.status = 'uploading';
      upload.onProgress?.(progress);
    }
  }

  complete(clientSideId: string, result: any) {
    const upload = this.uploads.get(clientSideId);
    if (upload) {
      upload.status = 'completed';
      upload.result = result;
      upload.onComplete?.(result);
    }
  }

  fail(clientSideId: string, error: string) {
    const upload = this.uploads.get(clientSideId);
    if (upload) {
      upload.status = 'failed';
      upload.error = error;
      upload.onError?.(error);
    }
  }

  get(clientSideId: string) {
    return this.uploads.get(clientSideId);
  }

  remove(clientSideId: string) {
    this.uploads.delete(clientSideId);
  }

  getAll() {
    return Array.from(this.uploads.entries()).map(([id, upload]) => ({
      clientSideId: id,
      ...upload
    }));
  }

  clear() {
    this.uploads.clear();
  }
}

/**
 * Creates a preview URL for a file
 */
export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gets image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}