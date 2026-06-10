'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { BASE_PRICE, CATEGORIES, SIZES } from '@/lib/constants';
import { formatPrice, CURRENCY } from '@/lib/currency';
import {
  Upload, Type, RotateCcw, Trash2,
  Loader2, ImagePlus, Minus, Plus, ArrowLeft,
  Palette, Tag, Save, Banknote
} from 'lucide-react';

export default function CreatePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);

  // Black only for launch — other colors coming soon
  const tshirtColor: 'black' = 'black';
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [canvasReady, setCanvasReady] = useState(false);

  // Design data stored per side
  const [frontJSON, setFrontJSON] = useState<string | null>(null);
  const [backJSON, setBackJSON] = useState<string | null>(null);

  // Text input state
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(32);

  // Product form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Graphic Art');
  const [sellingPrice, setSellingPrice] = useState(60);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState<'design' | 'details'>('design');

  // Initialize Fabric.js canvas
  useEffect(() => {
    let cancelled = false;
    let canvas: any = null;

    (async () => {
      const fabricModule = await import('fabric');
      const fabric = (fabricModule as any).default || fabricModule;

      if (cancelled || !canvasRef.current) return;

      canvas = new fabric.Canvas(canvasRef.current, {
        width: 480,
        height: 480,
        backgroundColor: 'transparent',
        selection: true,
      });

      fabricRef.current = canvas;
      if (typeof window !== 'undefined') (window as any).__printpodCanvas = canvas;
      setCanvasReady(true);
    })();

    return () => {
      cancelled = true;
      // Dispose Fabric BEFORE React touches the DOM so the canvas wrapper
      // doesn't break the parent's child tree.
      if (canvas) {
        try { canvas.dispose(); } catch {}
      }
      fabricRef.current = null;
    };
  }, []);

  // Save current side and load new side
  const switchSide = useCallback((newSide: 'front' | 'back') => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const currentJSON = JSON.stringify(canvas.toJSON());
    if (activeSide === 'front') setFrontJSON(currentJSON);
    else setBackJSON(currentJSON);

    const loadJSON = newSide === 'front' ? frontJSON : backJSON;
    if (loadJSON) {
      canvas.loadFromJSON(JSON.parse(loadJSON)).then(() => canvas.renderAll());
    } else {
      canvas.clear();
      canvas.renderAll();
    }

    setActiveSide(newSide);
  }, [activeSide, frontJSON, backJSON]);

  // Add image to canvas
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fabricModule = await import('fabric');
      const fabric = fabricModule.default || fabricModule;
      const img = await fabric.FabricImage.fromURL(event.target?.result as string);
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width!, maxSize / img.height!);
      img.scale(scale);
      fabricRef.current.add(img);
      // Drop new artwork in the middle of the tee (chest area)
      fabricRef.current.centerObject(img);
      img.setCoords();
      fabricRef.current.setActiveObject(img);
      fabricRef.current.requestRenderAll();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // Add text to canvas
  async function addText() {
    if (!textInput.trim() || !fabricRef.current) return;
    const fabricModule = await import('fabric');
    const fabric = fabricModule.default || fabricModule;

    const text = new fabric.IText(textInput, {
      fontSize: fontSize,
      fill: textColor,
      fontFamily: 'Arial',
    });
    fabricRef.current.add(text);
    // Center new text on the tee
    fabricRef.current.centerObject(text);
    text.setCoords();
    fabricRef.current.setActiveObject(text);
    fabricRef.current.requestRenderAll();
    setTextInput('');
  }

  // Delete selected
  function deleteSelected() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length) {
      active.forEach((obj: any) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }

  // Export canvas as image
  function getCanvasImage(): string | null {
    const canvas = fabricRef.current;
    if (!canvas || canvas.getObjects().length === 0) return null;
    return canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
  }

  // Publish product
  async function handlePublish() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!title.trim()) return;

    setPublishing(true);
    try {
      // Save current side
      const canvas = fabricRef.current;
      if (canvas) {
        const currentJSON = JSON.stringify(canvas.toJSON());
        if (activeSide === 'front') setFrontJSON(currentJSON);
        else setBackJSON(currentJSON);
      }

      // Get preview images
      const frontPreview = getCanvasImage();

      // Switch to back, get image, switch back
      let backPreview: string | null = null;
      if (backJSON) {
        const savedFront = canvas ? JSON.stringify(canvas.toJSON()) : null;
        if (canvas && backJSON) {
          await canvas.loadFromJSON(JSON.parse(backJSON));
          canvas.renderAll();
          backPreview = getCanvasImage();
          if (savedFront) {
            await canvas.loadFromJSON(JSON.parse(savedFront));
            canvas.renderAll();
          }
        }
      }

      // Upload images if they exist.
      // Previews go to the PUBLIC "previews" bucket so they display on the
      // marketplace, product pages and admin. Print-ready design files go to
      // the PRIVATE "designs" bucket (admin downloads them for production).
      let design_front_url, design_back_url, preview_front_url, preview_back_url;

      if (frontPreview) {
        const blob = await (await fetch(frontPreview)).blob();
        const previewRes = await api.uploadImage(
          new File([blob], 'front-preview.png', { type: 'image/png' }),
          'previews'
        );
        if (previewRes?.message && !previewRes?.url) throw new Error(previewRes.message);
        const designRes = await api.uploadImage(
          new File([blob], 'front-design.png', { type: 'image/png' }),
          'designs'
        );
        preview_front_url = previewRes.url;
        design_front_url = designRes.url || previewRes.url;
      }

      if (backPreview) {
        const blob = await (await fetch(backPreview)).blob();
        const previewRes = await api.uploadImage(
          new File([blob], 'back-preview.png', { type: 'image/png' }),
          'previews'
        );
        const designRes = await api.uploadImage(
          new File([blob], 'back-design.png', { type: 'image/png' }),
          'designs'
        );
        preview_back_url = previewRes.url;
        design_back_url = designRes.url || previewRes.url;
      }

      await api.createProduct({
        title,
        description,
        tshirt_color: tshirtColor,
        design_front_url,
        design_back_url,
        preview_front_url,
        preview_back_url,
        selling_price: sellingPrice,
        category,
        sizes: selectedSizes,
        status: 'pending',
      } as any);

      router.push('/dashboard?created=1');
    } catch (err: any) {
      alert(err.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  }

  const profit = sellingPrice - BASE_PRICE;

  return (
    <div className="page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em' }}>
              {step === 'design' ? 'DESIGN YOUR TEE' : 'PRODUCT DETAILS'}
            </h1>
          </div>
          {step === 'design' ? (
            <button
              onClick={() => setStep('details')}
              className="px-5 py-2.5 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all text-sm"
            >
              Next: Details →
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setStep('design')} className="px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm hover:bg-[var(--bg-tertiary)]">
                ← Back to Editor
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !title}
                className="px-5 py-2.5 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Submit for Review
              </button>
            </div>
          )}
        </div>

        {/* Design panel — stays mounted so Fabric.js DOM isn't unmounted mid-life */}
        <div className={step === 'design' ? '' : 'hidden'}>
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            {/* Canvas area */}
            <div className="flex flex-col items-center">
              {/* T-shirt color (black only for launch) + side toggle */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Color:</span>
                  {/* Active black */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[var(--accent)] scale-110" />
                    <span className="text-[9px] uppercase tracking-wider text-[var(--accent)] font-semibold">Black</span>
                  </div>
                  {/* Coming soon — white */}
                  <div className="flex flex-col items-center gap-1 opacity-50 relative">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-[var(--border)]" />
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Soon</span>
                  </div>
                  {/* Coming soon — gray */}
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-[#888] border-2 border-[var(--border)]" />
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Soon</span>
                  </div>
                  {/* Coming soon — navy */}
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-[#1a2a4a] border-2 border-[var(--border)]" />
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Soon</span>
                  </div>
                </div>

                <div className="w-px h-6 bg-[var(--border)]" />

                <div className="flex bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-1">
                  <button
                    onClick={() => switchSide('front')}
                    className={`px-4 py-1.5 text-xs rounded-lg transition-colors ${activeSide === 'front' ? 'bg-[var(--accent)] text-black font-medium' : 'text-[var(--text-muted)]'}`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => switchSide('back')}
                    className={`px-4 py-1.5 text-xs rounded-lg transition-colors ${activeSide === 'back' ? 'bg-[var(--accent)] text-black font-medium' : 'text-[var(--text-muted)]'}`}
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* T-shirt mockup as a CSS background so Fabric's canvas wrapper
                  doesn't have a sibling DOM element React tries to reorder. */}
              <div
                className="relative rounded-2xl border border-[var(--border)] overflow-hidden"
                style={{
                  width: 480,
                  height: 480,
                  backgroundColor: '#ffffff',
                  backgroundImage: `url(/tshirt/${activeSide}.png)`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <canvas ref={canvasRef} className="relative z-10" />
              </div>
            </div>

            {/* Tools panel */}
            <div className="space-y-4">
              {/* Upload image */}
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <ImagePlus className="w-4 h-4 text-[var(--accent)]" /> Upload Image
                </h3>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--accent)]/50 transition-colors">
                  <Upload className="w-6 h-6 text-[var(--text-muted)] mb-2" />
                  <span className="text-xs text-[var(--text-muted)]">PNG, JPG up to 5MB</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {/* Add text */}
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-[var(--accent)]" /> Add Text
                </h3>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text..."
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] mb-3"
                  onKeyDown={(e) => e.key === 'Enter' && addText()}
                />
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">Color:</span>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">Size:</span>
                    <button onClick={() => setFontSize(Math.max(12, fontSize - 4))} className="p-1 rounded hover:bg-[var(--bg-tertiary)]">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs w-6 text-center">{fontSize}</span>
                    <button onClick={() => setFontSize(Math.min(80, fontSize + 4))} className="p-1 rounded hover:bg-[var(--bg-tertiary)]">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={addText}
                  disabled={!textInput.trim()}
                  className="w-full py-2 bg-[var(--bg-tertiary)] rounded-xl text-sm hover:bg-[var(--border)] transition-colors disabled:opacity-30"
                >
                  Add Text
                </button>
              </div>

              {/* Actions */}
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
                <h3 className="text-sm font-medium mb-3">Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={deleteSelected}
                    className="flex items-center justify-center gap-2 py-2 text-xs rounded-xl border border-[var(--border)] hover:bg-red-500/10 hover:border-red-500/30 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <button
                    onClick={() => {
                      fabricRef.current?.clear();
                      fabricRef.current?.renderAll();
                    }}
                    className="flex items-center justify-center gap-2 py-2 text-xs rounded-xl border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details form */}
        <div className={step === 'details' ? '' : 'hidden'}>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  <Tag className="inline w-3 h-3 mr-1" /> Product Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your design a name"
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Tell buyers about your design..."
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  <Palette className="inline w-3 h-3 mr-1" /> Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSizes((prev) =>
                          prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                        )
                      }
                      className={`w-11 h-11 rounded-xl border text-xs font-medium transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-[var(--accent)] text-black border-[var(--accent)]'
                          : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[var(--accent)]" /> Pricing
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-muted)]">Base production cost</span>
                  <span className="text-sm font-medium">{formatPrice(BASE_PRICE)}</span>
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-2">Your selling price ({CURRENCY.symbol})</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={BASE_PRICE + 1}
                      step="0.5"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(parseFloat(e.target.value) || BASE_PRICE + 1)}
                      className="w-full pl-4 pr-16 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-medium">{CURRENCY.symbol}</span>
                  </div>
                </div>

                <div className={`flex justify-between items-center py-3 px-4 rounded-xl ${profit > 0 ? 'bg-[var(--success)]/10 border border-[var(--success)]/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <span className="text-sm font-medium">Your profit per sale</span>
                  <span className={`text-lg font-bold ${profit > 0 ? 'text-[var(--success)]' : 'text-red-400'}`}>
                    {formatPrice(profit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
