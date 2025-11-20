import React, { useState, useRef, useEffect } from 'react';
import { Timeline } from './Timeline';
import { ToolConfig, ToolCategory, GeneratedContent, TimelineClip, User } from '../types';
import { geminiService } from '../services/geminiService';
import { assetService } from '../services/assetService';
import * as Icons from 'lucide-react';

interface VideoEditorProps {
  user: User | null;
  isDemoMode: boolean;
}

const AI_FEATURES: ToolConfig[] = [
  {
    id: 'generate-video',
    title: 'Generate Video',
    icon: 'Video',
    category: ToolCategory.VIDEO,
    description: 'Create AI-generated videos from images or text prompts',
    modelTarget: 'veo',
    requiresTextInput: true,
    aspectRatioOption: true,
    acceptedFileTypes: 'image/*',
    defaultPrompt: 'Cinematic movement, bring this to life'
  },
  {
    id: 'generate-image',
    title: 'Generate Image',
    icon: 'Image',
    category: ToolCategory.GENERATION,
    description: 'Create stunning AI artwork from text descriptions',
    modelTarget: 'imagen',
    requiresTextInput: true,
    aspectRatioOption: true
  },
  {
    id: 'bg-remove',
    title: 'Remove Background',
    icon: 'ImageMinus',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Remove backgrounds from images',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Remove the background, transparent result',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'replace-bg',
    title: 'Replace Background',
    icon: 'RefreshCw',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Swap backgrounds with AI',
    modelTarget: 'flash-image-edit',
    requiresImageInput: true,
    requiresTextInput: true,
    defaultPrompt: 'Replace the background with a scenic mountain view',
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'enhance',
    title: 'Enhance Photo',
    icon: 'Wand2',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Upscale and enhance image quality',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Enhance sharpness and clarity, upscale details',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'colorize',
    title: 'Colorize',
    icon: 'Palette',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Add color to black & white photos',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Colorize this black and white photo realistically',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'cartoon',
    title: 'Cartoonify',
    icon: 'Smile',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Transform into cartoon style',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Transform into high quality 3D cartoon character',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'text-to-speech',
    title: 'Text to Speech',
    icon: 'Mic2',
    category: ToolCategory.AUDIO,
    description: 'Generate voiceovers with AI',
    modelTarget: 'tts',
    requiresTextInput: true,
    defaultPrompt: 'Welcome to our service. We provide the best AI solutions.'
  },
  {
    id: 'record',
    title: 'Record Webcam',
    icon: 'Video',
    category: ToolCategory.VIDEO,
    description: 'Record from your camera',
    modelTarget: 'recorder'
  }
];

