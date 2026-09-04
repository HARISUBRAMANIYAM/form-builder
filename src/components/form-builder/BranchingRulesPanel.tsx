import React from 'react';
import { Form } from 'react-bootstrap';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import type { BranchingRule } from '../../types/formBuilder.types';
import { useShallow } from 'zustand/shallow';

const OPERATORS = [
  { label: 'equals', value: 'equals' },
  { label: 'not equals', value: 'not_equals' },
  { label: 'contains', value: 'contains' },
  { label: 'greater than', value: 'greater_than' },
  { label: 'less than', value: 'less_than' },
];

const BranchingRulesPanel: React.FC = () => {
  const {
    formDefinition,
    addBranchingRule,
    updateBranchingRule,
    removeBranchingRule,
    addBranchingCondition,
    updateBranchingCondition,
    removeBranchingCondition,
    toggleBranchingTargetField,
  } = useFormBuilderStore(useShallow((s) => ({
    formDefinition: s.formDefinition,
    addBranchingRule: s.addBranchingRule,
    updateBranchingRule: s.updateBranchingRule,
    removeBranchingRule: s.removeBranchingRule,
    addBranchingCondition: s.addBranchingCondition,
    updateBranchingCondition: s.updateBranchingCondition,
    removeBranchingCondition: s.removeBranchingCondition,
    toggleBranchingTargetField: s.toggleBranchingTargetField,
  })));

  const { fields, branchingRules = [] } = formDefinition;
  const inputFields = fields.filter((f) => f.isActive);

  if (inputFields.length < 2) {
    return (
      <aside className="fb-properties">
        <div className="fb-panel-header">
          <h6><i className="pi pi-code-branch me-1" /> Branching Rules</h6>
        </div>
        <div className="fb-properties__empty">
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--fb-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--fb-text-muted)' }}>
            <i className="pi pi-code-branch" />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fb-text-secondary)' }}>Add more fields first</div>
          <div style={{ fontSize: '0.775rem', color: 'var(--fb-text-muted)', lineHeight: 1.5 }}>
            You need at least 2 active fields<br />to create branching rules.
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fb-properties">
      {/* Header */}
      <div className="fb-panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h6 style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fb-text-muted)' }}>
          <i className="pi pi-code-branch me-1" /> Branching Rules
        </h6>
        <button className="fb-action-btn fb-action-btn-primary" style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={addBranchingRule}>
          <i className="pi pi-plus" /> Add Rule
        </button>
      </div>

      <div className="fb-properties__scroll">
        {branchingRules.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--fb-text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            <i className="pi pi-code-branch" style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />
            No rules yet.<br />Click <strong>+ Add Rule</strong> to create<br />your first branching condition.
          </div>
        )}

        {branchingRules.map((rule: BranchingRule, ruleIdx: number) => (
          <div
            key={rule.id}
            style={{
              background: 'var(--fb-surface-2)',
              border: '1.5px solid var(--fb-border-light)',
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
            }}
          >
            {/* Rule header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--fb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rule {ruleIdx + 1}
              </span>
              <button className="fb-icon-btn danger" onClick={() => removeBranchingRule(rule.id)} title="Delete rule">
                <i className="pi pi-trash" style={{ fontSize: 11 }} />
              </button>
            </div>

            {/* IF section */}
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--fb-primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              IF
            </div>

            {rule.conditions.map((cond, condIdx) => (
              <div key={condIdx} style={{ marginBottom: 6 }}>
                {condIdx > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--fb-border)' }} />
                    <Form.Select
                      size="sm"
                      style={{ width: 'auto', fontSize: '0.72rem', padding: '2px 6px' }}
                      value={rule.conditionLogic}
                      onChange={(e) => updateBranchingRule(rule.id, { conditionLogic: e.target.value as 'AND' | 'OR' })}
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </Form.Select>
                    <div style={{ flex: 1, height: 1, background: 'var(--fb-border)' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Form.Select
                      size="sm"
                      style={{ fontSize: '0.75rem' }}
                      value={cond.fieldId}
                      onChange={(e) => updateBranchingCondition(rule.id, condIdx, { fieldId: e.target.value })}
                    >
                      <option value="">— Source Field —</option>
                      {inputFields.map((f) => (
                        <option key={f.id} value={f.id}>{f.fieldName}</option>
                      ))}
                    </Form.Select>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Form.Select
                        size="sm"
                        style={{ fontSize: '0.75rem', flex: 1 }}
                        value={cond.operator}
                        onChange={(e) => updateBranchingCondition(rule.id, condIdx, { operator: e.target.value as any })}
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </Form.Select>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Value"
                        value={cond.value}
                        style={{ fontSize: '0.75rem', flex: 1 }}
                        onChange={(e) => updateBranchingCondition(rule.id, condIdx, { value: e.target.value })}
                      />
                    </div>
                  </div>
                  {rule.conditions.length > 1 && (
                    <button
                      className="fb-icon-btn danger"
                      style={{ marginTop: 2, flexShrink: 0 }}
                      onClick={() => removeBranchingCondition(rule.id, condIdx)}
                    >
                      <i className="pi pi-times" style={{ fontSize: 10 }} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="fb-add-option-btn"
              style={{ marginTop: 4, marginBottom: 10 }}
              onClick={() => addBranchingCondition(rule.id)}
            >
              <i className="pi pi-plus" style={{ fontSize: 10 }} /> Add Condition
            </button>

            {/* THEN section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--fb-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>THEN</span>
              <Form.Select
                size="sm"
                style={{ width: 'auto', fontSize: '0.75rem' }}
                value={rule.action}
                onChange={(e) => updateBranchingRule(rule.id, { action: e.target.value as 'show' | 'hide' })}
              >
                <option value="show">Show</option>
                <option value="hide">Hide</option>
              </Form.Select>
              <span style={{ fontSize: '0.72rem', color: 'var(--fb-text-muted)' }}>these fields:</span>
            </div>

            {/* Target field checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {inputFields
                .filter((f) => !rule.conditions.some((c) => c.fieldId === f.id))
                .map((f) => (
                  <label
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      padding: '3px 6px',
                      borderRadius: 5,
                      background: rule.targetFieldIds.includes(f.id) ? 'var(--fb-primary-ghost)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rule.targetFieldIds.includes(f.id)}
                      onChange={() => toggleBranchingTargetField(rule.id, f.id)}
                      style={{ accentColor: 'var(--fb-primary)', flexShrink: 0 }}
                    />
                    <span style={{
                      fontSize: '0.775rem',
                      color: rule.targetFieldIds.includes(f.id) ? 'var(--fb-primary)' : 'var(--fb-text-secondary)',
                      fontWeight: rule.targetFieldIds.includes(f.id) ? 600 : 400,
                    }}>
                      {f.fieldName}
                    </span>
                  </label>
                ))}
            </div>

            {rule.targetFieldIds.length === 0 && (
              <div style={{ fontSize: '0.7rem', color: 'var(--fb-warning)', marginTop: 4 }}>
                <i className="pi pi-exclamation-triangle me-1" />
                Select at least one target field
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default BranchingRulesPanel;
