'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { BriefForm } from '../../../components/brief/BriefForm';
import { ValidationFeedbackPanel } from '../../../components/brief/ValidationFeedbackPanel';
import { StrategyPreviewPanel } from '../../../components/strategy/StrategyPreviewPanel';
import { fetchHealth } from '../../../lib/api';
import {
  SystemHealthResponse,
  ValidationReport,
  AssetValidationResponse,
  StrategyGenerationResponse,
} from '../../../lib/types';

export default function NewBriefPage() {
  const [activeTab, setActiveTab] = useState('briefs');
  const [health, setHealth] = useState<SystemHealthResponse | undefined>(undefined);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);

  // Brief and Strategy State
  const [briefPayload, setBriefPayload] = useState<any>(null);
  const [savedBriefId, setSavedBriefId] = useState<string | undefined>(undefined);
  const [strategyResponse, setStrategyResponse] = useState<StrategyGenerationResponse | null>(null);

  // Validation Results State
  const [briefReport, setBriefReport] = useState<ValidationReport | null>(null);
  const [assetReport, setAssetReport] = useState<AssetValidationResponse | null>(null);

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
    loadHealth();
  }, [loadHealth]);

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
                  Step 1: Ad Brief Ingestion & Gate &nbsp;→&nbsp; Step 2: Creative Strategy & Claim Gate
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Phase 1-3 Hard Gates Active</span>
            </div>
          </div>

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
              onStrategyGenerated={(res) => setStrategyResponse(res)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

