import React, { useState } from 'react';
import { Upload, Save, Loader2 } from 'lucide-react';
import { AdminCanvas } from '../components/AdminCanvas';
import { uploadCampaignImage, createCampaign } from '../lib/campaignService';
import { useNavigate } from 'react-router-dom';

export const AdminBuilder = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [frameConfig, setFrameConfig] = useState({ x: 100, y: 100, width: 200, height: 200 });

  // Form State
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
    if (!file || !title) return alert("Please enter a title and upload an image.");

    // Simple Password Check
    const password = prompt("Enter Admin Password to confirm save:");
    if (password !== "1234") return alert("Wrong password!");

    try {
      setIsUploading(true);

      // 1. Upload Image
      const imageUrl = await uploadCampaignImage(file);

      // 2. Save Data
      const campaignId = await createCampaign(title, imageUrl, frameConfig);

      alert("Campaign Created! ID: " + campaignId);

      // 3. Reset or Redirect (For now, let's just log it)
      console.log("Success:", campaignId);
      setIsUploading(false);

      // Optional: Redirect to home to see it (we'll build the list view next)
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
            <p className="text-gray-500">Upload a flyer and drag the box to define the photo area.</p>
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

        {/* Title Input */}
        {previewUrl && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sunday Service Jan 12"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Upload & Editor */}
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
              onConfigChange={(newConfig) => setFrameConfig(newConfig)}
            />
          </div>
        )}
      </div>
    </div>
  );
};