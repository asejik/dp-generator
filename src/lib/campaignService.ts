import { db, storage } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 1. Upload the Flyer Image to Storage
export const uploadCampaignImage = async (file: File): Promise<string> => {
  // Create a unique filename (e.g., "flyer_1739283_filename.png")
  const filename = `flyer_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `campaign_flyers/${filename}`);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// 2. Save the Campaign Data to Firestore
export const createCampaign = async (
  title: string,
  imageUrl: string,
  frameConfig: any
): Promise<string> => {

  // Create a clean "Campaign Object"
  const newCampaign = {
    title: title,
    baseImageUrl: imageUrl,
    frame: {
      x: frameConfig.x,
      y: frameConfig.y,
      width: frameConfig.width,
      height: frameConfig.height,
    },
    // Default text settings (we can make these editable later)
    text: {
      x: 0,
      y: frameConfig.y + frameConfig.height + 50, // Auto-place text below photo
      color: "#000000",
      fontSize: 60,
      fontFamily: "Arial",
      align: "center"
    },
    createdAt: serverTimestamp(),
    isActive: true
  };

  const docRef = await addDoc(collection(db, "dp_campaigns"), newCampaign);
  return docRef.id; // Return the new ID (e.g., "7d9f8g7df8g")
};