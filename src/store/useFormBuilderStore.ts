import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { FIELD_TYPE_MAP } from '../constants/fieldTypeRegistry';
import type { FieldType, FormField, FormDefinition, BranchingRule, BranchingCondition } from '../types/formBuilder.types';

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();

const defaultFieldForType = (type: FieldType, order: number): FormField => {
  const entry = FIELD_TYPE_MAP.get(type);
  const label = entry?.label ?? type;
  const code = `${type.toLowerCase()}_${Date.now()}`;
  return {
    id: uuidv4(),
    fieldCode: code,
    fieldName: label,
    fieldType: type,
    isMandatory: false,
    helpText: '',
    placeholder: '',
    defaultValue: '',
    displayOrder: order,
    isActive: true,
    config: entry?.defaultConfig ?? ({ type } as any),
  };
};

// ─────────────────────────────────────────────────────────────
//  Store Shape
// ─────────────────────────────────────────────────────────────

interface FormBuilderState {
  formDefinition: FormDefinition;
  selectedFieldId: string | null;
  showBranchingPanel: boolean;

  // Form metadata
  setFormName: (name: string) => void;
  setFormDescription: (desc: string) => void;

  // Field CRUD
  addField: (type: FieldType) => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  updateField: (id: string, patch: Partial<Omit<FormField, 'id' | 'fieldType'>>) => void;
  updateFieldConfig: (id: string, config: FormField['config']) => void;

  // Reorder
  reorderFields: (fromIndex: number, toIndex: number) => void;

  // Selection
  selectField: (id: string | null) => void;

  // Branching Rules CRUD
  toggleBranchingPanel: () => void;
  addBranchingRule: () => void;
  updateBranchingRule: (id: string, patch: Partial<BranchingRule>) => void;
  removeBranchingRule: (id: string) => void;
  addBranchingCondition: (ruleId: string) => void;
  updateBranchingCondition: (ruleId: string, condIndex: number, patch: Partial<BranchingCondition>) => void;
  removeBranchingCondition: (ruleId: string, condIndex: number) => void;
  toggleBranchingTargetField: (ruleId: string, fieldId: string) => void;

  // Accessors
  getSelectedField: () => FormField | null;
  getFormDefinitionJson: () => string;

  // Reset
  resetForm: () => void;
}

// ─────────────────────────────────────────────────────────────
//  Initial State
// ─────────────────────────────────────────────────────────────

const makeInitialDefinition = (): FormDefinition => ({
  formId: uuidv4(),
  formName: 'Untitled Form',
  formDescription: '',
  version: 1,
  createdAt: now(),
  updatedAt: now(),
  fields: [],
  sections: [],
  branchingRules: [],
});

