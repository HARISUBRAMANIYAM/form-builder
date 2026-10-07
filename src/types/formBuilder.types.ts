// ─────────────────────────────────────────────
//  Form Builder — Core Type Definitions
// ─────────────────────────────────────────────

/** All supported field widget types (Phase 1) */
export enum FieldType {
  // Basic
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  BOOLEAN = 'BOOLEAN',

  // Date & Time
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  TIME = 'TIME',

  // Choice
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_DROPDOWN = 'SINGLE_DROPDOWN',
  MULTIPLE_DROPDOWN = 'MULTIPLE_DROPDOWN',

  // Phase 2 (declared for typing; not rendered yet)
  ATTACHMENT = 'ATTACHMENT',
  PICTURE = 'PICTURE',
  SIGNATURE = 'SIGNATURE',
  RATING = 'RATING',
  SCALE_SINGLE = 'SCALE_SINGLE',
  RANK_ORDER = 'RANK_ORDER',
  SCALE_MULTI_GRID = 'SCALE_MULTI_GRID',
  SCALE_CHECKBOX_GRID = 'SCALE_CHECKBOX_GRID',
  CURRENCY = 'CURRENCY',
  CONSENT = 'CONSENT',
  SYSTEM_ATTRIBUTE = 'SYSTEM_ATTRIBUTE',
  USER_DEFINED = 'USER_DEFINED',
}

/** Field palette categories for grouping in the sidebar */
export type FieldCategory =
  | 'Basic'
  | 'Date & Time'
  | 'Choice'
  | 'Rating & Scale'
  | 'Advanced'
  | 'Media'
  | 'Special';

// ─── Type-specific config types (discriminated union) ───

export interface TextConfig {
  type: FieldType.TEXT;
  maxLength?: number;
  regex?: string;
}

export interface TextAreaConfig {
  type: FieldType.TEXTAREA;
  maxLength?: number;
  rows?: number;
}

export interface NumberConfig {
  type: FieldType.NUMBER;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  precision?: number; // max digits
}

export interface EmailConfig {
  type: FieldType.EMAIL;
}

export interface PhoneConfig {
  type: FieldType.PHONE;
}

export interface BooleanConfig {
  type: FieldType.BOOLEAN;
}

export interface DateConfig {
  type: FieldType.DATE;
  minDate?: string;
  maxDate?: string;
  quickDefault?: 'CURRENTDATE' | '';
}

export interface DateTimeConfig {
  type: FieldType.DATETIME;
  quickDefault?: 'CURRENTDATETIME' | '';
}

export interface TimeConfig {
  type: FieldType.TIME;
  quickDefault?: 'CURRENTTIME' | '';
}

export interface SingleChoiceConfig {
  type: FieldType.SINGLE_CHOICE;
  options: ChoiceOption[];
  layout?: 'vertical' | 'horizontal';
}

export interface MultipleChoiceConfig {
  type: FieldType.MULTIPLE_CHOICE;
  options: ChoiceOption[];
  layout?: 'vertical' | 'horizontal';
  minSelect?: number;
  maxSelect?: number;
}

export interface SingleDropdownConfig {
  type: FieldType.SINGLE_DROPDOWN;
  options: ChoiceOption[];
  filterable?: boolean;
}

export interface MultipleDropdownConfig {
  type: FieldType.MULTIPLE_DROPDOWN;
  options: ChoiceOption[];
  filterable?: boolean;
  maxSelect?: number;
}

/** A single option in a choice/dropdown field */
export interface ChoiceOption {
  label: string;
  value: string;
}

