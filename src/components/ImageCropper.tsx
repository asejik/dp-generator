import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/canvasUtils';
import { Check, X, ZoomIn, Loader2 } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  aspect: number;
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

  // The Portal ensures this renders directly in the document body, avoiding all CSS traps
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 animate-in fade-in duration-200">

      {/* 1. Header */}
      <div className="flex-none p-4 flex justify-between items-center text-white bg-gray-900 z-50">
        <h3 className="font-bold text-lg">Adjust Photo</h3>
        <button onClick={onCancel} className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700">
          <X size={24} />
        </button>
      </div>

      {/* 2. Cropper Area */}
      <div className="relative flex-1 w-full bg-black overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={shape === 'circle' ? 'round' : 'rect'}
          showGrid={true}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={setZoom}
        />
      </div>

      {/* 3. Controls */}
      <div className="flex-none p-6 bg-gray-900 border-t border-gray-800 space-y-6 pb-10 z-50">
        <div className="flex items-center gap-4">
          <ZoomIn size={20} className="text-gray-400" />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 font-medium hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
             {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
             {loading ? "Apply Photo" : "Apply Photo"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};