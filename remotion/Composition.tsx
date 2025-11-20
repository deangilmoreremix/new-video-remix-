import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Video,
  Audio,
  interpolate,
} from 'remotion';

export interface ClipData {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  startOffset: number;
  duration: number;
  trackId: number;
  name: string;
}

interface MyCompositionProps {
  clips: ClipData[];
}

export const MyComposition: React.FC<MyCompositionProps> = ({ clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const videoClips = clips.filter(c => c.trackId === 1);
  const overlayClips = clips.filter(c => c.trackId === 2);
  const audioClips = clips.filter(c => c.type === 'audio');

  const activeVideoClip = videoClips.find(
    c => currentTime >= c.startOffset && currentTime < c.startOffset + c.duration
  );

  const activeOverlays = overlayClips.filter(
    c => currentTime >= c.startOffset && currentTime < c.startOffset + c.duration
  );

  const activeAudios = audioClips.filter(
    c => currentTime >= c.startOffset && currentTime < c.startOffset + c.duration
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {activeVideoClip && (
        <>
          {activeVideoClip.type === 'video' ? (
            <Video
              src={activeVideoClip.url}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              startFrom={(currentTime - activeVideoClip.startOffset) * fps}
            />
          ) : (
            <Img
              src={activeVideoClip.url}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </>
      )}

      {activeOverlays.map((overlay) => {
        const progress = (currentTime - overlay.startOffset) / overlay.duration;
        const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

        return (
          <AbsoluteFill
            key={overlay.id}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              opacity,
            }}
          >
            <Img
              src={overlay.url}
              style={{
                maxWidth: '80%',
                maxHeight: '80%',
                objectFit: 'contain',
              }}
            />
          </AbsoluteFill>
        );
      })}

      {activeAudios.map((audio) => (
        <Audio
          key={audio.id}
          src={audio.url}
          startFrom={(currentTime - audio.startOffset) * fps}
        />
      ))}
    </AbsoluteFill>
  );
};
