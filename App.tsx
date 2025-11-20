
import React, { useState, useEffect, useRef } from 'react';
import { ToolCard } from './components/ToolCard';
import { Timeline } from './components/Timeline';
import { ToolConfig, ToolCategory, GeneratedContent, User, Asset, TimelineClip } from './types';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import { assetService } from './services/assetService';
import * as Icons from 'lucide-react';

// Updated Tool Definitions based on Pricing Logic
const TOOLS: ToolConfig[] = [
  // --- VideoRemix Suite ($197/YEAR Tier) ---
  {
    id: 'videoremix-editor',
    title: 'VideoRemix Editor',
    price: '$197/YEAR',
    priceValue: 197,
    icon: 'Clapperboard',
    category: ToolCategory.VIDEO,
    description: 'Unbranded video editor with AI-powered transitions and effects.',
    modelTarget: 'veo',
    defaultPrompt: 'Create a professional video montage with seamless transitions.',
    acceptedFileTypes: 'image/*',
    presetOptions: ['Cinematic Fade', 'Glitch Transition', 'Zoom Blur', 'Dissolve', 'Cyberpunk Glitch']
  },
  {
    id: 'neural-voice',
    title: 'Neural Voice Studio',
    price: '$197/YEAR',
    priceValue: 197,
    icon: 'Mic2',
    category: ToolCategory.AUDIO,
    description: '36 Neural Smart Speech Speakers in 6 Languages.',
    modelTarget: 'tts',
    requiresTextInput: true,
    defaultPrompt: 'Welcome to our service. We provide the best AI solutions.'
  },
  {
    id: 'smart-personalizer',
    title: 'Smart Personalizer',
    price: '$197/YEAR',
    priceValue: 197,
    icon: 'UserCheck',
    category: ToolCategory.MARKETING,
    description: 'Geo, Image, and Email personalization for your campaigns.',
    modelTarget: 'flash-image-edit',
    requiresImageInput: true,
    requiresTextInput: true,
    defaultPrompt: 'Personalize this image to welcome a user named "Alex" from "New York".',
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'lead-hunter',
    title: 'Lead Hunter & CRM',
    price: '$197/YEAR',
    priceValue: 197,
    icon: 'Target',
    category: ToolCategory.MARKETING,
    description: 'Find leads and organize them with Smart CRM technology.',
    modelTarget: 'search-maps',
    requiresTextInput: true,
    defaultPrompt: 'Find marketing agencies in Austin, Texas that need video services.'
  },
  {
    id: 'studio-recorder',
    title: 'Studio Recorder',
    price: '$197/YEAR',
    priceValue: 197,
    icon: 'Video',
    category: ToolCategory.VIDEO,
    description: 'Webcam, Screen, and Audio recorder for content creation.',
    modelTarget: 'recorder',
    isFree: false
  },
  {
    id: 'video-wrapper',
    title: 'Video Wrapper',
    price: '$197/YEAR',
    priceValue: 197,
    icon: 'BoxSelect',
    category: ToolCategory.VIDEO,
    description: 'Create engaging wrappers and frames for your social videos.',
    modelTarget: 'veo', 
    defaultPrompt: 'A video with a colorful, animated marketing border frame.',
    acceptedFileTypes: 'image/*',
    presetOptions: ['Neon Border', 'Social Media Frame', 'News Ticker', 'Golden Frame']
  },
  
  // --- Existing Tools ---
  {
    id: 'bg-remove',
    title: 'Image Background Remover',
    price: '$499/YEAR',
    priceValue: 499,
    icon: 'ImageMinus',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Instantly remove backgrounds from images with high precision.',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Remove the background from this image. Return only the foreground subject on a transparent background.',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'video-bg-remove',
    title: 'Video Background Remover',
    price: '$399/YEAR',
    priceValue: 399,
    icon: 'Video',
    category: ToolCategory.VIDEO,
    description: 'Animate a static image into a video with the background removed/changed.',
    modelTarget: 'veo',
    requiresImageInput: true,
    defaultPrompt: 'A high quality video of this subject moving naturally, isolated background',
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'face-cutout',
    title: 'Face Cutout Creator',
    price: '$699/YEAR',
    priceValue: 699,
    icon: 'SquareUser',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Isolate faces from group photos for avatars or IDs.',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Crop this image to just the face of the main subject, ensuring a clean cutout.',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'photo-enhance',
    title: 'Photo Enhancer',
    price: '$299/YEAR',
    priceValue: 299,
    icon: 'Wand2',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Sharpen and upscale blurry or low-res photos.',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Enhance the sharpness and clarity of this image. Upscale the details.',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'colorize',
    title: 'Photo Colorizer',
    price: '$399/YEAR',
    priceValue: 399,
    icon: 'Palette',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Bring black and white photos to life with AI colorization.',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Colorize this black and white photo realistically.',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'animer',
    title: 'Photo Animer',
    price: '$599/YEAR',
    priceValue: 599,
    icon: 'Film',
    category: ToolCategory.VIDEO,
    description: 'Turn still photos into captivating short videos.',
    modelTarget: 'veo',
    requiresImageInput: true,
    defaultPrompt: 'Cinematic movement, bring this image to life',
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'color-correct',
    title: 'Photo Color Correction',
    price: '$249/YEAR',
    priceValue: 249,
    icon: 'Sun',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Professional color grading and correction.',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Color correct this image for perfect white balance and exposure.',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'cartoon-selfie',
    title: 'Cartoon Selfie Maker',
    price: '$499/YEAR',
    priceValue: 499,
    icon: 'Smile',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Transform your selfies into various cartoon styles.',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Transform this person into a high quality 3D cartoon character.',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'passport',
    title: 'Passport Photo Maker',
    price: '$199/YEAR',
    priceValue: 199,
    icon: 'Contact',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Create compliant passport photos from regular selfies.',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Crop to a standard passport headshot size on a pure white background. Ensure professional lighting.',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'art-gen',
    title: 'AI Art Generation',
    price: '$999/YEAR',
    priceValue: 999,
    icon: 'Paintbrush',
    category: ToolCategory.GENERATION,
    description: 'Generate stunning artwork from text descriptions using Imagen 4.0.',
    modelTarget: 'imagen',
    requiresTextInput: true,
    aspectRatioOption: true
  },
  {
    id: 'bg-diffusion',
    title: 'Background Diffusion',
    price: '$399/YEAR',
    priceValue: 399,
    icon: 'Layers',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Generate creative, high-quality backgrounds for your products or portraits.',
    modelTarget: 'flash-image-edit',
    requiresImageInput: true,
    requiresTextInput: true,
    defaultPrompt: 'Change the background to a professional studio setting.',
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'reimagine',
    title: 'Reimagine',
    price: '$1,199/YEAR',
    priceValue: 1199,
    icon: 'Sparkles',
    category: ToolCategory.GENERATION,
    description: 'Completely reimagine an image or scene using Stable Diffusion techniques.',
    modelTarget: 'flash-image-edit',
    requiresImageInput: true,
    requiresTextInput: true,
    defaultPrompt: 'Reimagine this scene as a futuristic cyberpunk city.',
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'text-remove',
    title: 'Remove Text',
    price: '$399/YEAR',
    priceValue: 399,
    icon: 'Eraser',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Cleanly remove text overlays from images.',
    modelTarget: 'flash-image-edit',
    defaultPrompt: 'Remove all text from this image while preserving the background.',
    requiresImageInput: true,
    acceptedFileTypes: 'image/*'
  },
  {
    id: 'replace-bg',
    title: 'Replace Background',
    price: '$699/YEAR',
    priceValue: 699,
    icon: 'RefreshCw',
    category: ToolCategory.IMAGE_EDITING,
    description: 'Swap out backgrounds seamlessly with any scene you can describe.',
    modelTarget: 'flash-image-edit',
    requiresImageInput: true,
    requiresTextInput: true,
    defaultPrompt: 'Replace the background with a scenic mountain view.',
    acceptedFileTypes: 'image/*'
  },
  // Free Tools
  {
    id: 'analysis',
    title: 'Deep Analysis',
    price: 'INCLUDED',
    priceValue: 0,
    icon: 'BrainCircuit',
    category: ToolCategory.ANALYSIS,
    description: 'Analyze complex images or videos using Gemini 3 Pro.',
    modelTarget: 'pro-analysis',
    requiresImageInput: true, 
    requiresTextInput: true,
    isFree: true,
    acceptedFileTypes: 'image/*,video/*'
  },
  {
    id: 'fast-chat',
    title: 'Lightning Chat',
    price: 'INCLUDED',
    priceValue: 0,
    icon: 'Zap',
    category: ToolCategory.ANALYSIS,
    description: 'Instant answers and text generation using Flash Lite.',
    modelTarget: 'flash-lite',
    requiresTextInput: true,
    isFree: true
  },
  {
    id: 'knowledge',
    title: 'Knowledge Engine',
    price: 'INCLUDED',
    priceValue: 0,
    icon: 'Globe',
    category: ToolCategory.ANALYSIS,
    description: 'Search the web and maps for up-to-date information.',
    modelTarget: 'search-maps',
    requiresTextInput: true,
    isFree: true
  },
  {
    id: 'tts-engine',
    title: 'Voice Generator',
    price: 'INCLUDED',
    priceValue: 0,
    icon: 'Mic',
    category: ToolCategory.AUDIO,
    description: 'Convert text to lifelike speech.',
    modelTarget: 'tts',
    requiresTextInput: true,
    isFree: true
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'workspace' | 'assets'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [activeTool, setActiveTool] = useState<ToolConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [hasKey, setHasKey] = useState(false);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  
  // Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Timeline State
  const [isTimelineMode, setIsTimelineMode] = useState(false);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedToolForPurchase, setSelectedToolForPurchase] = useState<ToolConfig | null>(null);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    checkKey();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user && view === 'assets') {
        setUserAssets(assetService.getAssets(user.id));
    }
  }, [user, view]);

  const checkKey = async () => {
      const valid = await geminiService.checkApiKey();
      setHasKey(valid);
  };

  const handleKeySelect = async () => {
      try {
          await geminiService.openKeySelection();
          setTimeout(checkKey, 1000);
      } catch (e) {
          console.error("Failed to select key", e);
      }
  };

  const handleToolClick = (tool: ToolConfig) => {
    if (tool.isFree) {
        setActiveTool(tool);
        setView('workspace');
        return;
    }

    if (!user) {
        setShowAuthModal(true);
        return;
    }

    if (user.purchasedTools.includes(tool.id)) {
        setActiveTool(tool);
        setView('workspace');
    } else {
        setSelectedToolForPurchase(tool);
        setShowPaymentModal(true);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
        let loggedInUser;
        if (authMode === 'login') {
            loggedInUser = authService.login(email, password);
        } else {
            loggedInUser = authService.signup(email, password, name);
        }
        setUser(loggedInUser);
        setShowAuthModal(false);
        setEmail(''); setPassword(''); setName('');
    } catch (err: any) {
        setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('dashboard');
    setActiveTool(null);
  };

  const handlePurchase = () => {
    if (user && selectedToolForPurchase) {
        const updatedUser = authService.purchaseTool(user.id, selectedToolForPurchase.id);
        setUser(updatedUser);
        setShowPaymentModal(false);
        setActiveTool(selectedToolForPurchase);
        setView('workspace');
        setSelectedToolForPurchase(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Recorder Functions
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
            setResult({ type: 'video', url: url });
            // Stop stream tracks
            stream.getTracks().forEach(track => track.stop());
            if (user && activeTool) {
                assetService.saveAsset(user.id, { type: 'video', url }, activeTool.id, activeTool.title);
            }
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (e) {
        console.error("Error starting recorder", e);
        alert("Could not access camera/microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const handleGenerate = async () => {
    if (!activeTool) return;
    
    // Handle Recorder Logic Separately
    if (activeTool.modelTarget === 'recorder') {
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
      let finalPrompt = prompt || activeTool.defaultPrompt || '';
      if (selectedPreset) {
          finalPrompt += `, style: ${selectedPreset}`;
      }

      let generatedData: GeneratedContent | null = null;
      
      if (activeTool.modelTarget === 'flash-image-edit') {
        if (!selectedFile) throw new Error("Image required");
        const resultUrl = await geminiService.editImage(selectedFile, finalPrompt);
        generatedData = { type: 'image', url: resultUrl };
      }
      else if (activeTool.modelTarget === 'imagen') {
        const resultUrl = await geminiService.generateImage(finalPrompt, aspectRatio);
        generatedData = { type: 'image', url: resultUrl };
      }
      else if (activeTool.modelTarget === 'veo') {
        if (!await geminiService.checkApiKey()) {
            await geminiService.openKeySelection();
        }
        const resultUrl = await geminiService.generateVideo(
            finalPrompt, 
            selectedFile || undefined, 
            aspectRatio === '1:1' ? '16:9' : aspectRatio 
        );
        generatedData = { type: 'video', url: resultUrl };
      }
      else if (activeTool.modelTarget === 'pro-analysis') {
        const text = await geminiService.generateText(
            finalPrompt || "Analyze this.", 
            'gemini-3-pro-preview',
            selectedFile || undefined,
            [],
            true 
        );
        generatedData = { type: 'text', text: text };
      }
      else if (activeTool.modelTarget === 'search-maps') {
         const text = await geminiService.generateText(
            finalPrompt,
            'gemini-2.5-flash',
            undefined,
            [{ googleSearch: {} }, { googleMaps: {} }]
         );
         generatedData = { type: 'text', text: text };
      }
      else if (activeTool.modelTarget === 'tts') {
          const audioBuffer = await geminiService.generateSpeech(finalPrompt);
          const ctx = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 24000});
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.start(0);
          generatedData = { type: 'audio', text: 'Audio generated successfully.' };
      }
      else if (activeTool.modelTarget === 'flash-lite') {
           const text = await geminiService.generateText(finalPrompt, 'gemini-2.5-flash-lite');
           generatedData = { type: 'text', text };
      }

      if (generatedData) {
        setResult(generatedData);
        if (user) {
            assetService.saveAsset(user.id, generatedData, activeTool.id, activeTool.title);
        }
      }

    } catch (error: any) {
      console.error(error);
      setResult({ type: 'text', text: `Error: ${error.message || "Something went wrong"}` });
    } finally {
      setIsLoading(false);
    }
  };

  const resetWorkspace = () => {
      if (isRecording) stopRecording();
      setActiveTool(null);
      setPrompt('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setResult(null);
      setView('dashboard');
      setIsRecording(false);
      setIsTimelineMode(false);
      setTimelineClips([]);
      setIsPlaying(false);
      setCurrentTime(0);
  };

  // Timeline Logic
  const addToTimeline = (content: GeneratedContent) => {
      if (!content.url) return;
      
      const newClip: TimelineClip = {
          id: Math.random().toString(36).substr(2, 9),
          type: content.type as any,
          url: content.url,
          startOffset: timelineClips.length > 0 ? Math.max(...timelineClips.map(c => c.startOffset + c.duration)) : 0,
          duration: 5, // Default duration
          trackId: content.type === 'image' ? 2 : 1,
          name: `Clip ${timelineClips.length + 1}`
      };
      setTimelineClips([...timelineClips, newClip]);
  };

  const deleteTimelineClip = (id: string) => {
      setTimelineClips(timelineClips.filter(c => c.id !== id));
  };

  // Playback Engine
  const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const deltaTime = (time - startTimeRef.current) / 1000;
      
      // We manually update currentTime based on real time elapsed
      // In a real app, we'd sync to audio context or video element
      // For this demo, we just increment state
      
      // Note: React state update inside animation frame is tricky.
      // We use a functional update or ref for best performance, but for simplicity:
      setCurrentTime(prev => {
          const next = prev + 0.016; // approx 60fps
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
      }
  }, [isPlaying]);

  // Determine which clip is active
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
    <div className="min-h-screen flex flex-col font-sans text-white bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={resetWorkspace}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Icons.Cpu className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Lumina<span className="font-light text-brand-500">.ai</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
             <button 
                onClick={handleKeySelect}
                className={`text-xs font-medium px-3 py-1 rounded-full border ${hasKey ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-gray-700 text-gray-400 bg-gray-800'}`}
             >
                {hasKey ? "API Key Active" : "Connect Google AI"}
             </button>

            {user ? (
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('assets')} className={`text-sm font-medium ${view === 'assets' ? 'text-brand-500' : 'text-gray-300 hover:text-white'}`}>
                        My Assets
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                        <div className="text-right">
                            <p className="text-sm font-bold text-white">{user.name}</p>
                            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400">Logout</button>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-5 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                    Log In
                </button>
            )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
              <h2 className="text-4xl font-bold">Unleash your creativity.</h2>
              <p className="text-gray-400 text-lg">Professional AI tools for image, video, and marketing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {TOOLS.map((tool) => (
                <ToolCard 
                    key={tool.id} 
                    tool={tool} 
                    onClick={handleToolClick}
                    isLocked={!tool.isFree && (!user || !user.purchasedTools.includes(tool.id))}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'workspace' && activeTool && (
          <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
             <div className="flex justify-between items-center mb-4 shrink-0">
                <button 
                    onClick={resetWorkspace}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Icons.ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                {/* Workspace Mode Toggles for Video Editor */}
                {activeTool.id === 'videoremix-editor' && (
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button 
                            onClick={() => setIsTimelineMode(false)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isTimelineMode ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Generator
                        </button>
                        <button 
                            onClick={() => setIsTimelineMode(true)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isTimelineMode ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Timeline Editor
                        </button>
                    </div>
                )}
             </div>

             {/* Main Content Area */}
             <div className="flex-grow flex gap-6 min-h-0">
                
                {/* Left Panel or Top Panel depending on Mode */}
                {(!isTimelineMode) ? (
                    // Standard Generator Mode
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full h-full overflow-y-auto">
                         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-6 h-fit">
                            <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                                <div className="p-3 bg-gray-800 rounded-lg text-brand-500">
                                    {activeTool.icon && React.createElement((Icons as any)[activeTool.icon] || Icons.Sparkles, { size: 24 })}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{activeTool.title}</h2>
                                    <p className="text-sm text-gray-400">{activeTool.description}</p>
                                </div>
                            </div>

                            {/* Tool Input Content */}
                            <div className="space-y-6 flex-grow">
                                {/* ... Same Inputs as before ... */}
                                {activeTool.modelTarget === 'recorder' ? (
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
                                        {activeTool.requiresImageInput && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">
                                                    {activeTool.acceptedFileTypes?.includes('video') ? 'Source Media (Image or Video)' : 'Source Image'}
                                                </label>
                                                <div className="relative group">
                                                    <input 
                                                        type="file" 
                                                        accept={activeTool.acceptedFileTypes || "image/*"} 
                                                        onChange={handleFileChange}
                                                        className="hidden" 
                                                        id="file-upload"
                                                    />
                                                    <label 
                                                        htmlFor="file-upload" 
                                                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${previewUrl ? 'border-brand-500 bg-gray-800/50' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800'}`}
                                                    >
                                                        {previewUrl ? (
                                                            selectedFile?.type.startsWith('video/') ? (
                                                                <video src={previewUrl} className="h-full w-full object-contain rounded-lg p-2" controls />
                                                            ) : (
                                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                                                            )
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <Icons.CloudUpload className="w-8 h-8 mb-3 text-gray-400" />
                                                                <p className="text-sm text-gray-500">
                                                                    Click to upload {activeTool.acceptedFileTypes?.includes('video') ? 'image or video' : 'image'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {(activeTool.requiresTextInput || activeTool.defaultPrompt) && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">
                                                    {activeTool.requiresTextInput ? "Prompt" : "Custom Instructions (Optional)"}
                                                </label>
                                                <textarea 
                                                    value={prompt}
                                                    onChange={(e) => setPrompt(e.target.value)}
                                                    placeholder={activeTool.defaultPrompt || "Describe what you want to generate..."}
                                                    className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                                />
                                            </div>
                                        )}

                                        {/* Presets Dropdown */}
                                        {activeTool.presetOptions && (
                                             <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Smart Style Preset</label>
                                                <div className="relative">
                                                    <select 
                                                        value={selectedPreset}
                                                        onChange={(e) => setSelectedPreset(e.target.value)}
                                                        className="w-full appearance-none bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-brand-500"
                                                    >
                                                        <option value="">None (Use Prompt Only)</option>
                                                        {activeTool.presetOptions.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <Icons.ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                                </div>
                                             </div>
                                        )}

                                        {activeTool.aspectRatioOption && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Aspect Ratio</label>
                                                <div className="flex gap-2">
                                                    {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                                                        <button
                                                            key={ratio}
                                                            onClick={() => setAspectRatio(ratio)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${aspectRatio === ratio ? 'bg-brand-600 border-brand-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'}`}
                                                        >
                                                            {ratio}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={handleGenerate}
                                disabled={isLoading || (activeTool.requiresImageInput && !selectedFile && activeTool.modelTarget !== 'recorder')}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                                    isLoading ? 'bg-gray-700 cursor-not-allowed' : 
                                    activeTool.modelTarget === 'recorder' 
                                        ? (isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-500')
                                        : (!activeTool.requiresImageInput || selectedFile) ? 'bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Icons.Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : activeTool.modelTarget === 'recorder' ? (
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
                        </div>

                        {/* Results Area (Standard) */}
                        <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl flex flex-col relative overflow-hidden min-h-[400px]">
                            {/* ... Same result output logic ... */}
                            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between">
                                <span className="text-xs font-mono text-gray-400 uppercase">Output</span>
                                {result && result.url && (
                                    <div className="flex gap-2">
                                        {/* ADD TO TIMELINE BUTTON */}
                                        <button 
                                            onClick={() => { addToTimeline(result); setIsTimelineMode(true); }}
                                            className="px-3 py-1 bg-brand-600 rounded-lg hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1"
                                        >
                                            <Icons.Plus size={12} /> Add to Timeline
                                        </button>
                                        <a href={result.url} download={`lumina-${activeTool.id}.png`} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-white cursor-pointer z-20" title="Download">
                                            <Icons.Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow flex items-center justify-center p-4">
                                {isLoading ? (
                                    <div className="text-center space-y-4">
                                        <Icons.Cpu className="w-12 h-12 text-brand-500 animate-pulse mx-auto" />
                                        <p className="text-gray-400 animate-pulse">Creating magic...</p>
                                    </div>
                                ) : result ? (
                                    result.type === 'image' ? (
                                        <img src={result.url} alt="Generated" className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
                                    ) : result.type === 'video' ? (
                                        <video src={result.url} controls autoPlay loop className="max-h-full max-w-full rounded-lg shadow-2xl" />
                                    ) : result.type === 'text' ? (
                                        <div className="prose prose-invert max-w-none w-full h-full overflow-auto p-4">
                                            <div className="whitespace-pre-wrap text-gray-300">{result.text}</div>
                                        </div>
                                    ) : result.type === 'audio' ? (
                                        <div className="flex flex-col items-center justify-center space-y-4 text-brand-500">
                                            <Icons.Volume2 className="w-16 h-16 animate-pulse" />
                                            <p className="text-white">Playing Audio...</p>
                                        </div>
                                    ) : null
                                ) : (
                                    <div className="text-center text-gray-600">
                                        <Icons.LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Result will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // TIMELINE EDITOR MODE
                    <div className="flex flex-col w-full h-full gap-4">
                        {/* 1. Preview Player */}
                        <div className="flex-grow bg-black rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-800">
                            {/* Main Video Layer */}
                            {activeVideoClip ? (
                                <video 
                                    src={activeVideoClip.url} 
                                    className="h-full w-full object-contain"
                                    // In a real engine, we'd seek specifically. Here we assume clips just 'play' when active or use Media Fragment URI
                                    // Simulating seeking via key helps
                                    key={activeVideoClip.id}
                                    autoPlay={isPlaying}
                                    // Logic to sync video time to global time - simplified for React UI demo
                                />
                            ) : (
                                <div className="text-gray-700 font-mono">
                                    {timelineClips.length === 0 ? "Drag clips to timeline" : "Black Screen"}
                                </div>
                            )}
                            
                            {/* Overlay Layer (Images) */}
                            {activeOverlayClip && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <img src={activeOverlayClip.url} className="max-h-3/4 max-w-3/4 object-contain shadow-xl" />
                                </div>
                            )}
                        </div>

                        {/* 2. Timeline Component */}
                        <div className="h-64 shrink-0 rounded-xl overflow-hidden border border-gray-800">
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
                )}
             </div>
          </div>
        )}

        {view === 'assets' && (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">My Assets</h2>
                    <button onClick={resetWorkspace} className="text-gray-400 hover:text-white">Back to Tools</button>
                </div>
                
                {userAssets.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
                        <Icons.Image className="w-16 h-16 mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-500">No generated assets yet. Start creating!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {userAssets.map(asset => (
                            <div key={asset.id} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative">
                                <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
                                    {asset.type === 'image' ? (
                                        <img src={asset.url} alt="Asset" className="w-full h-full object-cover" />
                                    ) : asset.type === 'video' ? (
                                        <video src={asset.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icons.FileText className="w-12 h-12 text-gray-600" />
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-xs font-medium text-brand-400 mb-1">{asset.toolName}</p>
                                    <p className="text-xs text-gray-500">{new Date(asset.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    {asset.url && (
                                        <a href={asset.url} download className="p-2 bg-white text-black rounded-full hover:bg-gray-200">
                                            <Icons.Download className="w-5 h-5" />
                                        </a>
                                    )}
                                    {/* Add to Timeline from Assets */}
                                    {activeTool?.id === 'videoremix-editor' && (asset.type === 'video' || asset.type === 'image') && (
                                         <button 
                                            onClick={() => { 
                                                setView('workspace'); 
                                                setActiveTool(TOOLS.find(t => t.id === 'videoremix-editor') || null);
                                                setIsTimelineMode(true);
                                                addToTimeline({ type: asset.type as any, url: asset.url });
                                            }}
                                            className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-500"
                                            title="Edit in Timeline"
                                        >
                                            <Icons.Clapperboard className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => {
                                            assetService.deleteAsset(asset.id);
                                            if (user) setUserAssets(assetService.getAssets(user.id));
                                        }}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <Icons.Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">
                        {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h3>
                    <p className="text-gray-400">Access your professional creative suite.</p>
                </div>

                {authError && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'signup' && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>

                    <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-lg font-bold mt-2">
                        {authMode === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
                        className="text-sm text-gray-400 hover:text-white underline"
                    >
                        {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>
                <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <Icons.X size={20} />
                </button>
            </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedToolForPurchase && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-8 text-center bg-gradient-to-b from-gray-800 to-gray-900">
                    <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-500">
                        {React.createElement((Icons as any)[selectedToolForPurchase.icon] || Icons.Sparkles, { size: 32 })}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Unlock {selectedToolForPurchase.title}</h3>
                    <p className="text-gray-400 mb-6">{selectedToolForPurchase.description}</p>
                    <div className="text-5xl font-bold text-white mb-2">
                        ${selectedToolForPurchase.priceValue} <span className="text-lg text-gray-500 font-normal">/ year</span>
                    </div>
                </div>
                
                <div className="p-8 bg-gray-900 space-y-4">
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-gray-300">
                            <Icons.CircleCheck className="text-green-500 w-5 h-5" />
                            <span>Unlimited high-quality generations</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <Icons.CircleCheck className="text-green-500 w-5 h-5" />
                            <span>Commercial usage rights</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <Icons.CircleCheck className="text-green-500 w-5 h-5" />
                            <span>Priority processing speed</span>
                        </div>
                    </div>

                    <button onClick={handlePurchase} className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                        <Icons.CreditCard className="w-5 h-5" />
                        Pay & Unlock Now
                    </button>
                    <p className="text-xs text-center text-gray-600 mt-4">
                        Secure payment processing. This is a demo simulation.
                    </p>
                </div>
                 <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <Icons.X size={20} />
                </button>
            </div>
         </div>
      )}

    </div>
  );
};

export default App;
