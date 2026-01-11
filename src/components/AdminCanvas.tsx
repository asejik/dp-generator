import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer, Circle, Group } from 'react-konva';
import useImage from 'use-image';

interface AdminCanvasProps {
  imageSrc: string;
  includeName: boolean;
  onConfigChange: (config: {
    frame: { x: number; y: number; width: number; height: number; shape: 'rect' | 'circle' };
    text: { x: number; y: number } | null
  }) => void;
}

export const AdminCanvas: React.FC<AdminCanvasProps> = ({ imageSrc, includeName, onConfigChange }) => {
  const [image] = useImage(imageSrc, 'anonymous');
  const transformerRef = useRef<any>(null);
  const frameRef = useRef<any>(null);
  const textRef = useRef<any>(null);

  // Selection State
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [frameProps, setFrameProps] = useState({
    x: 100, y: 100, width: 200, height: 200, shape: 'rect' as 'rect' | 'circle'
  });

  const [textProps, setTextProps] = useState({
    x: 100, y: 400
  });

  // 1. Update Parent whenever data changes
  useEffect(() => {
    onConfigChange({
      frame: frameProps,
      text: includeName ? textProps : null
    });
  }, [frameProps, textProps, includeName, onConfigChange]);

  // 2. CRITICAL FIX: Re-attach transformer whenever selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      // Find the node based on ID
      const node = selectedId === 'frame' ? frameRef.current : textRef.current;
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, includeName]);

  const handleDragEnd = (e: any, type: 'frame' | 'text') => {
    if (type === 'frame') {
      setFrameProps({ ...frameProps, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
    } else {
      setTextProps({ ...textProps, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
    }
  };

  const handleTransformEnd = () => {
    const node = frameRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 so the stroke width doesn't get distorted
    node.scaleX(1);
    node.scaleY(1);

    setFrameProps({
      ...frameProps,
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.round(node.width() * scaleX),
      height: Math.round(node.height() * scaleY),
    });
  };

  if (!image) return <div>Loading Canvas...</div>;

  const displayWidth = 500;
  const scaleFactor = displayWidth / image.width;
  const displayHeight = image.height * scaleFactor;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex gap-2 bg-gray-100 p-2 rounded border border-gray-300">
        <span className="text-sm font-bold self-center mr-2">Shape:</span>
        <button
          onClick={() => setFrameProps(p => ({ ...p, shape: 'rect' }))}
          className={`px-3 py-1 text-xs rounded ${frameProps.shape === 'rect' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
        >
          Square
        </button>
        <button
          onClick={() => setFrameProps(p => ({ ...p, shape: 'circle' }))}
          className={`px-3 py-1 text-xs rounded ${frameProps.shape === 'circle' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
        >
          Circle
        </button>
      </div>

      <div className="border border-gray-300 shadow-lg inline-block bg-gray-800">
        <Stage
          width={displayWidth}
          height={displayHeight}
          scaleX={scaleFactor}
          scaleY={scaleFactor}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) {
              setSelectedId(null);
              transformerRef.current?.nodes([]);
            }
          }}
        >
          <Layer>
            <KonvaImage image={image} opacity={0.8} listening={false} />

            {/* FRAME */}
            <Group
              ref={frameRef}
              {...frameProps}
              draggable
              onClick={() => setSelectedId('frame')}
              onTap={() => setSelectedId('frame')}
              onDragEnd={(e) => handleDragEnd(e, 'frame')}
              onTransformEnd={handleTransformEnd}
            >
               {frameProps.shape === 'rect' ? (
                 <Rect width={frameProps.width} height={frameProps.height} stroke="lime" strokeWidth={2} fill="rgba(0,255,0,0.3)" />
               ) : (
                 <Circle
                    radius={frameProps.width / 2}
                    offsetX={-frameProps.width / 2}
                    offsetY={-frameProps.height / 2}
                    stroke="lime" strokeWidth={2} fill="rgba(0,255,0,0.3)"
                 />
               )}
            </Group>

            {/* TEXT (Conditional) */}
            {includeName && (
              <Text
                ref={textRef}
                text="NAME HERE"
                x={textProps.x}
                y={textProps.y}
                fontSize={40}
                fontFamily="Arial"
                fill="blue"
                draggable
                onClick={() => setSelectedId('text')}
                onTap={() => setSelectedId('text')}
                onDragEnd={(e) => handleDragEnd(e, 'text')}
              />
            )}

            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};