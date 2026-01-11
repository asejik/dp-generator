import { forwardRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Group } from 'react-konva';
import useImage from 'use-image';
import { type CampaignConfig } from '../types';

interface DPCanvasProps {
  config: CampaignConfig;
  userImageSrc?: string;
  userName: string;
}

const URLImage = ({ src, x, y, width, height, opacity = 1 }: any) => {
  const [img] = useImage(src, 'anonymous');
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

export const DPCanvas = forwardRef<any, DPCanvasProps>(({ config, userImageSrc, userName }, ref) => {
  const CANVAS_SIZE = 1080;
  const scale = window.innerWidth < 500 ? 0.3 : 0.4;

  const UserPhotoLayer = () => {
    if (!userImageSrc) return null;
    const [img] = useImage(userImageSrc, 'anonymous');

    // Logic Fix: Since image is pre-cropped, we fit it exactly to frame dimensions
    return (
      <Group
        clipFunc={(ctx) => {
          if (config.frame.shape === 'circle') {
            ctx.arc(
              config.frame.x + config.frame.width / 2,
              config.frame.y + config.frame.height / 2,
              config.frame.width / 2,
              0,
              Math.PI * 2,
              false
            );
          } else {
            ctx.rect(config.frame.x, config.frame.y, config.frame.width, config.frame.height);
          }
        }}
      >
        <KonvaImage
          image={img}
          x={config.frame.x}
          y={config.frame.y}
          width={config.frame.width}
          height={config.frame.height}
          // The cropper ensures aspect ratio matches, so we can force dimensions here safely
        />
      </Group>
    );
  };

  return (
    <div className="flex justify-center border border-gray-200 shadow-lg rounded-lg overflow-hidden bg-white">
      <Stage
        ref={ref}
        width={CANVAS_SIZE * scale}
        height={CANVAS_SIZE * scale}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          <Rect x={0} y={0} width={CANVAS_SIZE} height={CANVAS_SIZE} fill="#ffffff" />
          <UserPhotoLayer />
          <URLImage
            src={config.baseImageUrl}
            x={0}
            y={0}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
          />
          {config.text && userName && (
            <Text
              text={userName}
              x={config.text.x}
              y={config.text.y}
              fontSize={config.text.fontSize}
              fontFamily={config.text.fontFamily}
              fill={config.text.color}
              align={config.text.align}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
});