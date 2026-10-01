'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Building,
  Target,
  FileCheck,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  Play,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  validateBrief,
  validateAssetUrl,
  getDemoBrief,
  saveBrief,
} from '../../lib/api';
import { ValidationReport, AssetValidationResponse } from '../../lib/types';
import { ColorPicker } from '../common/ColorPicker';

interface BriefFormProps {
  onValidated: (
    briefReport: ValidationReport | null,
    assetReport: AssetValidationResponse | null
  ) => void;
  onSavedSuccess?: (savedData: any) => void;
  onPayloadChange?: (payload: any, briefId?: string) => void;
  onLoadDemoAndRun?: (savedData: any) => Promise<void> | void;
}

export const BriefForm: React.FC<BriefFormProps> = ({
  onValidated,
  onSavedSuccess,
  onPayloadChange,
  onLoadDemoAndRun,
}) => {

  // Form State
  const [productName, setProductName] = useState('SmartFit X1');
  const [category, setCategory] = useState('Smart Wearables');
  const [sku, setSku] = useState('SMARTFIT-X1-BLK');
  const [price, setPrice] = useState('4999');
  const [originalPrice, setOriginalPrice] = useState('6499');
  const [currency, setCurrency] = useState('BDT');
  const [discountPercent, setDiscountPercent] = useState('23');
  const [promoCode, setPromoCode] = useState('FIT23');
  const [features, setFeatures] = useState<string[]>([
    '7-day battery life on a single charge',
    'Continuous heart-rate & SpO2 tracking',
    'Advanced sleep stages monitoring',
    '5 ATM water resistance up to 50 meters',
  ]);
  const [newFeature, setNewFeature] = useState('');

  // Brand State
  const [brandName, setBrandName] = useState('SmartFit');
  const [logoUrl, setLogoUrl] = useState('');
  const [colors, setColors] = useState<string[]>(['#2563EB', '#111827', '#10B981']);
  const [newColor, setNewColor] = useState('#3B82F6');
  const [fontFamily, setFontFamily] = useState('Inter');

  // Campaign State
  const [campaignName, setCampaignName] = useState('SmartFit X1 Launch Bangladesh');
  const [objective, setObjective] = useState('product_sales');
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'facebook', 'linkedin']);
  const [targetAudience, setTargetAudience] = useState(
    'Urban fitness enthusiasts and professionals aged 22-40.'
  );

  // Claims & Copy
  const [approvedClaims, setApprovedClaims] = useState<string[]>([
    '7-day battery life',
    'Heart-rate tracking with optical sensor',
    'Sleep tracking analysis',
  ]);
  const [newClaim, setNewClaim] = useState('');
  const [headline, setHeadline] = useState('Track Every Move. Elevate Every Day.');
  const [subheadline, setSubheadline] = useState('7-day battery life with real-time biometric fitness monitoring.');
  const [cta, setCta] = useState('Shop Now');

  // Asset State
  const [imageUrl, setImageUrl] = useState('http://127.0.0.1:8000/api/v1/storage/demo/smartfit_x1.png');
  const [requireTransparency, setRequireTransparency] = useState(true);

  // Status
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [validatingBrief, setValidatingBrief] = useState(false);
  const [validatingAsset, setValidatingAsset] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Helpers
  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((item) => item !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const addClaim = () => {
    if (newClaim.trim()) {
      setApprovedClaims([...approvedClaims, newClaim.trim()]);
      setNewClaim('');
    }
  };

  const removeClaim = (idx: number) => {
    setApprovedClaims(approvedClaims.filter((_, i) => i !== idx));
  };

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors(colors.filter((c) => c !== colorToRemove));
  };

  const constructPayload = () => {
    return {
      brand: {
        name: brandName,
        logo_url: logoUrl || undefined,
        colors: colors.length > 0 ? colors : undefined,
        font_family: fontFamily || undefined,
      },
      product: {
        name: productName,
        category: category || undefined,
        sku: sku || undefined,
        offer: {
          price: parseFloat(price) || 0,
          original_price: originalPrice ? parseFloat(originalPrice) : undefined,
          currency: currency || 'USD',
          discount_percent: discountPercent ? parseFloat(discountPercent) : undefined,
          promo_code: promoCode || undefined,
        },
        features: features,
      },
      images: [
        {
          url: imageUrl,
          asset_type: 'primary_product',
          description: `${productName} primary product cutout`,
        },
      ],
      campaign: {
        name: campaignName || undefined,
        objective: objective,
        platforms: platforms,
        target_audience: targetAudience || undefined,
      },
      approved_claims: approvedClaims,
      copy: {
        headline: headline || undefined,
        subheadline: subheadline || undefined,
        cta: cta || undefined,
      },
    };
  };

  // Actions
  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    setSaveSuccessMsg(null);
    const { data } = await getDemoBrief();
    if (data) {
      setBrandName(data.brand.name || '');
      setLogoUrl(data.brand.logo_url || '');
      setColors(data.brand.colors || []);
      setFontFamily(data.brand.font_family || 'Inter');

      setProductName(data.product.name || '');
      setCategory(data.product.category || '');
      setSku(data.product.sku || '');
      setPrice(String(data.product.offer?.price || '4999'));
      setOriginalPrice(String(data.product.offer?.original_price || '6499'));
      setCurrency(data.product.offer?.currency || 'BDT');
      setDiscountPercent(String(data.product.offer?.discount_percent || '23'));
      setPromoCode(data.product.offer?.promo_code || 'FIT23');
      setFeatures(data.product.features || []);

      if (data.images && data.images[0]) {
        setImageUrl(data.images[0].url);
      }

      setCampaignName(data.campaign.name || '');
      setObjective(data.campaign.objective || 'product_sales');
      setPlatforms(data.campaign.platforms || ['instagram', 'facebook', 'linkedin']);
      setTargetAudience(data.campaign.target_audience || '');

      setApprovedClaims(data.approved_claims || []);
      setHeadline(data.copy?.headline || '');
      setSubheadline(data.copy?.subheadline || '');
      if (onPayloadChange) {
        onPayloadChange(data);
      }

      // Automatically validate & save demo brief to backend so downstream steps are unlocked
      const saveRes = await saveBrief(data);
      if (saveRes.data && !saveRes.error) {
        setSaveSuccessMsg(`SmartFit X1 Demo loaded & saved! (ID: ${saveRes.data.id})`);
        onValidated(
          saveRes.data.brief_report,
          saveRes.data.asset_report ? { is_valid: true, status: 'PASS', report: saveRes.data.asset_report } : null
        );
        if (onPayloadChange) onPayloadChange(data, saveRes.data.id);
        if (onSavedSuccess) onSavedSuccess(saveRes.data);
        if (onLoadDemoAndRun) {
          await onLoadDemoAndRun(saveRes.data);
        }
      }
    }
    setLoadingDemo(false);
  };

  React.useEffect(() => {
    if (onPayloadChange) {
      onPayloadChange(constructPayload());
    }
  }, []);

  const handleValidateAsset = async () => {
    setValidatingAsset(true);
    setSaveSuccessMsg(null);
    const res = await validateAssetUrl(imageUrl, requireTransparency);
    if (res.data) {
      onValidated(null, res.data);
    }
    setValidatingAsset(false);
  };

  const handleValidateBrief = async () => {
    setValidatingBrief(true);
    setSaveSuccessMsg(null);
    const payload = constructPayload();
    if (onPayloadChange) {
      onPayloadChange(payload);
    }
    const briefRes = await validateBrief(payload);
    const assetRes = await validateAssetUrl(imageUrl, requireTransparency);

    onValidated(briefRes.data ? briefRes.data.report : null, assetRes.data ? assetRes.data : null);
    setValidatingBrief(false);
  };

  const handleSaveBrief = async () => {
    setSaving(true);
    setSaveSuccessMsg(null);
    const payload = constructPayload();
    const res = await saveBrief(payload);
    if (res.data && !res.error) {
      setSaveSuccessMsg(`Ad Brief successfully saved! (ID: ${res.data.id})`);
      onValidated(res.data.brief_report, res.data.asset_report ? { is_valid: true, status: 'PASS', report: res.data.asset_report } : null);
      if (onPayloadChange) onPayloadChange(payload, res.data.id);
      if (onSavedSuccess) onSavedSuccess(res.data);
    } else {
      onValidated(res.data?.detail?.report || null, null);
    }
    setSaving(false);
  };


  return (
    <div className="space-y-6">
      {/* Top Banner with Load Demo button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">Ad Brief Ingestion & Gate Studio</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Phase 2: Strict schema validation, offer bounds, and genuine asset inspection.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all shrink-0 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>{loadingDemo ? 'Loading...' : '⚡ Load SmartFit X1 Demo'}</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Form Grid */}
      <div className="space-y-6">
        {/* 1. Product & Offer Information */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShoppingBag className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              1. Product & Offer Details (Required)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                placeholder="e.g. SmartFit X1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Smart Wearables"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">SKU / Model</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="e.g. SMARTFIT-X1"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Selling Price <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500 font-bold"
                placeholder="4999"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Original Price</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono focus:outline-none focus:border-indigo-500 line-through"
                placeholder="6499"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                placeholder="BDT"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Discount %</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-400 font-mono focus:outline-none focus:border-indigo-500 font-semibold"
                placeholder="23"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Promo Code</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500 uppercase"
                placeholder="FIT23"
              />
            </div>
          </div>

          {/* Features Tagging */}
          <div className="pt-2 space-y-2">
            <label className="text-xs font-medium text-slate-400 block">Product Features (Ground Truth)</label>
            <div className="flex flex-wrap gap-2">
              {features.map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700/60"
                >
                  <span>{f}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2 pt-1">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                placeholder="Add a factual feature (e.g. 7-day battery life)"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* 2. Product Image & Asset Gate */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                2. Product Image Asset & Asset Gate (Required)
              </h4>
            </div>
            <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={requireTransparency}
                onChange={(e) => setRequireTransparency(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>Require Transparent Cutout</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              placeholder="https://.../product_cutout.png"
            />
            <button
              type="button"
              onClick={handleValidateAsset}
              disabled={validatingAsset || !imageUrl}
              className="px-4 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all shrink-0 disabled:opacity-50"
            >
              {validatingAsset ? 'Inspecting...' : 'Run Asset Gate'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            The Asset Gate downloads the image, checks file signatures (PNG/WebP), inspects resolution (&gt;=400px),
            calculates alpha transparency, and enforces strict SSRF protections against internal networks.
          </p>
        </div>

        {/* 3. Brand Information */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Building className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              3. Brand Identity (Required Name, Optional Assets)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Brand Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="SmartFit"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Logo URL (Optional)</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                placeholder="https://.../logo.png"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Font Family</label>
              <input
                type="text"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Inter"
              />
            </div>
          </div>

          {/* Color Palette Chips */}
          <div className="pt-2 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block">Brand Palette Definition</label>
              <p className="text-[11px] text-slate-500">
                Authoritative brand colors will be used across backgrounds, typography, and CTA buttons.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ColorPicker
                label="Primary Brand Color"
                value={colors[0] || '#2563EB'}
                onChange={(c) => {
                  const updated = [...colors];
                  updated[0] = c;
                  setColors(updated);
                }}
                brandColors={colors}
              />
              <ColorPicker
                label="Secondary / Dark Tone"
                value={colors[1] || '#111827'}
                onChange={(c) => {
                  const updated = [...colors];
                  updated[1] = c;
                  setColors(updated);
                }}
                brandColors={colors}
              />
              <ColorPicker
                label="Accent / Highlight"
                value={colors[2] || '#10B981'}
                onChange={(c) => {
                  const updated = [...colors];
                  updated[2] = c;
                  setColors(updated);
                }}
                brandColors={colors}
              />
            </div>
          </div>
        </div>

        {/* 4. Campaign Targeting & Platforms */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Target className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              4. Campaign Objective & Platforms (Required)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Q4 Fitness Push"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Advertising Objective</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="product_sales">Product Sales</option>
                <option value="brand_awareness">Brand Awareness</option>
                <option value="lead_generation">Lead Generation</option>
                <option value="engagement">Engagement</option>
                <option value="traffic">Traffic</option>
              </select>
            </div>
          </div>

          {/* Platform Pills */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-medium text-slate-400 block">
              Target Platforms <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'instagram', label: 'Instagram (4:5)' },
                { id: 'facebook', label: 'Facebook (1:1)' },
                { id: 'linkedin', label: 'LinkedIn (1.91:1)' },
              ].map((p) => {
                const selected = platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Active professionals looking for daily fitness tracking"
            />
          </div>
        </div>

        {/* 5. Approved Claims & Copy Overrides */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <FileCheck className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              5. Approved Claims & Copy Directives
            </h4>
          </div>

          {/* Approved Claims */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 block">
              Approved Claims (The AI strategist cannot invent claims outside these)
            </label>
            <div className="flex flex-wrap gap-2">
              {approvedClaims.map((claim, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 text-xs border border-slate-700/60"
                >
                  <span>{claim}</span>
                  <button type="button" onClick={() => removeClaim(idx)} className="hover:text-rose-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2 pt-1">
              <input
                type="text"
                value={newClaim}
                onChange={(e) => setNewClaim(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addClaim())}
                placeholder="Add approved claim (e.g. Water resistant to 50 meters)"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addClaim}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Add Claim
              </button>
            </div>
          </div>

          {/* Copy Overrides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Headline Override (Optional)</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Track Every Move."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Subheadline Override (Optional)</label>
              <input
                type="text"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. 7-day battery life."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Call-To-Action (CTA)</label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Shop Now"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleValidateBrief}
              disabled={validatingBrief || saving}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{validatingBrief ? 'Verifying Gates...' : 'Validate Brief (Dry Run)'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveBrief}
            disabled={saving || validatingBrief}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Save Validated Brief'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