// Phase 2 stubs
export interface AttachmentConfig { type: FieldType.ATTACHMENT; allowedTypes?: string[]; maxSizeMB?: number; }
export interface PictureConfig { type: FieldType.PICTURE; multiple?: boolean; maxCount?: number; }
export interface SignatureConfig { type: FieldType.SIGNATURE; }
export interface RatingConfig { type: FieldType.RATING; maxRating?: number; }
export interface ScaleSingleConfig { type: FieldType.SCALE_SINGLE; min?: number; max?: number; labels?: { min?: string; max?: string }; }
export interface RankOrderConfig { type: FieldType.RANK_ORDER; options: ChoiceOption[]; }
export interface ScaleMultiGridConfig { type: FieldType.SCALE_MULTI_GRID; rows: string[]; columns: string[]; }
export interface ScaleCheckboxGridConfig { type: FieldType.SCALE_CHECKBOX_GRID; rows: string[]; columns: string[]; }
export interface CurrencyConfig { type: FieldType.CURRENCY; currencies?: string[]; allowDecimal?: boolean; }
export interface ConsentConfig { type: FieldType.CONSENT; consentText: string; }
export interface SystemAttributeConfig { type: FieldType.SYSTEM_ATTRIBUTE; attributeKey: string; }
export interface UserDefinedConfig { type: FieldType.USER_DEFINED; content?: string; contentType?: 'text' | 'image'; }

/** Union of all possible field configs */
export type FieldConfig =
  | TextConfig
  | TextAreaConfig
  | NumberConfig
  | EmailConfig
  | PhoneConfig
  | BooleanConfig
  | DateConfig
  | DateTimeConfig
  | TimeConfig
  | SingleChoiceConfig
  | MultipleChoiceConfig
  | SingleDropdownConfig
  | MultipleDropdownConfig
  | AttachmentConfig
  | PictureConfig
  | SignatureConfig
  | RatingConfig
  | ScaleSingleConfig
  | RankOrderConfig
  | ScaleMultiGridConfig
  | ScaleCheckboxGridConfig
  | CurrencyConfig
  | ConsentConfig
  | SystemAttributeConfig
  | UserDefinedConfig;

// ─── Formula Engine Config (Phase 3) ───

export interface FormulaConfig {
  isCalculated: boolean;
  expression: string; // e.g. "[field_qty] * [field_price]" or "CONCAT([field_1], ' ', [field_2])"
  returnType?: 'number' | 'string' | 'date' | 'boolean';
  precision?: number;
  readOnlyCalculated?: boolean;
}

// ─── Grid Column Layout Config ───
export type ColumnSpan = 12 | 6 | 4 | 3; // 12=100%, 6=50%, 4=33%, 3=25%

// ─── Core Form Field ───

export interface FormField {
  /** Unique stable ID (uuid) */
  id: string;
  /** Programmatic key — used as the Formik field name */
  fieldCode: string;
  /** Display label shown on the rendered form */
  fieldName: string;
  /** The widget type */
  fieldType: FieldType;

  // Page, Section, and Grid Column links
  pageId?: string;
  sectionId?: string;
  columnSpan?: ColumnSpan;

  // Common config
  isMandatory: boolean;
  helpText?: string;
  placeholder?: string;
  defaultValue?: string;
  displayOrder: number;
  isActive: boolean;

  /** Formula calculation engine configuration */
  formulaConfig?: FormulaConfig;

  /** Type-specific configuration */
  config: FieldConfig;
}

// ─── Branching Rules (Phase 2 & Phase 3) ───

export interface BranchingCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface BranchingRule {
  id: string;
  /** When ALL or ANY conditions are met … */
  conditions: BranchingCondition[];
  conditionLogic: 'AND' | 'OR';
  /** … show / hide fields OR jump to a specific page */
  action: 'show' | 'hide' | 'jump_to_page';
  targetFieldIds: string[];
  targetPageId?: string;
}

// ─── Form Page & Section (Multi-Step & Grouping) ───

export interface FormPage {
  id: string;
  title: string;
  description?: string;
  displayOrder: number;
}

export interface FormSection {
  id: string;
  pageId: string;
  title: string;
  description?: string;
  displayOrder: number;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

// ─── Top-level Form Definition ───

export interface FormDefinition {
  formId: string;
  formName: string;
  formDescription?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  pages?: FormPage[];
  sections?: FormSection[];
  branchingRules?: BranchingRule[];
}

// ─── Builder UI State ───

export type BuilderView = 'builder' | 'preview' | 'json';

export interface DragItem {
  type: 'PALETTE_ITEM' | 'CANVAS_ITEM';
  fieldType?: FieldType;
  fieldId?: string;
}
