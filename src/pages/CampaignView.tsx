import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DPCanvas } from '../components/DPCanvas';
import { type CampaignConfig } from '../types';
import { Loader2, Download, Upload, Type } from 'lucide-react';

export const CampaignView = () => {
  const { id } = useParams(); // Get ID from URL
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);

  // User Inputs
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);

  // 1. Fetch Campaign Data on Load
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "dp_campaigns", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Combine ID with data
          setCampaign({ id: docSnap.id, ...docSnap.data() } as CampaignConfig);
        } else {
          alert("Campaign not found!");
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  // 2. Handle User Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(URL.createObjectURL(file));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!campaign) return <div className="text-center mt-20">Campaign not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{campaign.title}</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Create your personalized DP</p>

        {/* THE ENGINE */}
        <div className="mb-6 flex justify-center">
          <DPCanvas
            config={campaign}
            userImageSrc={userImage || undefined}
            userName={userName}
          />
        </div>

        {/* INPUTS */}
        <div className="space-y-4">

          {/* A. Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <div className="relative">
              <Type className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* B. Photo Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Photo</label>
            <label className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 bg-gray-50 transition-colors">
              <Upload className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {userImage ? "Change Photo" : "Upload Selfie"}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>

          {/* C. Download Button (Placeholder functionality for now) */}
          <button
            disabled={!userImage || !userName}
            className="w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 mr-2" />
            Download DP
          </button>
        </div>
      </div>
    </div>
  );
};