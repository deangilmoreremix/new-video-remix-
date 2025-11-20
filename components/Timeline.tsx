
import React, { useRef, useEffect } from 'react';
import { TimelineClip, formatTime } from '../types';
import * as Icons from 'lucide-react';

interface TimelineProps {
  clips: TimelineClip[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onDeleteClip: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  clips,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onPlayPause,
  onDeleteClip
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const PIXELS_PER_SECOND = 40;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scrollLeft = timelineRef.current.scrollLeft;
    const clickedTime = (x + scrollLeft) / PIXELS_PER_SECOND;
    onSeek(Math.max(0, clickedTime));
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-t border-gray-800 select-none">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-800 flex items-center px-4 justify-between bg-gray-900">
        <div className="flex items-center gap-4">
           <button 
             onClick={onPlayPause}
             className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-600 hover:bg-brand-500 text-white transition-colors"
           >
             {isPlaying ? <Icons.Pause size={16} fill="currentColor" /> : <Icons.Play size={16} fill="currentColor" className="ml-0.5" />}
           </button>
           <span className="font-mono text-brand-400 text-sm font-bold w-20">
             {formatTime(currentTime)}
           </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-blue-500/20 border border-blue-500 rounded-sm"></div>
             <span>Video</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-purple-500/20 border border-purple-500 rounded-sm"></div>
             <span>Image</span>
           </div>
        </div>
      </div>

      {/* Timeline Area */}
      <div className="flex-grow relative overflow-hidden flex">
        {/* Track Headers */}
        <div className="w-24 flex-shrink-0 bg-gray-900 border-r border-gray-800 z-10 shadow-xl">
           <div className="h-8 border-b border-gray-800 bg-gray-950"></div> {/* Ruler spacer */}
           <div className="h-20 border-b border-gray-800 flex items-center justify-center text-xs text-gray-400 font-medium">Track 1</div>
           <div className="h-20 border-b border-gray-800 flex items-center justify-center text-xs text-gray-400 font-medium">Track 2</div>
        </div>

        {/* Scrollable Area */}
        <div 
            ref={timelineRef}
            className="flex-grow overflow-x-auto relative bg-[#050505]"
            onClick={handleTimelineClick}
        >
            {/* Ruler */}
            <div 
                className="h-8 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10"
                style={{ width: `${Math.max(duration * PIXELS_PER_SECOND, window.innerWidth)}px` }}
            >
                {Array.from({ length: Math.ceil(duration) + 5 }).map((_, i) => (
                    <div key={i} className="absolute top-0 h-full border-l border-gray-700" style={{ left: i * PIXELS_PER_SECOND }}>
                        <span className="text-[10px] text-gray-500 pl-1">{i}s</span>
                    </div>
                ))}
            </div>

            {/* Playhead */}
            <div 
                className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                style={{ left: currentTime * PIXELS_PER_SECOND }}
            >
                <div className="w-3 h-3 bg-red-500 -ml-1.5 rotate-45 transform -translate-y-1.5 rounded-sm"></div>
            </div>

            {/* Track 1 Content (Video) */}
            <div 
                className="h-20 border-b border-gray-800 relative"
                style={{ width: `${Math.max(duration * PIXELS_PER_SECOND, window.innerWidth)}px` }}
            >
                {clips.filter(c => c.trackId === 1).map(clip => (
                    <div
                        key={clip.id}
                        className="absolute top-2 bottom-2 rounded-md border border-blue-500/50 bg-blue-500/20 overflow-hidden group cursor-pointer hover:bg-blue-500/30"
                        style={{
                            left: clip.startOffset * PIXELS_PER_SECOND,
                            width: clip.duration * PIXELS_PER_SECOND
                        }}
                    >
                         <div className="px-2 py-1 text-xs truncate text-blue-200 font-medium flex justify-between items-center">
                             {clip.name}
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteClip(clip.id); }}
                                className="text-blue-300 hover:text-white opacity-0 group-hover:opacity-100"
                             >
                                 <Icons.X size={12} />
                             </button>
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/50"></div>
                    </div>
                ))}
            </div>

            {/* Track 2 Content (Overlay/Image) */}
            <div 
                className="h-20 border-b border-gray-800 relative"
                style={{ width: `${Math.max(duration * PIXELS_PER_SECOND, window.innerWidth)}px` }}
            >
                 {clips.filter(c => c.trackId === 2).map(clip => (
                    <div
                        key={clip.id}
                        className="absolute top-2 bottom-2 rounded-md border border-purple-500/50 bg-purple-500/20 overflow-hidden group cursor-pointer hover:bg-purple-500/30"
                        style={{
                            left: clip.startOffset * PIXELS_PER_SECOND,
                            width: clip.duration * PIXELS_PER_SECOND
                        }}
                    >
                         <div className="px-2 py-1 text-xs truncate text-purple-200 font-medium flex justify-between items-center">
                             {clip.name}
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteClip(clip.id); }}
                                className="text-purple-300 hover:text-white opacity-0 group-hover:opacity-100"
                             >
                                 <Icons.X size={12} />
                             </button>
                         </div>
                    </div>
                ))}
            </div>

        </div>
      </div>
    </div>
  );
};