// ─────────────────────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────────────────────

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  formDefinition: makeInitialDefinition(),
  selectedFieldId: null,
  showBranchingPanel: false,

  // ── Metadata ────────────────────────────────────────────────
  setFormName: (name) =>
    set((s) => ({ formDefinition: { ...s.formDefinition, formName: name, updatedAt: now() } })),

  setFormDescription: (desc) =>
    set((s) => ({ formDefinition: { ...s.formDefinition, formDescription: desc, updatedAt: now() } })),

  // ── Field CRUD ──────────────────────────────────────────────
  addField: (type) => {
    const { formDefinition } = get();
    const newField = defaultFieldForType(type, formDefinition.fields.length);
    set((s) => ({
      formDefinition: { ...s.formDefinition, fields: [...s.formDefinition.fields, newField], updatedAt: now() },
      selectedFieldId: newField.id,
      showBranchingPanel: false,
    }));
  },

  removeField: (id) =>
    set((s) => {
      const fields = s.formDefinition.fields
        .filter((f) => f.id !== id)
        .map((f, i) => ({ ...f, displayOrder: i }));
      // Also remove this field from any branching rule targets
      const branchingRules = (s.formDefinition.branchingRules ?? []).map((rule) => ({
        ...rule,
        targetFieldIds: rule.targetFieldIds.filter((fid) => fid !== id),
        conditions: rule.conditions.filter((c) => c.fieldId !== id),
      }));
      return {
        formDefinition: { ...s.formDefinition, fields, branchingRules, updatedAt: now() },
        selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
      };
    }),

  duplicateField: (id) => {
    const { formDefinition } = get();
    const original = formDefinition.fields.find((f) => f.id === id);
    if (!original) return;
    const duplicate: FormField = {
      ...original,
      id: uuidv4(),
      fieldCode: `${original.fieldCode}_copy`,
      fieldName: `${original.fieldName} (Copy)`,
      displayOrder: formDefinition.fields.length,
    };
    set((s) => ({
      formDefinition: { ...s.formDefinition, fields: [...s.formDefinition.fields, duplicate], updatedAt: now() },
      selectedFieldId: duplicate.id,
    }));
  },

  updateField: (id, patch) =>
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        fields: s.formDefinition.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        updatedAt: now(),
      },
    })),

  updateFieldConfig: (id, config) =>
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        fields: s.formDefinition.fields.map((f) => (f.id === id ? { ...f, config } : f)),
        updatedAt: now(),
      },
    })),

  // ── Reorder ─────────────────────────────────────────────────
  reorderFields: (fromIndex, toIndex) =>
    set((s) => {
      const fields = [...s.formDefinition.fields];
      const [moved] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, moved);
      return {
        formDefinition: {
          ...s.formDefinition,
          fields: fields.map((f, i) => ({ ...f, displayOrder: i })),
          updatedAt: now(),
        },
      };
    }),

  // ── Selection ────────────────────────────────────────────────
  selectField: (id) => set({ selectedFieldId: id, showBranchingPanel: false }),

  // ── Branching Panel ──────────────────────────────────────────
  toggleBranchingPanel: () =>
    set((s) => ({ showBranchingPanel: !s.showBranchingPanel, selectedFieldId: null })),

  // ── Branching CRUD ───────────────────────────────────────────
  addBranchingRule: () => {
    const newRule: BranchingRule = {
      id: uuidv4(),
      conditions: [{ fieldId: '', operator: 'equals', value: '' }],
      conditionLogic: 'AND',
      action: 'show',
      targetFieldIds: [],
    };
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        branchingRules: [...(s.formDefinition.branchingRules ?? []), newRule],
        updatedAt: now(),
      },
    }));
  },

  updateBranchingRule: (id, patch) =>
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        branchingRules: (s.formDefinition.branchingRules ?? []).map((r) =>
          r.id === id ? { ...r, ...patch } : r
        ),
        updatedAt: now(),
      },
    })),

  removeBranchingRule: (id) =>
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        branchingRules: (s.formDefinition.branchingRules ?? []).filter((r) => r.id !== id),
        updatedAt: now(),
      },
    })),

  addBranchingCondition: (ruleId) =>
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        branchingRules: (s.formDefinition.branchingRules ?? []).map((r) =>
          r.id === ruleId
            ? { ...r, conditions: [...r.conditions, { fieldId: '', operator: 'equals' as const, value: '' }] }
            : r
        ),
        updatedAt: now(),
      },
    })),

  updateBranchingCondition: (ruleId, condIndex, patch) =>
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        branchingRules: (s.formDefinition.branchingRules ?? []).map((r) =>
          r.id === ruleId
            ? {
                ...r,
                conditions: r.conditions.map((c, i) => (i === condIndex ? { ...c, ...patch } : c)),
              }
            : r
        ),
        updatedAt: now(),
      },
    })),

  removeBranchingCondition: (ruleId, condIndex) =>
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        branchingRules: (s.formDefinition.branchingRules ?? []).map((r) =>
          r.id === ruleId
            ? { ...r, conditions: r.conditions.filter((_, i) => i !== condIndex) }
            : r
        ),
        updatedAt: now(),
      },
    })),

  toggleBranchingTargetField: (ruleId, fieldId) =>
    set((s) => ({
      formDefinition: {
        ...s.formDefinition,
        branchingRules: (s.formDefinition.branchingRules ?? []).map((r) => {
          if (r.id !== ruleId) return r;
          const has = r.targetFieldIds.includes(fieldId);
          return {
            ...r,
            targetFieldIds: has
              ? r.targetFieldIds.filter((id) => id !== fieldId)
              : [...r.targetFieldIds, fieldId],
          };
        }),
        updatedAt: now(),
      },
    })),

  // ── Accessors ────────────────────────────────────────────────
  getSelectedField: () => {
    const { formDefinition, selectedFieldId } = get();
    return formDefinition.fields.find((f) => f.id === selectedFieldId) ?? null;
  },
  getFormDefinitionJson: () => JSON.stringify(get().formDefinition, null, 2),

  // ── Reset ────────────────────────────────────────────────────
  resetForm: () =>
    set({ formDefinition: makeInitialDefinition(), selectedFieldId: null, showBranchingPanel: false }),
}));
