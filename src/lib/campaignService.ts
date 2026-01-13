import { db, storage } from "./firebase";
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
  config: {
    frame: any,
    text: { x: number; y: number } | null
  }
): Promise<string> => {

  const newCampaign = {
    title: title,
    baseImageUrl: imageUrl,
    frame: config.frame,
    // If text is null, don't save a text config at all
    ...(config.text && {
      text: {
        x: config.text.x,
        y: config.text.y,
        color: "#000000",
        fontSize: 60,
        fontFamily: "Arial",
        align: "center"
      }
    }),
    createdAt: serverTimestamp(),
    isActive: true
  };

  const docRef = await addDoc(collection(db, "dp_campaigns"), newCampaign);
  return docRef.id;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "dp_campaigns", id));
};

export const updateCampaign = async (
  id: string,
  title: string,
  imageUrl: string | null, // If null, keep the old image
  config: {
    frame: any,
    text: { x: number; y: number } | null
  }
): Promise<void> => {

  const docRef = doc(db, "dp_campaigns", id);

  const updateData: any = {
    title: title,
    frame: config.frame,
    // Handle optional text update
    ...(config.text ? {
      text: {
        x: config.text.x,
        y: config.text.y,
        color: "#000000",
        fontSize: 60,
        fontFamily: "Arial",
        align: "center"
      }
    } : {
      text: null // Explicitly remove text if disabled
    }),
    updatedAt: serverTimestamp()
  };

  // Only update image URL if a new one was uploaded
  if (imageUrl) {
    updateData.baseImageUrl = imageUrl;
  }

  await updateDoc(docRef, updateData);
};