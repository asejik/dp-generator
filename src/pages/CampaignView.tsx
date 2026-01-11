import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DPCanvas } from '../components/DPCanvas';
import { type CampaignConfig } from '../types';
import { Loader2, Download, Upload, Type } from 'lucide-react';

export const CampaignView = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const stageRef = useRef<any>(null); // CHANGED: Reference to the canvas

  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "dp_campaigns", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(URL.createObjectURL(file));
    }
  };

  // CHANGED: The Download Function
  const handleDownload = () => {
    if (!stageRef.current) return;

    // 1. Get the URI from the canvas (High quality 3x pixel ratio)
    const uri = stageRef.current.toDataURL({ pixelRatio: 3 });

    // 2. Create a fake link and click it to trigger download
    const link = document.createElement('a');
    link.download = `my-dp-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!campaign) return <div className="text-center mt-20">Campaign not found.</div>;

  // CHANGED: Intelligent Disabled Logic
  // Button is disabled IF:
  // 1. No photo is uploaded OR
  // 2. The campaign requires text (campaign.text exists) AND the user hasn't typed a name.
  const isDownloadDisabled = !userImage || (!!campaign.text && !userName);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{campaign.title}</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Create your personalized DP</p>

        <div className="mb-6 flex justify-center">
          <DPCanvas
            ref={stageRef} // CHANGED: Attach the ref here
            config={campaign}
            userImageSrc={userImage || undefined}
            userName={userName}
          />
        </div>

        <div className="space-y-4">

          {/* CHANGED: Only show Name Input if campaign.text exists */}
          {campaign.text && (
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
          )}

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

          <button
            onClick={handleDownload}
            disabled={isDownloadDisabled}
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