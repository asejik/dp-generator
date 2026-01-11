import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/canvasUtils';
import { GlowButton } from './ui/GlowButton';
import { Check, X, ZoomIn } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  aspect: number; // Width / Height
  shape: 'rect' | 'circle';
  onCropComplete: (croppedImgUrl: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc, aspect, shape, onCropComplete, onCancel
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onCropCompleteCallback = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">

      {/* 1. Header */}
      <div className="p-4 flex justify-between items-center text-white bg-black/40">
        <h3 className="font-display font-bold">Adjust Photo</h3>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full">
          <X size={24} />
        </button>
      </div>

      {/* 2. Cropper Area */}
      <div className="relative flex-1 bg-gray-900 overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={shape === 'circle' ? 'round' : 'rect'}
          showGrid={false}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={setZoom}
        />
      </div>

      {/* 3. Controls */}
      <div className="p-6 bg-gray-900 border-t border-gray-800 space-y-6">

        {/* Zoom Slider */}
        <div className="flex items-center gap-4">
          <ZoomIn size={20} className="text-gray-400" />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 font-medium hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <GlowButton
            onClick={handleSave}
            isLoading={loading}
            icon={<Check size={18} />}
            className="flex-1"
          >
            Apply Photo
          </GlowButton>
        </div>
      </div>
    </div>
  );
};