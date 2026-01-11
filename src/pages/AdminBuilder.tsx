// src/pages/AdminBuilder.tsx
import React, { useState } from 'react';
import { Upload } from 'lucide-react';

export const AdminBuilder = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a temporary URL to preview the uploaded image
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Builder</h1>
          <p className="text-gray-500">Upload a flyer to start a new DP campaign.</p>
        </header>

        {/* Upload Section */}
        {!selectedImage ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center bg-white hover:border-blue-500 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Flyer Design</h3>
            <p className="text-sm text-gray-500 mt-2">PNG or JPG (Recommended: 1080x1080px)</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <img src={selectedImage} alt="Preview" className="max-w-md rounded-lg border border-gray-200" />
            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 text-red-600 text-sm font-medium hover:underline"
            >
              Remove & Upload Different Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};