import React, { useState } from 'react';
import { Upload, Save, Loader2 } from 'lucide-react';
import { AdminCanvas } from '../components/AdminCanvas';
import { uploadCampaignImage, createCampaign } from '../lib/campaignService';
import { useNavigate } from 'react-router-dom';

export const AdminBuilder = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // New State: Name Toggle
  const [includeName, setIncludeName] = useState(true);

  // We only store the "Result" config here that comes from the canvas
  const [finalConfig, setFinalConfig] = useState<{
    frame: { x: number; y: number; width: number; height: number; shape: 'rect' | 'circle' };
    text: { x: number; y: number } | null;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    if (!file || !title || !finalConfig) return alert("Please enter a title, upload an image, and configure the layout.");

    const password = prompt("Enter Admin Password to confirm save:");
    if (password !== "1234") return alert("Wrong password!");

    try {
      setIsUploading(true);

      const imageUrl = await uploadCampaignImage(file);

      // Pass the data exactly as the Service expects it
      // Note: The service will handle the null text check
      await createCampaign(title, imageUrl, finalConfig);

      alert("Campaign Created Successfully!");
      setIsUploading(false);

      navigate('/');

    } catch (error) {
      console.error(error);
      alert("Error saving campaign. Check console.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Builder</h1>
            <p className="text-gray-500">Upload a flyer, choose a shape, and position the text.</p>
          </div>

          {previewUrl && (
             <button
               onClick={handleSave}
               disabled={isUploading}
               className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-sm disabled:opacity-50"
             >
               {isUploading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
               {isUploading ? "Saving..." : "Save Campaign"}
             </button>
          )}
        </header>

        {previewUrl && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sunday Service Jan 12"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeName}
                  onChange={(e) => setIncludeName(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">Enable Name Input?</span>
              </label>
            </div>
          </div>
        )}

        {!previewUrl ? (
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
            <AdminCanvas
              imageSrc={previewUrl}
              includeName={includeName}
              onConfigChange={(newConfig) => setFinalConfig(newConfig)}
            />
          </div>
        )}
      </div>
    </div>
  );
};