export const VideoEditor: React.FC<VideoEditorProps> = ({ user, isDemoMode }) => {
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<ToolConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Playback
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setResult({ type: 'video', url });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Error accessing camera', e);
      alert('Could not access camera/microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFeature) return;

    if (selectedFeature.modelTarget === 'recorder') {
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording();
      }
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let finalPrompt = prompt || selectedFeature.defaultPrompt || '';
      let generatedData: GeneratedContent | null = null;

      if (selectedFeature.modelTarget === 'flash-image-edit') {
        if (!selectedFile) throw new Error('Image required');
        const resultUrl = await geminiService.editImage(selectedFile, finalPrompt);
        generatedData = { type: 'image', url: resultUrl };
      } else if (selectedFeature.modelTarget === 'imagen') {
        const resultUrl = await geminiService.generateImage(finalPrompt, aspectRatio);
        generatedData = { type: 'image', url: resultUrl };
      } else if (selectedFeature.modelTarget === 'veo') {
        const resultUrl = await geminiService.generateVideo(
          finalPrompt,
          selectedFile || undefined,
          aspectRatio
        );
        generatedData = { type: 'video', url: resultUrl };
      } else if (selectedFeature.modelTarget === 'tts') {
        const audioBuffer = await geminiService.generateSpeech(finalPrompt);
        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(0);
        generatedData = { type: 'audio', text: 'Audio generated successfully' };
      }

      if (generatedData) {
        setResult(generatedData);
      }
    } catch (error: any) {
      console.error(error);
      setResult({ type: 'text', text: `Error: ${error.message || 'Something went wrong'}` });
    } finally {
      setIsLoading(false);
    }
  };

  const addToTimeline = (content: GeneratedContent) => {
    if (!content.url) return;

    const newClip: TimelineClip = {
      id: Math.random().toString(36).substr(2, 9),
      type: content.type as any,
      url: content.url,
      startOffset: timelineClips.length > 0 ? Math.max(...timelineClips.map(c => c.startOffset + c.duration)) : 0,
      duration: 5,
      trackId: content.type === 'image' ? 2 : 1,
      name: `${selectedFeature?.title || 'Clip'} ${timelineClips.length + 1}`
    };
    setTimelineClips([...timelineClips, newClip]);
  };

  const deleteTimelineClip = (id: string) => {
    setTimelineClips(timelineClips.filter(c => c.id !== id));
  };

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;

    setCurrentTime(prev => {
      const next = prev + 0.016;
      const maxDuration = timelineClips.length > 0 ? Math.max(...timelineClips.map(c => c.startOffset + c.duration)) : 10;
      if (next >= maxDuration) {
        setIsPlaying(false);
        return 0;
      }
      return next;
    });

    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const activeVideoClip = timelineClips.find(c =>
    c.trackId === 1 &&
    currentTime >= c.startOffset &&
    currentTime < c.startOffset + c.duration
  );

  const activeOverlayClip = timelineClips.find(c =>
    c.trackId === 2 &&
    currentTime >= c.startOffset &&
    currentTime < c.startOffset + c.duration
  );

  return (
    <div className="flex h-full gap-4">
      {/* Left Sidebar - AI Tools */}
      <div className="w-72 bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Icons.Sparkles className="w-5 h-5 text-brand-500" />
          AI Tools
        </h3>
        <div className="space-y-2">
          {AI_FEATURES.map((feature) => {
            const IconComponent = (Icons as any)[feature.icon] || Icons.Sparkles;
            return (
              <button
                key={feature.id}
                onClick={() => {
                  setSelectedFeature(feature);
                  setPrompt('');
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setResult(null);
                }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedFeature?.id === feature.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-750 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{feature.title}</p>
                    <p className="text-xs opacity-70 truncate">{feature.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Top Section - Preview & Controls */}
        <div className="flex gap-4 h-2/3">
          {/* Video Preview */}
          <div className="flex-1 bg-black rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-800">
            {activeVideoClip ? (
              <video
                src={activeVideoClip.url}
                className="h-full w-full object-contain"
                key={activeVideoClip.id}
                autoPlay={isPlaying}
              />
            ) : (
              <div className="text-gray-700 font-mono text-center">
                <Icons.Film className="w-16 h-16 mx-auto mb-2 opacity-20" />
                <p>{timelineClips.length === 0 ? 'Add clips to timeline' : 'Preview'}</p>
              </div>
            )}

            {activeOverlayClip && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img src={activeOverlayClip.url} className="max-h-3/4 max-w-3/4 object-contain shadow-xl" alt="Overlay" />
              </div>
            )}
          </div>

          {/* Right Panel - Tool Controls */}
          <div className="w-96 bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-y-auto">
            {selectedFeature ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                  {React.createElement((Icons as any)[selectedFeature.icon], { className: 'w-6 h-6 text-brand-500' })}
                  <div>
                    <h3 className="font-bold">{selectedFeature.title}</h3>
                    <p className="text-xs text-gray-400">{selectedFeature.description}</p>
                  </div>
                </div>

                {selectedFeature.modelTarget === 'recorder' ? (
                  <div className="bg-black rounded-xl overflow-hidden border border-gray-700 aspect-video flex items-center justify-center relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className={`w-full h-full object-cover ${!isRecording && !videoRef.current?.srcObject ? 'hidden' : ''}`}
                    />
                    {!isRecording && !videoRef.current?.srcObject && (
                      <div className="text-center">
                        <Icons.Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500">Camera Preview</p>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-500 text-xs font-bold">REC</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {selectedFeature.requiresImageInput && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Source Image</label>
                        <div className="relative group">
                          <input
                            type="file"
                            accept={selectedFeature.acceptedFileTypes || 'image/*'}
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                              previewUrl ? 'border-brand-500 bg-gray-800/50' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                            }`}
                          >
                            {previewUrl ? (
                              <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Icons.CloudUpload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="text-sm text-gray-500">Click to upload image</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    )}

                    {(selectedFeature.requiresTextInput || selectedFeature.defaultPrompt) && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          {selectedFeature.requiresTextInput ? 'Prompt' : 'Custom Instructions (Optional)'}
                        </label>
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={selectedFeature.defaultPrompt || 'Describe what you want...'}
                          className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        />
                      </div>
                    )}

                    {selectedFeature.aspectRatioOption && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Aspect Ratio</label>
                        <div className="flex gap-2 flex-wrap">
                          {['1:1', '16:9', '9:16', '4:3'].map(ratio => (
                            <button
                              key={ratio}
                              onClick={() => setAspectRatio(ratio)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                aspectRatio === ratio ? 'bg-brand-600 border-brand-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'
                              }`}
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || (selectedFeature.requiresImageInput && !selectedFile && selectedFeature.modelTarget !== 'recorder')}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isLoading
                      ? 'bg-gray-700 cursor-not-allowed'
                      : selectedFeature.modelTarget === 'recorder'
                      ? isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-brand-600 hover:bg-brand-500'
                      : 'bg-brand-600 hover:bg-brand-500'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Icons.Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : selectedFeature.modelTarget === 'recorder' ? (
                    isRecording ? (
                      <>
                        <Icons.Square className="w-5 h-5 fill-current" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Icons.Circle className="w-5 h-5 fill-current" />
                        Start Recording
                      </>
                    )
                  ) : (
                    <>
                      <Icons.Sparkles className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>

                {result && result.url && (
                  <button
                    onClick={() => {
                      addToTimeline(result);
                      setResult(null);
                    }}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <Icons.Plus className="w-5 h-5" />
                    Add to Timeline
                  </button>
                )}

                {result && result.type === 'text' && (
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-300">{result.text}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                <div>
                  <Icons.Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Select an AI tool to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Timeline */}
        <div className="h-1/3 rounded-xl overflow-hidden border border-gray-800">
          <Timeline
            clips={timelineClips}
            currentTime={currentTime}
            duration={Math.max(30, ...timelineClips.map(c => c.startOffset + c.duration))}
            isPlaying={isPlaying}
            onSeek={(t) => setCurrentTime(t)}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onDeleteClip={deleteTimelineClip}
          />
        </div>
      </div>
    </div>
  );
};
