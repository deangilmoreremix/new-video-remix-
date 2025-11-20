
export enum ToolCategory {
  IMAGE_EDITING = 'Image Editing',
  GENERATION = 'Generation',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  ANALYSIS = 'Analysis',
  MARKETING = 'Marketing'
}

export interface ToolConfig {
  id: string;
  title: string;
  icon: string;
  category: ToolCategory;
  description: string;
  modelTarget: 'imagen' | 'flash-image-edit' | 'veo' | 'pro-analysis' | 'tts' | 'search-maps' | 'flash-lite' | 'recorder';
  defaultPrompt?: string;
  requiresImageInput?: boolean;
  requiresTextInput?: boolean;
  aspectRatioOption?: boolean;
  acceptedFileTypes?: string; // e.g., "image/*, video/*"
  presetOptions?: string[]; // For generic dropdowns
}

export interface GeneratedContent {
  type: 'image' | 'video' | 'text' | 'audio';
  url?: string; 
  text?: string;
  mimeType?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Asset {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'text' | 'audio';
  url: string; // Base64 or Text content
  thumbnail?: string;
  createdAt: number;
  toolId: string;
  toolName: string;
}

// --- Timeline Interfaces ---

export interface TimelineClip {
  id: string;
  assetId?: string; // Reference to original asset
  type: 'video' | 'image' | 'audio';
  url: string;
  startOffset: number; // Where it starts on the timeline (seconds)
  duration: number; // How long it plays (seconds)
  trackId: number;
  name: string;
}

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
