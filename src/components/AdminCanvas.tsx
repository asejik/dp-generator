import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';

interface AdminCanvasProps {
  imageSrc: string;
  onConfigChange: (rect: { x: number; y: number; width: number; height: number }) => void;
}

export const AdminCanvas: React.FC<AdminCanvasProps> = ({ imageSrc, onConfigChange }) => {
  const [image] = useImage(imageSrc);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const shapeRef = useRef<any>(null);

  // Initial size of the "Face Zone" box
  const [rectProps, setRectProps] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
  });

  // Attach the "Transformer" (Resize handles) to the Red Box automatically
  useEffect(() => {
    if (transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [image]);

  // When the box is moved/resized, update the parent component
  const handleTransformEnd = () => {
    if (shapeRef.current) {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale to 1 and adjust width/height instead (cleaner math)
      node.scaleX(1);
      node.scaleY(1);

      const newProps = {
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(node.width() * scaleX),
        height: Math.round(node.height() * scaleY),
      };

      setRectProps(newProps);
      onConfigChange(newProps);
    };
  };

  const handleDragEnd = (e: any) => {
    const newProps = {
      ...rectProps,
      x: Math.round(e.target.x()),
      y: Math.round(e.target.y()),
    };
    setRectProps(newProps);
    onConfigChange(newProps);
  };

  if (!image) return <div>Loading Image...</div>;

  // Calculate scale to fit the image on the admin's laptop screen
  // (We assume the real image is 1080px, but we show it smaller)
  const displayWidth = 500;
  const scaleFactor = displayWidth / image.width;
  const displayHeight = image.height * scaleFactor;

  return (
    <div className="border border-gray-300 shadow-lg inline-block bg-gray-800">
      <Stage width={displayWidth} height={displayHeight} scaleX={scaleFactor} scaleY={scaleFactor} ref={stageRef}>
        <Layer>
          {/* 1. The Church Flyer */}
          <KonvaImage image={image} />

          {/* 2. The "Face Zone" (Draggable Box) */}
          <Rect
            ref={shapeRef}
            {...rectProps}
            fill="rgba(0, 255, 0, 0.3)" // Semi-transparent Green
            stroke="red"
            strokeWidth={2}
            draggable
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />

          {/* 3. The Resize Handles */}
          <Transformer
            ref={transformerRef}
            rotateEnabled={false} // Keep it simple: No rotation for MVP
            boundBoxFunc={(oldBox, newBox) => {
              // Prevent resizing to less than 5px
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};