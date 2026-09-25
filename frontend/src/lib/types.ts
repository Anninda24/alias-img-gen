export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  environment: string;
  timestamp: string;
  database: string;
  storage: string;
  worker: string;
}

export interface SystemStatusResponse {
  project_name: string;
  version: string;
  environment: string;
  active_features: {
    payload_gate: boolean;
    asset_gate: boolean;
    deterministic_rendering: boolean;
    mock_ai_providers: boolean;
    vision_qa_advisory: boolean;
    async_worker: boolean;
    [key: string]: boolean;
  };
  configuration: {
    storage_type: string;
    worker_type: string;
    cors_origins: string[];
    database_dialect: string;
    [key: string]: unknown;
  };
}

export type ValidationStatus = 'PASS' | 'WARNING' | 'FAIL';
export type ValidationSeverity = 'INFO' | 'WARNING' | 'ERROR';

export interface ValidationCheckItem {
  code: string;
  message: string;
  severity: ValidationSeverity;
  passed: boolean;
  metadata?: Record<string, any>;
}

export interface ValidationReport {
  status: ValidationStatus;
  gate_name: string;
  summary: string;
  checks: ValidationCheckItem[];
  errors: string[];
  warnings: string[];
}

export interface BriefValidationResponse {
  is_valid: boolean;
  status: ValidationStatus;
  report: ValidationReport;
  validated_payload?: Record<string, any>;
}

export interface AssetValidationResponse {
  is_valid: boolean;
  status: ValidationStatus;
  report: ValidationReport;
  asset_metadata?: {
    url?: string;
    file_size_bytes?: number;
    detected_mime?: string;
    width?: number;
    height?: number;
    aspect_ratio?: number;
    has_alpha_channel?: boolean;
    transparency_percent?: number;
    cutout_bbox?: number[];
    [key: string]: any;
  };
}

export type CopyPolicyClassification = 'FACTUAL' | 'USER_PROVIDED' | 'AI_GENERATED_CREATIVE';

export interface ConceptSpec {
  name: string;
  angle: string;
  notes?: string;
}

export interface VisualDirectionSpec {
  mood: string;
  lighting: string;
  background_direction: string;
  product_placement: string;
  text_placement: string;
  negative_prompt: string;
}

export interface CopySpec {
  headline: string;
  subheadline?: string;
  cta: string;
  headline_policy: CopyPolicyClassification;
  subheadline_policy: CopyPolicyClassification;
  cta_policy: CopyPolicyClassification;
}

export interface CreativeStrategySpec {
  concept: ConceptSpec;
  visual_direction: VisualDirectionSpec;
  copy_spec: CopySpec;
  template_id: string;
}

export interface ClaimAuditItem {
  text_segment: string;
  classification: CopyPolicyClassification;
  is_supported: boolean;
  source_reference?: string;
  reason?: string;
}

export interface ClaimValidationReport {
  passed: boolean;
  supported_facts: string[];
  creative_flourishes: string[];
  unsupported_claims: string[];
  price_check_passed: boolean;
  discount_check_passed: boolean;
  claims_audit: ClaimAuditItem[];
  summary: string;
}

export interface StrategyGenerationResponse {
  status: 'APPROVED' | 'REJECTED';
  strategy: CreativeStrategySpec;
  claim_report: ClaimValidationReport;
  retry_count: number;
  strategy_id?: string;
  created_at?: string;
}

export interface TemplateInfo {
  template_id: string;
  name: string;
  description: string;
  default_product_placement: string;
  default_text_placement: string;
  supports_dark_mode: boolean;
  recommended_for_objectives: string[];
}


