import React, { useState } from 'react';
import { Upload, Save } from 'lucide-react';
import { AdminCanvas } from '../components/AdminCanvas';

export const AdminBuilder = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // This state holds the "Face Zone" coordinates
  const [frameConfig, setFrameConfig] = useState({ x: 100, y: 100, width: 200, height: 200 });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
    }
  };

  const handleSave = () => {
    alert(`Ready to Save!\nCoords: ${JSON.stringify(frameConfig)}`);
    // Next Step: We will connect this to Firebase
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Builder</h1>
            <p className="text-gray-500">Upload a flyer and drag the box to define the photo area.</p>
          </div>
          {selectedImage && (
             <button
               onClick={handleSave}
               className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-sm"
             >
               <Save size={20} />
               Save Campaign
             </button>
          )}
        </header>

        {/* Upload Section */}
        {!selectedImage ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center bg-white hover:border-blue-500 transition-colors cursor-pointer relative h-64">
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
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* The New Editor Canvas */}
            <AdminCanvas
              imageSrc={selectedImage}
              onConfigChange={(newConfig) => setFrameConfig(newConfig)}
            />

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full max-w-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Debug Coordinates:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs font-mono">
                {JSON.stringify(frameConfig, null, 2)}
              </pre>
              <button
                onClick={() => setSelectedImage(null)}
                className="mt-4 text-red-600 text-sm hover:underline"
              >
                Reset / Upload New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};