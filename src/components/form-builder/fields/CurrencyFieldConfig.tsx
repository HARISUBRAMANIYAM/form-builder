import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD', 'AUD', 'CAD', 'CHF', 'JPY', 'CNY'];

const CurrencyFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const selectedCurrencies: string[] = values.config?.currencies ?? ['USD'];

  const toggleCurrency = (code: string) => {
    const next = selectedCurrencies.includes(code)
      ? selectedCurrencies.filter((c) => c !== code)
      : [...selectedCurrencies, code];
    if (next.length > 0) setFieldValue('config.currencies', next);
  };

  return (
    <>
      <div className="fb-properties__section-title">
        <i className="pi pi-dollar" /> Available Currencies
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {CURRENCIES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => toggleCurrency(code)}
            style={{
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: '0.72rem',
              fontWeight: 600,
              border: '1.5px solid',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              borderColor: selectedCurrencies.includes(code) ? 'var(--fb-primary)' : 'var(--fb-border)',
              background: selectedCurrencies.includes(code) ? 'var(--fb-primary-ghost)' : 'transparent',
              color: selectedCurrencies.includes(code) ? 'var(--fb-primary)' : 'var(--fb-text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {code}
          </button>
        ))}
      </div>

      {selectedCurrencies.length === 1 && (
        <div style={{ marginBottom: 10 }}>
          <small className="text-muted">
            <i className="pi pi-lock me-1" />
            Single currency selected — currency selector will be hidden on the form.
          </small>
        </div>
      )}

      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.defaultCurrency">
            <Form.Label>Default Currency</Form.Label>
            <Form.Select
              size="sm"
              value={values.config?.defaultCurrency ?? selectedCurrencies[0]}
              onChange={(e) => setFieldValue('config.defaultCurrency', e.target.value)}
            >
              {selectedCurrencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Allow Decimals</div>
          <div className="fb-toggle-desc">Permit cents / paise in input</div>
        </div>
        <Form.Check
          type="switch"
          id="config.allowDecimal"
          checked={values.config?.allowDecimal ?? true}
          onChange={(e) => setFieldValue('config.allowDecimal', e.target.checked)}
        />
      </div>
    </>
  );
};

export default CurrencyFieldConfig;
