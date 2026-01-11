import React from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect } from 'react-konva';
import useImage from 'use-image';
import { type CampaignConfig } from '../types';

interface DPCanvasProps {
  config: CampaignConfig;
  userImageSrc?: string; // The user's uploaded selfie (optional for now)
  userName: string;      // The name they typed
}

const URLImage = ({ src, x, y, width, height, opacity = 1 }: any) => {
  const [img] = useImage(src, 'anonymous'); // 'anonymous' fixes CORS issues
  return (
    <KonvaImage
      image={img}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={opacity}
    />
  );
};

export const DPCanvas: React.FC<DPCanvasProps> = ({ config, userImageSrc, userName }) => {
  // Standard canvas size (square for social media)
  const CANVAS_SIZE = 1080;

  // Calculate scale to fit screen if needed (responsive)
  // For now, we hardcode a view scale, but we'll make this responsive later
  const scale = window.innerWidth < 500 ? 0.3 : 0.5;

  return (
    <div className="flex justify-center border border-gray-200 shadow-lg rounded-lg overflow-hidden bg-white">
      <Stage
        width={CANVAS_SIZE * scale}
        height={CANVAS_SIZE * scale}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
            {/* 0. SOLID BACKGROUND (Safety Layer) */}
            <Rect
                x={0}
                y={0}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                fill="#ffffff"
            />
          {/* 1. USER PHOTO (Bottom Layer) */}
          {userImageSrc && (
            <URLImage
              src={userImageSrc}
              x={config.frame.x}
              y={config.frame.y}
              width={config.frame.width}
              height={config.frame.height}
            />
          )}

          {/* 2. BASE FLYER (Middle Layer) */}
          {/* This sits ON TOP of the user photo, creating the "Frame" effect */}
          <URLImage
            src={config.baseImageUrl}
            x={0}
            y={0}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            opacity={0.5}
          />

          {/* 3. USER NAME (Top Layer) */}
          <Text
            text={userName}
            x={config.text.x}
            y={config.text.y}
            fontSize={config.text.fontSize}
            fontFamily={config.text.fontFamily}
            fill={config.text.color}
            align={config.text.align}
            width={CANVAS_SIZE} // Allow centering relative to full width
          />
        </Layer>
      </Stage>
    </div>
  );
};