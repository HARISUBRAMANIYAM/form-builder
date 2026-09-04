import { FieldType, type FieldCategory, type FieldConfig } from "../types/formBuilder.types";

export interface FieldTypeRegistryEntry {
  type: FieldType;
  label: string;
  description: string;
  icon: string;
  category: FieldCategory;
  phase: 1 | 2;
  defaultConfig: FieldConfig;
}

export const FIELD_TYPE_REGISTRY: FieldTypeRegistryEntry[] = [
  // ── Basic ───────────────────────────────────────────────────
  { type: FieldType.TEXT, label: 'Text', description: 'Single-line text input', icon: 'pi pi-pencil', category: 'Basic', phase: 1, defaultConfig: { type: FieldType.TEXT, maxLength: 255 } },
  { type: FieldType.TEXTAREA, label: 'Text Area', description: 'Multi-line text input', icon: 'pi pi-align-left', category: 'Basic', phase: 1, defaultConfig: { type: FieldType.TEXTAREA, maxLength: 2000, rows: 4 } },
  { type: FieldType.NUMBER, label: 'Number', description: 'Numeric input with optional decimals', icon: 'pi pi-hashtag', category: 'Basic', phase: 1, defaultConfig: { type: FieldType.NUMBER, allowDecimal: false } },
  { type: FieldType.EMAIL, label: 'Email', description: 'Email address with format validation', icon: 'pi pi-envelope', category: 'Basic', phase: 1, defaultConfig: { type: FieldType.EMAIL } },
  { type: FieldType.PHONE, label: 'Phone', description: 'Phone number input', icon: 'pi pi-phone', category: 'Basic', phase: 1, defaultConfig: { type: FieldType.PHONE } },
  { type: FieldType.BOOLEAN, label: 'Toggle / Yes-No', description: 'True/False toggle switch', icon: 'pi pi-toggle-on', category: 'Basic', phase: 1, defaultConfig: { type: FieldType.BOOLEAN } },
  { type: FieldType.CURRENCY, label: 'Currency', description: 'Monetary amount with currency selector', icon: 'pi pi-dollar', category: 'Basic', phase: 2, defaultConfig: { type: FieldType.CURRENCY, currencies: ['USD', 'EUR', 'GBP', 'INR'], allowDecimal: true } },

  // ── Date & Time ─────────────────────────────────────────────
  { type: FieldType.DATE, label: 'Date', description: 'Date picker', icon: 'pi pi-calendar', category: 'Date & Time', phase: 1, defaultConfig: { type: FieldType.DATE, quickDefault: '' } },
  { type: FieldType.DATETIME, label: 'Date & Time', description: 'Date + time picker', icon: 'pi pi-calendar-clock', category: 'Date & Time', phase: 1, defaultConfig: { type: FieldType.DATETIME, quickDefault: '' } },
  { type: FieldType.TIME, label: 'Time', description: 'Time-only picker', icon: 'pi pi-clock', category: 'Date & Time', phase: 1, defaultConfig: { type: FieldType.TIME, quickDefault: '' } },

  // ── Choice ──────────────────────────────────────────────────
  {
    type: FieldType.SINGLE_CHOICE, label: 'Single Choice', description: 'Radio button group — pick one', icon: 'pi pi-circle', category: 'Choice', phase: 1,
    defaultConfig: { type: FieldType.SINGLE_CHOICE, options: [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }], layout: 'vertical' },
  },
  {
    type: FieldType.MULTIPLE_CHOICE, label: 'Multiple Choice', description: 'Checkbox group — pick many', icon: 'pi pi-check-square', category: 'Choice', phase: 1,
    defaultConfig: { type: FieldType.MULTIPLE_CHOICE, options: [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }], layout: 'vertical' },
  },
  {
    type: FieldType.SINGLE_DROPDOWN, label: 'Single Dropdown', description: 'Dropdown — select one', icon: 'pi pi-chevron-down', category: 'Choice', phase: 1,
    defaultConfig: { type: FieldType.SINGLE_DROPDOWN, options: [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }], filterable: true },
  },
  {
    type: FieldType.MULTIPLE_DROPDOWN, label: 'Multiple Dropdown', description: 'Multi-select dropdown', icon: 'pi pi-list', category: 'Choice', phase: 1,
    defaultConfig: { type: FieldType.MULTIPLE_DROPDOWN, options: [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }], filterable: true },
  },
  {
    type: FieldType.RANK_ORDER, label: 'Rank Order', description: 'Drag-to-rank list', icon: 'pi pi-sort', category: 'Choice', phase: 2,
    defaultConfig: { type: FieldType.RANK_ORDER, options: [{ label: 'Item 1', value: 'item_1' }, { label: 'Item 2', value: 'item_2' }, { label: 'Item 3', value: 'item_3' }] },
  },

  // ── Rating & Scale ───────────────────────────────────────────
  { type: FieldType.RATING, label: 'Rating', description: 'Star rating (1–5 or custom)', icon: 'pi pi-star', category: 'Rating & Scale', phase: 2, defaultConfig: { type: FieldType.RATING, maxRating: 5 } },
  { type: FieldType.SCALE_SINGLE, label: 'Scale / Slider', description: 'Linear scale slider', icon: 'pi pi-sliders-h', category: 'Rating & Scale', phase: 2, defaultConfig: { type: FieldType.SCALE_SINGLE, min: 1, max: 10, labels: { min: 'Low', max: 'High' } } },
  { type: FieldType.SCALE_MULTI_GRID, label: 'Multi-choice Grid', description: 'Matrix radio grid (rows × columns)', icon: 'pi pi-table', category: 'Rating & Scale', phase: 2, defaultConfig: { type: FieldType.SCALE_MULTI_GRID, rows: ['Row 1', 'Row 2'], columns: ['Col 1', 'Col 2', 'Col 3'] } },
  { type: FieldType.SCALE_CHECKBOX_GRID, label: 'Checkbox Grid', description: 'Matrix checkbox grid (rows × columns)', icon: 'pi pi-th-large', category: 'Rating & Scale', phase: 2, defaultConfig: { type: FieldType.SCALE_CHECKBOX_GRID, rows: ['Row 1', 'Row 2'], columns: ['Col 1', 'Col 2', 'Col 3'] } },

  // ── Media ────────────────────────────────────────────────────
  { type: FieldType.ATTACHMENT, label: 'Attachment', description: 'File upload with type restriction', icon: 'pi pi-paperclip', category: 'Media', phase: 2, defaultConfig: { type: FieldType.ATTACHMENT, allowedTypes: ['pdf', 'docx', 'xlsx'], maxSizeMB: 10 } },
  { type: FieldType.PICTURE, label: 'Picture', description: 'Image upload (single or multiple)', icon: 'pi pi-image', category: 'Media', phase: 2, defaultConfig: { type: FieldType.PICTURE, multiple: false, maxCount: 1 } },
  { type: FieldType.SIGNATURE, label: 'Signature', description: 'Handwritten signature canvas', icon: 'pi pi-pen-to-square', category: 'Media', phase: 2, defaultConfig: { type: FieldType.SIGNATURE } },

  // ── Special ──────────────────────────────────────────────────
  { type: FieldType.CONSENT, label: 'Consent', description: 'Mandatory consent checkbox', icon: 'pi pi-shield', category: 'Special', phase: 2, defaultConfig: { type: FieldType.CONSENT, consentText: 'I agree to the terms and conditions.' } },
  { type: FieldType.USER_DEFINED, label: 'User Defined', description: 'Static text or image block', icon: 'pi pi-info-circle', category: 'Special', phase: 2, defaultConfig: { type: FieldType.USER_DEFINED, contentType: 'text', content: '' } },
  { type: FieldType.SYSTEM_ATTRIBUTE, label: 'System Attribute', description: 'Read-only mapped system field', icon: 'pi pi-database', category: 'Special', phase: 2, defaultConfig: { type: FieldType.SYSTEM_ATTRIBUTE, attributeKey: '' } },
];

/** Quick lookup by FieldType */
export const FIELD_TYPE_MAP = new Map<FieldType, FieldTypeRegistryEntry>(
  FIELD_TYPE_REGISTRY.map((entry) => [entry.type, entry])
);

/** All entries shown in the palette (both phases) */
export const ALL_PALETTE_FIELDS = FIELD_TYPE_REGISTRY;

/** Ordered palette categories */
export const PALETTE_CATEGORIES: FieldCategory[] = [
  'Basic',
  'Date & Time',
  'Choice',
  'Rating & Scale',
  'Media',
  'Special',
];

/** Phase 1 only (kept for backward compat) */
export const PHASE1_FIELDS = FIELD_TYPE_REGISTRY.filter((e) => e.phase === 1);
export const PHASE1_CATEGORIES: FieldCategory[] = [
  ...new Set(PHASE1_FIELDS.map((e) => e.category)),
] as FieldCategory[];
