import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DPCanvas } from '../components/DPCanvas';
import { type CampaignConfig } from '../types';
import { Loader2, Download, Upload, Type, Share2, Info, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const CampaignView = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const stageRef = useRef<any>(null);

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
        if (docSnap.exists()) setCampaign({ id: docSnap.id, ...docSnap.data() } as CampaignConfig);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchCampaign();
  }, [id]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUserImage(URL.createObjectURL(file));
  };

  const getCanvasBlob = async (): Promise<Blob | null> => {
    if (!stageRef.current) return null;
    return new Promise((resolve) => stageRef.current.toBlob((blob: Blob) => resolve(blob), 'image/png', 1));
  };

  const handleDownload = async () => {
    if (!stageRef.current) return;
    setIsGenerating(true); setActionType('download');
    setTimeout(async () => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `my-dp-${Date.now()}.png`;
      link.href = uri;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setIsGenerating(false); setActionType(null);
    }, 100);
  };

  const handleShare = async () => {
    if (!stageRef.current || !navigator.share) return;
    setIsGenerating(true); setActionType('share');
    try {
      const blob = await getCanvasBlob();
      if (blob) {
        await navigator.share({
          files: [new File([blob], "dp.png", { type: "image/png" })],
          title: campaign?.title, text: `My ${campaign?.title} DP`
        });
      }
    } catch (e) { console.log(e); }
    finally { setIsGenerating(false); setActionType(null); }
  };

  if (loading) return <div className="min-h-screen aurora-bg flex items-center justify-center"><Loader2 className="animate-spin text-gray-600" /></div>;
  if (!campaign) return <div className="min-h-screen aurora-bg flex items-center justify-center text-gray-500">Campaign not found.</div>;

  const isDownloadDisabled = !userImage || (!!campaign.text && !userName) || isGenerating;
  const showShare = typeof navigator !== 'undefined' && !!navigator.share && /mobile/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen aurora-bg py-8 px-4 flex flex-col items-center">

      {/* Navbar / Back */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mb-6 flex items-center justify-between"
      >
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition bg-white/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <ArrowLeft size={16} /> Back to Gallery
        </Link>
      </motion.div>

      {/* Main Glass Card */}
      <GlassCard className="w-full max-w-lg overflow-hidden relative">
        {/* Subtle decorative gradient glow behind content */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-400/20 blur-3xl -z-10" />

        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-gray-900">{campaign.title}</h1>
            <p className="text-gray-500 text-sm mt-1">Customize and download your design</p>
          </div>

          {/* Canvas Wrapper */}
          <div className="mb-8 flex justify-center perspective-1000">
            <motion.div
              initial={{ rotateX: 10, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="rounded-xl overflow-hidden shadow-2xl ring-4 ring-white/50"
            >
              <DPCanvas
                ref={stageRef}
                config={campaign}
                userImageSrc={userImage || undefined}
                userName={userName}
              />
            </motion.div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            {campaign.text && (
              <div className="group">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Your Name</label>
                <div className="relative overflow-hidden rounded-xl bg-gray-50/50 border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
                  <div className="absolute left-4 top-3.5 text-gray-400">
                    <Type size={18} />
                  </div>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Your Photo</label>
              <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 group-hover:scale-[1.01]">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {userImage ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <ImageIcon size={20} />
                      <span>Photo Selected</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                      <p className="text-sm text-gray-500">Click to upload selfie</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>

            {userImage && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex justify-center">
                 <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Info size={12} /> Pinch to zoom & drag
                 </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <GlowButton
                onClick={handleDownload}
                disabled={isDownloadDisabled}
                isLoading={isGenerating && actionType === 'download'}
                icon={<Download size={18} />}
                className="flex-1"
              >
                Download
              </GlowButton>

              {showShare && (
                <GlowButton
                  onClick={handleShare}
                  disabled={isDownloadDisabled}
                  variant="secondary"
                  isLoading={isGenerating && actionType === 'share'}
                  icon={<Share2 size={18} />}
                  className="flex-1"
                >
                  Share
                </GlowButton>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};