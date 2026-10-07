# Enterprise Dynamic Form Builder — Full Specification & Feature Documentation

> **Project Version:** 3.0.0 (Phase 1, Phase 2, & Phase 3 Formula Engine Completed)  
> **Tech Stack:** React 18, Vite, TypeScript, Formik, Yup, PrimeReact v10.9.6, Bootstrap 5, dnd-kit, Zustand

---

## 📋 Table of Contents
1. [Project Overview & Architectural Vision](#1-project-overview--architectural-vision)
2. [Supported Field Types Matrix (24 Types)](#2-supported-field-types-matrix-24-types)
3. [Implemented Core Features & Functional Requirements](#3-implemented-core-features--functional-requirements)
   - [Phase 1: Foundation & Basic Widgets](#phase-1-foundation--basic-widgets)
   - [Phase 2: Advanced Widgets & Conditional Branching](#phase-2-advanced-widgets--conditional-branching)
   - [Phase 3: Formula & Calculation Engine](#phase-3-formula--calculation-engine)
4. [Technical Architecture & State Management](#4-technical-architecture--state-management)
5. [System Data Model Schemas](#5-system-data-model-schemas)
6. [Comprehensive Future Improvements & Enhancement Roadmap](#6-comprehensive-future-improvements--enhancement-roadmap)
7. [Installation, Setup & Deployment Guide](#7-installation-setup--deployment-guide)

---

## 1. Project Overview & Architectural Vision

The **Enterprise Dynamic Form Builder** is a modern, Darwinbox-inspired visual form builder web application designed for HR, enterprise operations, onboarding, and workflow data collection.

It allows non-technical administrators to visually drag-and-drop form fields, configure complex validations, establish dynamic conditional branching rules (show/hide logic), write dynamic formulas for automatic value calculations, and test the form in a live interactive runtime renderer.

### Key Architectural Pillars
- **Zero-Code Builder UX:** Drag-and-drop field creation using `@dnd-kit`.
- **Dynamic Runtime Rendering:** Automatic Formik state and Yup validation schema generation based purely on JSON metadata definitions.
- **Reactive Branching Engine:** Live evaluation of field visibilities based on user input.
- **Built-in Formula Engine:** Real-time arithmetic, date math, text concatenation, and logical calculations without backend reliance.
- **Enterprise Dark/Glassmorphic Aesthetic:** Customized UI theme with high visual polish.

---

## 2. Supported Field Types Matrix (24 Types)

The builder supports 24 distinct field widget types organized into 6 functional categories:

| Category | Widget Type | Code | Description & Configurable Options |
| :--- | :--- | :--- | :--- |
| **Basic** | Textbox | `TEXT` | Single-line text input (MaxLength, Regex, Placeholder) |
| | Text Area | `TEXTAREA` | Multi-line text input (Rows, MaxLength) |
| | Number | `NUMBER` | Numeric input (Min, Max, Decimal switch, Precision) |
| | Email | `EMAIL` | RFC-5322 email input with automatic regex validation |
| | Phone | `PHONE` | International phone input with pattern matching |
| | Boolean Switch | `BOOLEAN` | Yes/No toggle switch |
| **Date & Time** | Date | `DATE` | Date picker (Min/Max date, Quick default: Today) |
| | Date & Time | `DATETIME` | Date and time picker (Quick default: Now) |
| | Time | `TIME` | Standalone time picker |
| **Choice** | Single Choice | `SINGLE_CHOICE` | Radio button group (Vertical/Horizontal layout, Dynamic options) |
| | Multiple Choice | `MULTIPLE_CHOICE` | Checkbox list (Min/Max selection limit) |
| | Single Dropdown | `SINGLE_DROPDOWN` | Select dropdown (Filterable search option) |
| | Multiple Dropdown | `MULTIPLE_DROPDOWN` | Multi-select tag dropdown |
| **Rating & Scale** | Star Rating | `RATING` | Interactive 5-star or custom star rating bar |
| | Linear Scale | `SCALE_SINGLE` | Slider scale (1-10 with custom min/max labels) |
| | Rank Order | `RANK_ORDER` | Drag-and-drop rank ordering list |
| | Matrix Radio Grid | `SCALE_MULTI_GRID` | Table grid with radio buttons per row |
| | Matrix Checkbox Grid | `SCALE_CHECKBOX_GRID` | Table grid with multi-checkboxes per row |
| **Media & File** | File Attachment | `ATTACHMENT` | File uploader (Allowed extensions, Max file size MB) |
| | Picture Upload | `PICTURE` | Single/multiple image uploader with thumbnail previews |
| | Signature Pad | `SIGNATURE` | HTML5 Canvas touch & mouse digital signature pad |
| **Special & System** | Currency Input | `CURRENCY` | Amount input with multi-currency dropdown selector |
| | Consent Agreement | `CONSENT` | Mandatory checkbox with custom legal terms |
| | System Attribute | `SYSTEM_ATTRIBUTE` | Auto-filled HR/System attributes (Emp ID, Dept, Manager) |
| | User Defined Block | `USER_DEFINED` | Static HTML/Image content block for instructions |

---

## 3. Implemented Core Features & Functional Requirements

### Phase 1: Foundation & Basic Widgets
- ✅ **Categorized Field Palette:** Left sidebar displaying draggable field widgets grouped by category.
- ✅ **Interactive Drag & Drop Canvas:** Central drop area using `@dnd-kit` supporting drag-to-add and drag-to-reorder.
- ✅ **Properties Editor Panel:** Formik-driven right properties panel for live updates of Field Name, Field Code, Placeholder, Help Text, Default Values, and Mandatory status.
- ✅ **Formik & Yup Runtime Generator:** Converts form JSON definition into a live form with full client-side validation.
- ✅ **JSON Import/Export View:** Raw JSON metadata view with 1-click clipboard export.

### Phase 2: Advanced Widgets & Conditional Branching
- ✅ **11 Advanced Field Types:** Signature Pad, Rank Order, Matrix Grids, Star Rating, Currency, Consent, System Attributes, Picture/Attachment uploaders.
- ✅ **Dynamic Branching Engine (`BranchingRulesPanel.tsx`):**
  - Add conditional rules: *IF Field X [Equals/Not Equals/Contains/Greater Than/Less Than] Value*.
  - Multi-condition evaluation (`AND` / `OR` logic).
  - Target actions: `Show` or `Hide` target fields dynamically during form filling.

### Phase 3: Formula & Calculation Engine
- ✅ **Formula Builder UI (`FormulaEditor.tsx`):** Dedicated properties builder block to mark fields as calculated.
- ✅ **Interactive Field Token Insertion:** Select any canvas field to insert `[field_code]` into the expression.
- ✅ **Built-in Functions & Operator Presets:**
  - Math: `SUM(...)`, `AVG(...)`, `MIN(...)`, `MAX(...)`, `ROUND(val, decimals)`, `ABS(val)`
  - Date: `DATEDIFF(start, end, unit)`, `AGE(dob)`, `NOW()`
  - String: `CONCAT(...)`, `UPPER(str)`, `LOWER(str)`, `LEN(str)`
  - Logic: `IF(condition, trueValue, falseValue)`
- ✅ **Live Evaluator & Syntax Validator:** Real-time test evaluation preview showing sample execution output.
- ✅ **Formik Live Execution Loop (`FormikFormulaRunner`):** Synchronizes calculations directly with Formik form values in real-time.
- ✅ **Canvas Visual Indicator:** Highlights calculated fields with a yellow `⚡ Formula` badge on the canvas.

---

## 4. Technical Architecture & State Management

```
                      ┌─────────────────────────────────────────┐
                      │          FormBuilderPage (Nav)          │
                      └────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
┌────────▼─────────┐             ┌─────────▼────────┐             ┌──────────▼─────────┐
│   FieldPalette   │             │   FormCanvas     │             │  PropertiesPanel   │
│ (dnd-kit Source) │             │ (dnd-kit Target) │             │  + FormulaEditor   │
└──────────────────┘             └─────────┬────────┘             └────────────────────┘
                                           │
                                           │ (Selects Field)
                                           ▼
                                 ┌──────────────────┐
                                 │ Zustand Store    │
                                 │ (useFormBuilder) │
                                 └─────────┬────────┘
                                           │
                                           │ (Reads FormDefinition JSON)
                                           ▼
                                 ┌──────────────────┐
                                 │   FormRenderer   │
                                 ├──────────────────┤
                                 │ - Yup Schema Gen │
                                 │ - Branch Engine  │
                                 │ - Formula Runner │
                                 └──────────────────┘
```

---

## 5. System Data Model Schemas

### Form Field Data Model (`src/types/formBuilder.types.ts`)

```typescript
export interface FormulaConfig {
  isCalculated: boolean;
  expression: string; // e.g. "[qty_field] * [price_field]"
  returnType?: 'number' | 'string' | 'date' | 'boolean';
  precision?: number;
  readOnlyCalculated?: boolean;
}

export interface FormField {
  id: string;                    // UUID v4
  fieldCode: string;             // Unique Formik key (e.g. "total_amount")
  fieldName: string;             // User-facing label (e.g. "Total Amount")
  fieldType: FieldType;          // Enum (TEXT, NUMBER, CURRENCY, etc.)
  isMandatory: boolean;
  helpText?: string;
  placeholder?: string;
  defaultValue?: string;
  displayOrder: number;
  isActive: boolean;
  formulaConfig?: FormulaConfig; // Phase 3 Formula Engine
  config: FieldConfig;           // Type-specific configuration union
}
```

### Branching Rule Model

```typescript
export interface BranchingCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface BranchingRule {
  id: string;
  conditions: BranchingCondition[];
  conditionLogic: 'AND' | 'OR';
  action: 'show' | 'hide';
  targetFieldIds: string[];
}
```

---

## 6. Comprehensive Future Improvements & Enhancement Roadmap

The following enhancements are categorized by functional domain to guide future development iterations:

### 🚀 Category A: Multi-Step & Form Architecture
1. **Multi-Page / Wizard Form Navigation:**
   - Divide long forms into sequential pages/steps with a progress bar.
   - Step-level Formik validation (prevent advancing to step 2 if step 1 has validation errors).
   - Page-level branching logic (*Jump to Page X if Question Y == "Yes"*).
2. **Form Sections & Grouping Containers:**
   - Group related fields into collapsible section cards with custom headers and sub-descriptions.
3. **Form Schema Import & Versioning System:**
   - JSON Schema Importer: Reverse parser allowing users to upload a saved JSON schema file to re-populate the builder canvas.
   - Schema Revision History & Version Tagging (`v1.0`, `v1.1`, `v2.0`).
   - Visual Schema Diff Tool showing added, deleted, or modified fields between versions.

### 🧮 Category B: Advanced Logic & Validation Enhancements
4. **Cross-Field Validation Rules:**
   - Custom cross-field validation rules (e.g., `End Date MUST BE > Start Date` or `Min Salary <= Max Salary`).
5. **Dynamic Lookup & External API Integration:**
   - Pre-fill fields from REST API endpoints (e.g., fetch employee details via `GET /api/employee/{id}`).
   - Dynamic Dropdown Data Sources (fetch choice options asynchronously from external backend API).
6. **Action Webhooks & Submit Destinations:**
   - Custom submission webhooks (`POST` payload to configured HTTP endpoints with custom headers).

### 🎨 Category C: UI, Themes & Experience
7. **Theme Customization Engine:**
   - Custom brand palette picker (Primary color, background theme, dark/light mode toggle).
   - Typography selector (Inter, Roboto, Outfit, Poppins).
   - Form card styles (Glassmorphism, Flat, Elevated Shadow, Outlined).
8. **Pre-built Template Library:**
   - 1-click loading of preset industry templates (*Leave Request*, *Employee Onboarding*, *360 Performance Appraisal*, *Exit Interview*, *Expense Requisition*).
9. **Rich Text / WYSIWYG Content Blocks:**
   - Integrate Quill/Lexical editor for `USER_DEFINED` static blocks (rich HTML tables, formatted policy disclosures, media embeds).

### 📊 Category D: Enterprise Submissions & Analytics
10. **Form Submissions Viewer & Response Table:**
    - Tabular data grid displaying collected form submissions with column sorting, filtering, and detail modal.
    - Export submissions to CSV, Excel, or JSON format.
11. **Form Health & Drop-off Analytics:**
    - Visual metrics: Field completion rates, average completion time, most skipped optional fields.

### 🌐 Category E: Accessibility & Internationalization
12. **Accessibility (a11y) Compliance:**
    - Full ARIA accessibility tags (`aria-describedby`, `aria-invalid`, `aria-required`) and keyboard-only navigation support across all 24 widgets.
13. **Localization (i18n):**
    - Multi-language field label translations and localized validation error messages.

---

## 7. Installation, Setup & Deployment Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **Package Manager**: `npm` v9.x or `yarn` / `pnpm`

### Local Development Setup
```bash
# 1. Clone or navigate to project workspace
cd "c:/Users/RVL-LT- 021/OneDrive - Revantha Services Ltd/Desktop/Form-Builder/form-builder"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run TypeScript type validation
npx tsc --noEmit
```

### Production Build
```bash
# Generate optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

*Form Builder System Documentation — Maintained by Antigravity AI*
