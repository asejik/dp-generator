import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, Plus } from 'lucide-react';
import { type CampaignConfig } from '../types';

export const Home = () => {
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Fetch campaigns, sorted by newest first
        const q = query(collection(db, "dp_campaigns"), orderBy("createdAt", "desc"), limit(20));
        const querySnapshot = await getDocs(q);

        const list: CampaignConfig[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as CampaignConfig);
        });

        setCampaigns(list);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available DP Frames</h1>
            <p className="text-gray-500 mt-1">Select a campaign to create your DP.</p>
          </div>
          <Link
            to="/admin"
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            <Plus size={16} />
            New Campaign
          </Link>
        </div>

        {/* Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-400 mb-4">No active campaigns found.</p>
            <Link to="/admin" className="text-blue-600 font-medium hover:underline">Create the first one</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/c/${campaign.id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition hover:border-blue-300 block"
              >
                {/* Image Preview (Cropped) */}
                <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                  <img
                    src={campaign.baseImageUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{campaign.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">Tap to generate &rarr;</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};