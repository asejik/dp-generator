import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DPCanvas } from '../components/DPCanvas';
import { type CampaignConfig } from '../types';
import { Loader2, Download, Upload, Type, Share2, Info } from 'lucide-react';

export const CampaignView = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const stageRef = useRef<any>(null);

  // Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionType, setActionType] = useState<'download' | 'share' | null>(null);

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

  // Helper to get Blob from Canvas
  const getCanvasBlob = async (): Promise<Blob | null> => {
    if (!stageRef.current) return null;
    return new Promise((resolve) => {
      stageRef.current.toBlob((blob: Blob) => {
        resolve(blob);
      }, 'image/png', 1); // 1 = High Quality
    });
  };

  const handleDownload = async () => {
    if (!stageRef.current) return;
    setIsGenerating(true);
    setActionType('download');

    // Small delay to allow UI to show spinner before heavy canvas work
    setTimeout(async () => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `my-dp-${Date.now()}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsGenerating(false);
      setActionType(null);
    }, 100);
  };

  const handleShare = async () => {
    if (!stageRef.current) return;

    // Check if sharing is supported
    if (!navigator.share) {
      alert("Sharing is not supported on this browser. Please use Download.");
      return;
    }

    setIsGenerating(true);
    setActionType('share');

    try {
      const blob = await getCanvasBlob();
      if (blob) {
        const file = new File([blob], "my-dp.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          title: campaign?.title || 'My New DP',
          text: `Got my DP for ${campaign?.title}!`,
        });
      }
    } catch (error) {
      console.log("Share cancelled or failed", error);
    } finally {
      setIsGenerating(false);
      setActionType(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!campaign) return <div className="text-center mt-20">Campaign not found.</div>;

  const isDownloadDisabled = !userImage || (!!campaign.text && !userName) || isGenerating;
  const showShare = typeof navigator !== 'undefined' && !!navigator.share && /mobile/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{campaign.title}</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Create your personalized DP</p>

        {/* Canvas Area */}
        <div className="mb-2 flex justify-center">
          <DPCanvas
            ref={stageRef}
            config={campaign}
            userImageSrc={userImage || undefined}
            userName={userName}
          />
        </div>

        {/* Mobile Polish: Instruction Hint */}
        {userImage && (
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600 bg-blue-50 py-2 rounded mb-6">
                <Info size={14} />
                <span>Tip: Pinch to zoom or drag to adjust your photo</span>
            </div>
        )}

        <div className="space-y-4">

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

          <div className="flex gap-3">
             {/* Download Button */}
            <button
                onClick={handleDownload}
                disabled={isDownloadDisabled}
                className="flex-1 flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating && actionType === 'download' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <Download className="w-5 h-5 mr-2" />
                        Download
                    </>
                )}
            </button>

            {/* Share Button (Only shows on supported devices/browsers) */}
            {showShare && (
                <button
                    onClick={handleShare}
                    disabled={isDownloadDisabled}
                    className="flex-1 flex items-center justify-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating && actionType === 'share' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Share2 className="w-5 h-5 mr-2" />
                            Share
                        </>
                    )}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};