'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { BriefForm } from '../../../components/brief/BriefForm';
import { ValidationFeedbackPanel } from '../../../components/brief/ValidationFeedbackPanel';
import { StrategyPreviewPanel } from '../../../components/strategy/StrategyPreviewPanel';
import { BackgroundPreviewPanel } from '../../../components/background/BackgroundPreviewPanel';
import { CompositePreviewPanel } from '../../../components/composite/CompositePreviewPanel';
import { FinalAdPreviewPanel } from '../../../components/final_ad/FinalAdPreviewPanel';
import { LoginView } from '../../../components/auth/LoginView';
import {
  fetchHealth,
  generateStrategy,
  generateBackground,
  generateComposite,
  generateFinalAd,
} from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext';
import {
  SystemHealthResponse,
  ValidationReport,
  AssetValidationResponse,
  StrategyGenerationResponse,
  BackgroundResponse,
  CompositeResponse,
  FinalAdResponse,
} from '../../../lib/types';

export default function NewBriefPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('briefs');
  const [health, setHealth] = useState<SystemHealthResponse | undefined>(undefined);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);

  // Brief and Strategy State
  const [briefPayload, setBriefPayload] = useState<any>(null);
  const [savedBriefId, setSavedBriefId] = useState<string | undefined>(undefined);
  const [strategyResponse, setStrategyResponse] = useState<StrategyGenerationResponse | null>(null);
  const [backgroundData, setBackgroundData] = useState<BackgroundResponse | null>(null);
  const [compositeData, setCompositeData] = useState<CompositeResponse | null>(null);
  const [finalAdData, setFinalAdData] = useState<FinalAdResponse | null>(null);

  // Pipeline automated execution state
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Validation Results State
  const [briefReport, setBriefReport] = useState<ValidationReport | null>(null);
  const [assetReport, setAssetReport] = useState<AssetValidationResponse | null>(null);

  const runFullPipeline = async (targetBriefId: string) => {
    if (!targetBriefId) return;
    setPipelineRunning(true);
    setPipelineError(null);
    try {
      // Step 2: Strategy
      setPipelineStep('Generating Creative Strategy & verifying claims...');
      const stratRes = await generateStrategy({ brief_id: targetBriefId });
      if (stratRes.error || !stratRes.data) {
        setPipelineError(stratRes.error || 'Failed to generate strategy');
        return;
      }
      setStrategyResponse(stratRes.data);
      const stratId = stratRes.data.strategy_id;

      // Step 3: Background
      setPipelineStep('Generating AI Platform Background (Instagram 4:5)...');
      const bgRes = await generateBackground({ strategy_id: stratId, platform: 'instagram' });
      if (bgRes.error || !bgRes.data) {
        setPipelineError(bgRes.error || 'Failed to generate background');
        return;
      }
      setBackgroundData(bgRes.data);
      const bgId = bgRes.data.id;

      // Step 4: Composite
      setPipelineStep('Compositing Authentic Product Cutout onto Background...');
      const compRes = await generateComposite({
        background_id: bgId,
        placement: { scale: 0.9, alignment: 'center' },
        shadow: { enabled: true, opacity: 0.35 },
      });
      if (compRes.error || !compRes.data) {
        setPipelineError(compRes.error || 'Failed to composite product');
        return;
      }
      setCompositeData(compRes.data);
      const compId = compRes.data.id;

      // Step 5: Final Ad
      setPipelineStep('Rendering Deterministic Typography, CTA & Scrim...');
      const adRes = await generateFinalAd({
        composite_id: compId,
        typography: { font_family: 'Inter', headline_size: 52, headline_color: '#FFFFFF', alignment: 'left' },
        cta: { bg_color: '#3B82F6', text_color: '#FFFFFF', border_radius: 10 },
        readability: { auto_scrim: true },
      });
      if (adRes.error || !adRes.data) {
        setPipelineError(adRes.error || 'Failed to render final ad');
        return;
      }
      setFinalAdData(adRes.data);
    } catch (err: any) {
      setPipelineError(err.message || 'Pipeline execution failed');
    } finally {
      setPipelineRunning(false);
      setPipelineStep(null);
    }
  };

  const loadHealth = useCallback(async () => {
    setLoadingHealth(true);
    const healthRes = await fetchHealth();
    if (healthRes.data) {
      setHealth(healthRes.data);
    }
    setLatencyMs(healthRes.latencyMs);
    setLoadingHealth(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadHealth();
    }
  }, [isAuthenticated, loadHealth]);

  const handleValidationOutcome = (
    bReport: ValidationReport | null,
    aReport: AssetValidationResponse | null
  ) => {
    if (bReport !== null) setBriefReport(bReport);
    if (aReport !== null) setAssetReport(aReport);
  };

  const handlePayloadChange = (payload: any, briefId?: string) => {
    setBriefPayload(payload);
    if (briefId) setSavedBriefId(briefId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Verifying tenant credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          health={health}
          loading={loadingHealth}
          latencyMs={latencyMs}
          onRefresh={loadHealth}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Campaign Studio</h1>
                <p className="text-xs text-slate-400">
                  Step 1: Brief & Gates &nbsp;→&nbsp; Step 2: Strategy & Claims &nbsp;→&nbsp; Step 3: Platform Spec & AI Background &nbsp;→&nbsp; Step 4: Product Cutout & Compositing &nbsp;→&nbsp; Step 5: Final Ad
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {savedBriefId && (
                <button
                  type="button"
                  onClick={() => runFullPipeline(savedBriefId)}
                  disabled={pipelineRunning}
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
                  <span>{pipelineRunning ? 'Generating Pipeline...' : '⚡ Generate Full Pipeline'}</span>
                </button>
              )}
              <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Phase 1-6 Hard Gates Active</span>
              </div>
            </div>
          </div>

          {/* Automated Pipeline Progress Banner */}
          {pipelineRunning && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center space-x-3 text-indigo-300 animate-pulse shadow-lg">
              <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Automated Pipeline In Progress: </span>
                <span>{pipelineStep || 'Processing pipeline stages...'}</span>
              </div>
            </div>
          )}

          {/* Pipeline Error Banner */}
          {pipelineError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-rose-200">Pipeline Error: </span>
                {pipelineError}
              </div>
              <button
                type="button"
                onClick={() => setPipelineError(null)}
                className="text-xs underline text-rose-400 hover:text-rose-200 ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Step 1: Two-Column Responsive Grid (Brief Form + Gate Feedback) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 text-xs flex items-center justify-center font-mono">1</span>
                Ad Brief Specification & Ingestion Gates
              </h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Form Column (7 cols) */}
              <div className="xl:col-span-7">
                <BriefForm
                  onValidated={handleValidationOutcome}
                  onPayloadChange={handlePayloadChange}
                  onSavedSuccess={(saved) => {
                    setSavedBriefId(saved.id);
                  }}
                  onLoadDemoAndRun={async (saved) => {
                    setSavedBriefId(saved.id);
                    await runFullPipeline(saved.id);
                  }}
                />
              </div>

              {/* Validation Feedback & Asset Inspection Column (5 cols) */}
              <div className="xl:col-span-5 sticky top-6 space-y-4">
                <ValidationFeedbackPanel
                  briefReport={briefReport}
                  assetReport={assetReport}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Creative Strategy & Claim Gate */}
          <div className="space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-300 text-xs flex items-center justify-center font-mono">2</span>
                Creative Strategy & Claim Gate Engine
              </h2>
            </div>
            <StrategyPreviewPanel
              briefPayload={briefPayload}
              briefId={savedBriefId}
              initialStrategy={strategyResponse}
              onStrategyGenerated={(res) => setStrategyResponse(res)}
            />
          </div>

          {/* Step 3: Platform Creative Spec & Background Generation with Background QA */}
          <div className="space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-300 text-xs flex items-center justify-center font-mono">3</span>
                Platform Creative Specs & AI Background Generation
              </h2>
            </div>
            <BackgroundPreviewPanel
              strategyId={strategyResponse?.strategy_id}
              templateId={strategyResponse?.strategy?.template_id}
              initialBackground={backgroundData}
              onBackgroundGenerated={(bg) => setBackgroundData(bg)}
            />
          </div>

          {/* Step 4: Product Cutout Extraction & Deterministic Compositing */}
          <div className="space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-300 text-xs flex items-center justify-center font-mono">4</span>
                Product Cutout Extraction & Deterministic Compositing
              </h2>
            </div>
            <CompositePreviewPanel
              backgroundId={backgroundData?.id}
              platform={backgroundData?.platform || 'instagram'}
              productAssetUrl={briefPayload?.images?.[0]?.url || briefPayload?.product?.image_url}
              initialComposite={compositeData}
              onCompositeGenerated={(comp) => setCompositeData(comp)}
            />
          </div>

          {/* Step 5: Deterministic Final Advertisement Rendering & QA */}
          <div className="space-y-3 pt-6 border-t border-slate-800/80 pb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-900 text-sky-300 text-xs flex items-center justify-center font-mono">5</span>
                Deterministic Final Advertisement Rendering & QA
              </h2>
            </div>
            <FinalAdPreviewPanel
              compositeId={compositeData?.id}
              platform={compositeData?.platform || backgroundData?.platform || 'instagram'}
              initialAdData={finalAdData}
              onAdGenerated={(ad) => setFinalAdData(ad)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

