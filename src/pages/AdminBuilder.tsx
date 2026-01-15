import React, { useState } from 'react';
import { Upload, Save, Loader2, Copy, Check, ArrowLeft, Edit2, Trash2, Plus, LogIn } from 'lucide-react';
import { AdminCanvas } from '../components/AdminCanvas';
import { uploadCampaignImage, createCampaign, updateCampaign, deleteCampaign } from '../lib/campaignService';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type CampaignConfig } from '../types';
import { GlowButton } from '../components/ui/GlowButton';
import { GlassCard } from '../components/ui/GlassCard';

export const AdminBuilder = () => {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // --- DASHBOARD STATE ---
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // --- EDITOR STATE ---
  const [editingId, setEditingId] = useState<string | null>(null); // If set, we are editing
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [includeName, setIncludeName] = useState(true);
  const [title, setTitle] = useState("");

  // Config from Canvas
  const [finalConfig, setFinalConfig] = useState<{
    frame: { x: number; y: number; width: number; height: number; shape: 'rect' | 'circle' };
    text: { x: number; y: number } | null;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. FETCH CAMPAIGNS (For Dashboard)
  const fetchCampaigns = async () => {
    setIsLoadingList(true);
    try {
      const q = query(collection(db, "dp_campaigns"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: CampaignConfig[] = [];
      querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as CampaignConfig));
      setCampaigns(list);
    } catch (e) { console.error(e); }
    finally { setIsLoadingList(false); }
  };

  // 2. HANDLE LOGIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "1234") {
      setIsAuthenticated(true);
      fetchCampaigns();
    } else {
      alert("Invalid Password");
    }
  };

  // 3. START EDITING
  const startEdit = (campaign: CampaignConfig) => {
    setEditingId(campaign.id);
    setTitle(campaign.title);
    setPreviewUrl(campaign.baseImageUrl); // Load old image
    setFile(null); // Reset file input (unless they change it)

    // Set initial config based on saved data
    setIncludeName(!!campaign.text);
    // Note: AdminCanvas will initialize itself, but we need to ensure the parent state matches
    // We rely on the Canvas 'onConfigChange' to fire on mount to sync this up,
    // OR we can pass initial props to canvas if we wanted to be stricter.

    setView('editor');
    setGeneratedId(null);
  };

  // 4. START NEW
  const startNew = () => {
    setEditingId(null);
    setTitle("");
    setPreviewUrl(null);
    setFile(null);
    setIncludeName(true);
    setView('editor');
    setGeneratedId(null);
  };

  // 5. DELETE
  const handleDelete = async (id: string) => {
    if(!window.confirm("Permanently delete this campaign?")) return;
    try {
      await deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch(e) { alert("Error deleting"); }
  };

  // 6. IMAGE UPLOAD HANDLER
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 7. SAVE (Create or Update)
  const handleSave = async () => {
    if (!title || !finalConfig) return alert("Please check title and layout.");
    if (!previewUrl) return alert("Missing image.");

    try {
      setIsSaving(true);

      let imageUrl = null;
      // Only upload if a NEW file was selected
      if (file) {
        imageUrl = await uploadCampaignImage(file);
      } else {
        // Keep old URL if editing and no new file
        imageUrl = editingId ? null : previewUrl;
        // Logic check: if creating new, file IS required.
        if (!editingId && !file) return alert("Please upload an image");
        if (!editingId && file) imageUrl = await uploadCampaignImage(file);
      }

      // Consolidate config (handle null text)
      const cleanConfig = {
        frame: finalConfig.frame,
        text: includeName ? finalConfig.text : null
      };

      if (editingId) {
        // UPDATE MODE
        await updateCampaign(editingId, title, imageUrl, cleanConfig);
        alert("Campaign Updated!");
        setGeneratedId(editingId); // Show success screen
      } else {
        // CREATE MODE
        // We know imageUrl is string here because of check above
        const newId = await createCampaign(title, imageUrl as string, cleanConfig);
        setGeneratedId(newId);
      }

    } catch (error) {
      console.error(error);
      alert("Error saving. See console.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/c/${generatedId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- RENDER: LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <GlassCard className="p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <LogIn size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-500">Enter password to manage campaigns</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <GlowButton type="button" onClick={handleLogin} className="w-full">Login</GlowButton>
            <Link to="/" className="block text-center text-sm text-gray-500 hover:text-gray-800">Back to Home</Link>
          </form>
        </GlassCard>
      </div>
    );
  }

  // --- RENDER: SUCCESS SCREEN ---
  if (generatedId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <GlassCard className="p-8 w-full max-w-lg text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{editingId ? "Changes Saved!" : "Campaign Live!"}</h2>
          <p className="text-gray-500 mb-6">Your campaign is ready to share.</p>

          <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg mb-6 border border-gray-200">
            <code className="text-sm text-gray-600 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {window.location.origin}/c/{generatedId}
            </code>
            <button onClick={copyLink} className="p-2 bg-white rounded shadow-sm hover:bg-gray-50 text-gray-700">
              {copied ? <Check size={18} className="text-green-600"/> : <Copy size={18} />}
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to={`/c/${generatedId}`} target="_blank" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              View Page
            </Link>
            <button onClick={() => { fetchCampaigns(); setView('dashboard'); setGeneratedId(null); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Back to Dashboard
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // --- RENDER: DASHBOARD LIST ---
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex gap-3">
                <Link to="/" className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">View Site</Link>
                <GlowButton onClick={startNew} icon={<Plus size={18}/>}>New Campaign</GlowButton>
            </div>
          </header>

          {isLoadingList ? (
            <div className="text-center py-20"><Loader2 className="animate-spin inline text-gray-400"/></div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No campaigns yet. Click "New Campaign" to start.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(c => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="h-40 bg-gray-100 relative">
                        <img src={c.baseImageUrl} className="w-full h-full object-cover" alt="preview" />
                    </div>
                    <div className="p-4 flex-1">
                        <h3 className="font-bold text-gray-900 truncate">{c.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">ID: {c.id}</p>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50">
                        <button onClick={() => startEdit(c)} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 size={14}/> Edit
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="flex items-center justify-center px-3 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 size={14}/>
                        </button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER: EDITOR ---
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} /> Back to Dashboard
          </button>

          {previewUrl && (
             <GlowButton onClick={handleSave} isLoading={isSaving} icon={<Save size={18}/>}>
               {editingId ? "Update Campaign" : "Save Campaign"}
             </GlowButton>
          )}
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? "Edit Campaign" : "Create New Campaign"}</h2>

            {/* Title & Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Sunday Service"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-end pb-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                        type="checkbox"
                        checked={includeName}
                        onChange={(e) => setIncludeName(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">Enable Name Input?</span>
                    </label>
                </div>
            </div>

            {/* Image Uploader */}
            {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer relative h-64">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                    <div className="bg-blue-100 p-4 rounded-full mb-4 text-blue-600"><Upload size={32}/></div>
                    <h3 className="font-semibold text-gray-900">Upload Flyer Design</h3>
                </div>
            ) : (
                <div className="space-y-6">
                     <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <span className="text-sm text-blue-800 font-medium">Editing Design Layout</span>
                        <label className="text-xs bg-white border border-blue-200 px-3 py-1.5 rounded cursor-pointer hover:bg-blue-50 text-blue-600 font-semibold">
                            Change Image
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                        </label>
                     </div>

                    <div className="flex justify-center bg-gray-900 p-8 rounded-xl overflow-hidden">
                        <AdminCanvas
                            imageSrc={previewUrl}
                            includeName={includeName}
                            // NEW: Pass the initial data if we are editing
                            initialConfig={editingId ? {
                                frame: campaigns.find(c => c.id === editingId)?.frame!,
                                text: campaigns.find(c => c.id === editingId)?.text || null
                            } : undefined}
                            onConfigChange={(newConfig) => setFinalConfig(newConfig)}
                        />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};