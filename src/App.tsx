import { DPCanvas } from "./components/DPCanvas";
import { type CampaignConfig } from "./types";

function App() {
  // MOCK DATA: This simulates what we will eventually fetch from Firebase
  const mockCampaign: CampaignConfig = {
    id: "test-campaign",
    title: "Test Event 2026",
    // This is a sample PNG I hosted that has a transparent hole in the middle
    baseImageUrl: "https://i.imgur.com/492Zq9a.png",
    frame: {
      x: 340,    // Adjusted for the sample image hole
      y: 340,
      width: 400,
      height: 400,
    },
    text: {
      x: 0, // Centered
      y: 850,
      color: "#FFFFFF",
      fontSize: 60,
      fontFamily: "Arial",
      align: "center",
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Canvas Engine Test</h1>

      {/* The Engine Component */}
      <DPCanvas
        config={mockCampaign}
        userImageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" // Random smiling guy
        userName="John Doe"
      />

      <p className="mt-4 text-gray-500 text-sm">
        If you see a face inside the circle, the engine works.
      </p>
    </div>
  );
}

export default App;