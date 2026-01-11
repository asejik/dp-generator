import { DPCanvas } from "./components/DPCanvas";
import { type CampaignConfig } from "./types";

function App() {
  // MOCK DATA: This simulates what we will eventually fetch from Firebase
  const mockCampaign: CampaignConfig = {
    id: "test-campaign",
    title: "Test Event 2026",
    // CHANGED: Using a reliable placeholder service (Gray background with text)
    baseImageUrl: "https://placehold.co/1080x1080/808080/FFFFFF.png?text=Church+Flyer+Frame&font=roboto",
    frame: {
      x: 340,
      y: 340,
      width: 400,
      height: 400,
    },
    text: {
      x: 0,
      y: 850,
      // CHANGED: Black color to ensure visibility
      color: "#000000",
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