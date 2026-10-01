import {
  SystemHealthResponse,
  SystemStatusResponse,
  BriefValidationResponse,
  AssetValidationResponse,
} from './types';
import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchHealth(): Promise<{ data?: SystemHealthResponse; error?: string; latencyMs: number }> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      return { error: `HTTP ${res.status}: ${res.statusText}`, latencyMs };
    }
    const data: SystemHealthResponse = await res.json();
    return { data, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : 'Failed to connect to backend';
    return { error: message, latencyMs };
  }
}

export async function fetchStatus(): Promise<{ data?: SystemStatusResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data: SystemStatusResponse = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to connect to backend';
    return { error: message };
  }
}

export async function validateBrief(payload: unknown): Promise<{ data?: BriefValidationResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/briefs/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data: BriefValidationResponse = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Validation request failed';
    return { error: message };
  }
}

export async function validateAssetUrl(
  url: string,
  requireTransparency = true
): Promise<{ data?: AssetValidationResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/assets/validate-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ url, require_transparency: requireTransparency }),
    });
    const data: AssetValidationResponse = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Asset validation request failed';
    return { error: message };
  }
}

export async function getDemoBrief(): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/briefs/demo`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load demo brief';
    return { error: message };
  }
}

export async function saveBrief(payload: unknown): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/briefs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail?.message || data.detail || 'Failed to save brief';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save brief';
    return { error: message };
  }
}

export async function generateStrategy(params: {
  brief_id: string;
  job_id?: string;
}): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/strategies/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Failed to generate creative strategy';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Strategy generation request failed';
    return { error: message };
  }
}

export async function validateStrategy(params: {
  brief_payload: any;
  strategy: any;
}): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/strategies/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Strategy claim validation failed';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Strategy claim validation request failed';
    return { error: message };
  }
}

export async function getStrategyTemplates(): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/strategies/templates`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch templates';
    return { error: message };
  }
}

export async function generateBackground(params: {
  strategy_id: string;
  platform: string;
  force_regenerate?: boolean;
}): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/backgrounds/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Failed to generate background';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Background generation request failed';
    return { error: message };
  }
}

export async function getBackground(id: string): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/backgrounds/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch background';
    return { error: message };
  }
}

export async function regenerateBackground(
  id: string,
  customFeedback?: string
): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/backgrounds/${id}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ custom_feedback: customFeedback || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Targeted regeneration failed';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Regeneration request failed';
    return { error: message };
  }
}

export async function generateComposite(params: {
  background_id: string;
  placement?: any;
  shadow?: any;
  force_regenerate?: boolean;
}): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/composites/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Failed to generate product composite';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Product compositing request failed';
    return { error: message };
  }
}

export async function getComposite(id: string): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/composites/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch composite';
    return { error: message };
  }
}

export async function regenerateComposite(
  id: string,
  params?: {
    placement?: any;
    shadow?: any;
    custom_feedback?: string;
  }
): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/composites/${id}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(params || {}),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Targeted recompositing failed';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Recompositing request failed';
    return { error: message };
  }
}

export async function generateFinalAd(params: {
  composite_id: string;
  typography?: any;
  cta?: any;
  price_badge?: any;
  readability?: any;
  force_regenerate?: boolean;
}): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/final-ads/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Failed to render final advertisement';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Final advertisement rendering failed';
    return { error: message };
  }
}

export async function getFinalAd(id: string): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/final-ads/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch final advertisement';
    return { error: message };
  }
}

export async function regenerateFinalAd(
  id: string,
  params?: {
    typography?: any;
    cta?: any;
    price_badge?: any;
    readability?: any;
    custom_feedback?: string;
  }
): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/final-ads/${id}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(params || {}),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Targeted ad re-rendering failed';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ad re-rendering request failed';
    return { error: message };
  }
}

export async function getJobStatus(jobId: string): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch job status';
    return { error: message };
  }
}

export async function dispatchJobStage(
  jobId: string,
  stage: string,
  params?: any
): Promise<{ data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ stage, ...(params || {}) }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.detail || 'Job dispatch failed';
      return { error: typeof msg === 'string' ? msg : JSON.stringify(msg), data };
    }
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Job dispatch request failed';
    return { error: message };
  }
}

export { API_BASE_URL };
