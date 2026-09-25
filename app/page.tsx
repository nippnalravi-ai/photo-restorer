"use client";

import { useState } from "react";
import { Upload, Sparkles, Download, RefreshCw, Image as ImageIcon } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/restore", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process photo");
      }

      setResultUrl(data.resultUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6">
      <header className="max-w-3xl text-center space-y-4 my-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" /> AI Photo Restorer
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Restore Old & Blurry Photos
        </h1>
        <p className="text-slate-400 text-sm">
          Upload any photo from your phone to enhance facial details instantly.
        </p>
      </header>

      <section className="w-full max-w-md my-4">
        {!previewUrl ? (
          <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-8 h-8 text-indigo-400 mb-2" />
            <p className="font-semibold text-slate-200 text-sm text-center">Tap to select a photo from gallery</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 mb-2">Selected Photo</span>
              <img src={previewUrl} alt="Original" className="max-h-60 rounded-lg object-contain" />
            </div>

            {resultUrl && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-xs font-semibold text-indigo-400 mb-2">Restored Result</span>
                <img src={resultUrl} alt="Restored" className="max-h-60 rounded-lg object-contain" />
              </div>
            )}

            {error && <div className="text-red-400 text-xs text-center">{error}</div>}

            <div className="flex flex-col gap-2">
              {!resultUrl ? (
                <button
                  onClick={handleRestore}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> {loading ? "Restoring..." : "Restore Photo"}
                </button>
              ) : (
                <a
                  href={resultUrl}
                  target="_blank"
                  download="restored.png"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Save High-Res Photo
                </a>
              )}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setResultUrl(null);
                }}
                className="w-full text-slate-400 py-2 text-xs"
              >
                Choose Another Photo
              </button>
            </div>
          </div>
        )}
      </section>

      <footer className="text-xs text-slate-600 py-4">
        100% Mobile Hosted & Powered by AI
      </footer>
    </main>
  );
}
