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

export type TargetPlatform = 'instagram' | 'facebook' | 'linkedin';

export interface DiagnosticCheck {
  passed: boolean;
  score: number;
  severity: 'PASS' | 'WARNING' | 'FAIL';
  details: string;
  metrics?: Record<string, any>;
}

export interface BackgroundQAResult {
  status: 'PASS' | 'WARNING' | 'FAIL';
  overall_score: number;
  dimension_check: DiagnosticCheck;
  text_artifact_check: DiagnosticCheck;
  watermark_check: DiagnosticCheck;
  extra_object_check: DiagnosticCheck;
  negative_space_check: DiagnosticCheck;
  product_safe_zone_check: DiagnosticCheck;
  brightness_check: DiagnosticCheck;
  issues: string[];
  warnings: string[];
  retry_guidance?: string;
}

export interface BackgroundResponse {
  id: string;
  job_id: string;
  strategy_id: string;
  platform: TargetPlatform;
  width: number;
  height: number;
  aspect_ratio: string;
  image_url: string;
  qa_status: 'PASS' | 'WARNING' | 'FAIL';
  qa_result: BackgroundQAResult;
  attempt_number: number;
  prompt: {
    positive_prompt: string;
    negative_prompt: string;
    width: number;
    height: number;
    aspect_ratio: string;
    platform: string;
    template_id: string;
    prompt_version: string;
  };
  provider: string;
  model_name: string;
  is_cached: boolean;
  created_at: string;
}

export interface ProductPlacementConfig {
  scale?: number;
  alignment?: 'center' | 'bottom' | 'left' | 'right' | 'top';
  padding_pct?: number;
  offset_x?: number;
  offset_y?: number;
}

export interface ShadowConfig {
  enabled?: boolean;
  opacity?: number;
  blur_radius?: number;
  offset_x?: number;
  offset_y?: number;
}

export interface CompositeQAResult {
  status: 'PASS' | 'WARNING' | 'FAIL';
  overall_score: number;
  dimension_check: DiagnosticCheck;
  placement_check: DiagnosticCheck;
  visibility_check: DiagnosticCheck;
  boundary_check: DiagnosticCheck;
  integrity_check: DiagnosticCheck;
  issues: string[];
  warnings: string[];
  diagnostics?: Record<string, any>;
}

export interface CompositeResponse {
  id: string;
  job_id: string;
  strategy_id: string;
  brief_id?: string;
  background_id: string;
  platform: TargetPlatform;
  width: number;
  height: number;
  aspect_ratio: string;
  image_url: string;
  cutout_url?: string;
  placement_spec: {
    x: number;
    y: number;
    width: number;
    height: number;
    normalized_slot: number[];
  };
  shadow_spec: ShadowConfig;
  integrity_metadata: {
    source_asset_id: string;
    source_asset_hash: string;
    cutout_hash: string;
    background_id: string;
    output_hash: string;
    compositing_method: string;
  };
  qa_status: 'PASS' | 'WARNING' | 'FAIL';
  qa_result: CompositeQAResult;
  attempt_number: number;
  is_cached: boolean;
  created_at: string;
}

export interface GenerateCompositePayload {
  background_id: string;
  placement?: ProductPlacementConfig;
  shadow?: ShadowConfig;
  force_regenerate?: boolean;
}

export interface RegenerateCompositePayload {
  placement?: ProductPlacementConfig;
  shadow?: ShadowConfig;
  custom_feedback?: string;
}

export interface TypographyStyle {
  font_family: string;
  headline_size: number;
  headline_weight: 'regular' | 'bold';
  subheadline_size: number;
  subheadline_weight: 'regular' | 'bold';
  headline_color: string;
  subheadline_color: string;
  line_height_multiplier: number;
  alignment: 'left' | 'center' | 'right';
}

export interface CTAStyle {
  enabled: boolean;
  bg_color: string;
  text_color: string;
  border_radius: number;
  font_size: number;
  padding_x: number;
  padding_y: number;
}

export interface PriceBadgeStyle {
  enabled: boolean;
  bg_color: string;
  text_color: string;
  border_radius: number;
  font_size: number;
}

export interface ReadabilityEnhancementConfig {
  auto_scrim: boolean;
  scrim_opacity: number;
}

export interface FinalAdProvenance {
  source_asset_id: string;
  source_asset_hash: string;
  cutout_hash: string;
  background_id: string;
  composite_id: string;
  composite_output_hash: string;
  copy_hash: string;
  font_hashes: Record<string, string>;
  output_hash: string;
  renderer_version: string;
}

export interface FinalAdQAResult {
  status: 'PASS' | 'WARNING' | 'FAIL';
  overall_score: number;
  dimension_check: DiagnosticCheck;
  opacity_check: DiagnosticCheck;
  text_safe_zone_check: DiagnosticCheck;
  exact_copy_check: DiagnosticCheck;
  cta_check: DiagnosticCheck;
  product_occlusion_check: DiagnosticCheck;
  contrast_check: DiagnosticCheck;
  checks?: DiagnosticCheck[];
  issues: string[];
  warnings: string[];
  diagnostics?: Record<string, any>;
}

export interface FinalAdResponse {
  id: string;
  job_id: string;
  strategy_id: string;
  brief_id?: string;
  composite_id: string;
  background_id: string;
  platform: TargetPlatform;
  width: number;
  height: number;
  aspect_ratio: string;
  image_url: string;
  copy_spec: {
    headline: string;
    subheadline?: string;
    cta_text: string;
    price_text?: string;
    offer_text?: string;
    brand_name: string;
  };
  typography_spec: TypographyStyle;
  cta_spec: CTAStyle;
  logo_spec?: Record<string, any>;
  price_badge_spec?: PriceBadgeStyle;
  readability_spec: ReadabilityEnhancementConfig;
  provenance_chain: FinalAdProvenance;
  qa_status: 'PASS' | 'WARNING' | 'FAIL';
  qa_result: FinalAdQAResult;
  attempt_number: number;
  is_cached: boolean;
  created_at: string;
}

export interface GenerateFinalAdPayload {
  composite_id: string;
  typography?: Partial<TypographyStyle>;
  cta?: Partial<CTAStyle>;
  price_badge?: Partial<PriceBadgeStyle>;
  readability?: Partial<ReadabilityEnhancementConfig>;
  force_regenerate?: boolean;
}

export interface RegenerateFinalAdPayload {
  typography?: Partial<TypographyStyle>;
  cta?: Partial<CTAStyle>;
  price_badge?: Partial<PriceBadgeStyle>;
  readability?: Partial<ReadabilityEnhancementConfig>;
  custom_feedback?: string;
}

