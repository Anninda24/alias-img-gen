'use client';

import React from 'react';
import { Activity, RefreshCw, Server, Database, HardDrive, Cpu } from 'lucide-react';
import { SystemHealthResponse } from '../lib/types';

interface HeaderProps {
  health?: SystemHealthResponse;
  loading: boolean;
  latencyMs?: number;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, loading, latencyMs, onRefresh }) => {
  const isHealthy = health?.status === 'healthy';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-white tracking-tight">System Operations Console</h1>
        <div className="h-4 w-px bg-slate-800" />
        <span className="text-xs text-slate-400 font-mono">Phase 1: Foundations & Architecture</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Real-time Connection Indicator */}
        <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-slate-300 font-medium">
            {isHealthy ? 'API Connected' : 'Degraded / Offline'}
          </span>
          {latencyMs !== undefined && (
            <span className="text-slate-400 font-mono text-[11px] border-l border-slate-700/60 pl-2">
              {latencyMs}ms
            </span>
          )}
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-medium transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>
    </header>
  );
};
