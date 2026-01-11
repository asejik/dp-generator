// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom';
import { AdminBuilder } from './pages/AdminBuilder';
import { DPCanvas } from './components/DPCanvas';
import { type CampaignConfig } from './types';
import { CampaignView } from './pages/CampaignView';

// ... (Keep your mockCampaign definition here) ...
const mockCampaign: CampaignConfig = {
    id: "test-campaign",
    title: "Test Event 2026",
    baseImageUrl: "https://placehold.co/1080x1080/808080/FFFFFF.png?text=Church+Flyer+Frame&font=roboto",
    frame: { x: 340, y: 340, width: 400, height: 400 },
    text: { x: 0, y: 850, color: "#000000", fontSize: 60, fontFamily: "Arial", align: "center" }
};

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">DP Generator Home</h1>
      <Link to="/admin" className="mb-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Go to Admin Builder
      </Link>

      {/* Engine Test */}
      <DPCanvas
        config={mockCampaign}
        userImageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        userName="John Doe"
      />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminBuilder />} />
      <Route path="/c/:id" element={<CampaignView />} />
    </Routes>
  );
}

export default App;