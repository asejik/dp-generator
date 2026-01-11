import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, Plus, Sparkles, ArrowRight } from 'lucide-react'; // Removed Trash2
import { type CampaignConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const Home = () => {
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const q = query(collection(db, "dp_campaigns"), orderBy("createdAt", "desc"), limit(20));
      const querySnapshot = await getDocs(q);
      const list: CampaignConfig[] = [];
      querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as CampaignConfig));
      setCampaigns(list);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  // Removed handleDelete function entirely

  if (loading) return <div className="min-h-screen aurora-bg flex items-center justify-center"><Loader2 className="animate-spin text-gray-600" /></div>;

  return (
    <div className="min-h-screen aurora-bg text-gray-900 pb-20">

      {/* 1. Hero Section */}
      <div className="relative pt-20 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 backdrop-blur-md text-xs font-semibold text-blue-600 mb-6 shadow-sm">
            <Sparkles size={12} />
            <span>Official DP Generator</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-gray-900 mb-6">
            Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Moment.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Select a campaign below to generate your personalized design instantly. High quality, ready for social sharing.
          </p>

          <Link to="/admin">
            <GlowButton variant="secondary" icon={<Plus size={16} />}>
              Admin Dashboard
            </GlowButton>
          </Link>
        </motion.div>
      </div>

      {/* 2. Grid */}
      <div className="max-w-6xl mx-auto px-6">
        {campaigns.length === 0 ? (
           <GlassCard className="p-12 text-center">
              <p className="text-gray-400">No active campaigns.</p>
           </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Link to={`/c/${campaign.id}`} className="block group relative">
                    <GlassCard className="overflow-hidden h-full border-0 ring-1 ring-gray-900/5 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-900/20">

                      {/* Image */}
                      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                        <img
                          src={campaign.baseImageUrl}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                          <h3 className="text-xl font-display font-bold leading-tight mb-1">{campaign.title}</h3>
                          <div className="flex items-center gap-2 text-sm font-medium text-white/80 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Generate yours <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};