
import { GoogleGenAI, Modality } from "@google/genai";

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix if present (e.g. "data:image/jpeg;base64,")
      const base64 = base64String.split(',')[1]; 
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- Audio Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Main Service Class ---

class GeminiService {
  private async getApiKey(): Promise<string> {
    const win = window as any;
    if (win.aistudio && win.aistudio.getSelectedApiKey) {
      const key = await win.aistudio.getSelectedApiKey();
      if (key) return key;
    }
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) return stored;
    return '';
  }

  private async getAiClient() {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('No API key configured. Please add your Google AI API key.');
    }
    return new GoogleGenAI({ apiKey });
  }

  async checkApiKey(): Promise<boolean> {
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
      return await win.aistudio.hasSelectedApiKey();
    }
    const stored = localStorage.getItem('gemini_api_key');
    return !!stored;
  }

  async openKeySelection() {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
    } else {
      const key = prompt('Enter your Google AI API key:\n\nGet one at: https://aistudio.google.com/apikey');
      if (key) {
        localStorage.setItem('gemini_api_key', key);
      }
    }
  }

  // 1. Image Generation (Imagen 4.0)
  async generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
    const ai = await this.getAiClient();
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  }

  // 2. Image Editing (Gemini 2.5 Flash Image - "Nano Banana")
  async editImage(imageBlob: Blob, prompt: string): Promise<string> {
    const ai = await this.getAiClient();
    const base64Data = await blobToBase64(imageBlob);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: imageBlob.type,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated in response");
  }

  // 3. Video Generation (Veo)
  async generateVideo(prompt: string, imageBlob?: Blob, aspectRatio: string = '16:9'): Promise<string> {
    const ai = await this.getAiClient();
    let operation;

    const config = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    };

    if (imageBlob) {
        const base64Data = await blobToBase64(imageBlob);
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt || "Animate this image cinematically", 
            image: {
                imageBytes: base64Data,
                mimeType: imageBlob.type,
            },
            config: config
        });
    } else {
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: config
        });
    }

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s poll
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");

    // Fetch the actual video bytes
    const apiKey = await this.getApiKey();
    const res = await fetch(`${downloadLink}&key=${apiKey}`);
    const videoBlob = await res.blob();
    return URL.createObjectURL(videoBlob);
  }

  // 4. Text/Analysis/Grounding (Gemini 2.5 Flash & Pro)
  async generateText(
    prompt: string,
    model: 'gemini-3-pro-preview' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite',
    mediaBlob?: Blob, // Can be image or video
    tools: any[] = [],
    thinking: boolean = false
  ): Promise<string> {
    const ai = await this.getAiClient();
    const parts: any[] = [];

    if (mediaBlob) {
      const base64Data = await blobToBase64(mediaBlob);
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mediaBlob.type,
        }
      });
    }
    parts.push({ text: prompt });

    const config: any = {};
    
    if (tools.length > 0) {
        config.tools = tools;
        // Grounding configs
        if(tools.some(t => t.googleMaps)) {
           // Ideally get real location, strictly using defaults for demo stability if permission denied
           config.toolConfig = {
               retrievalConfig: {
                   latLng: { latitude: 37.7749, longitude: -122.4194 } // SF default
               }
           };
        }
    }

    if (thinking && model === 'gemini-3-pro-preview') {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config
    });

    // Handle grounding specifically to append links if present
    let text = response.text || "No text response generated.";
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        text += "\n\n**Sources:**\n";
        groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                text += `- [${chunk.web.title}](${chunk.web.uri})\n`;
            }
            if (chunk.maps?.uri) {
                 text += `- [${chunk.maps.title}](${chunk.maps.uri})\n`;
            }
        });
    }

    return text;
  }

  // 5. Text to Speech
  async generateSpeech(text: string): Promise<AudioBuffer> {
      const ai = await this.getAiClient();
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text }] }],
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
              },
          },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio generated");

      const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 24000});
      return await decodeAudioData(
          decode(base64Audio),
          outputAudioContext,
          24000,
          1,
      );
  }
}

export const geminiService = new GeminiService();
