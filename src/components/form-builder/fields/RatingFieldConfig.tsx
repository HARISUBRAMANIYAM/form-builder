import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';

const RatingFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const max: number = values.config?.maxRating ?? 5;

  return (
    <>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.maxRating">
            <Form.Label>Number of Stars</Form.Label>
            <Form.Select
              size="sm"
              value={max}
              onChange={(e) => setFieldValue('config.maxRating', parseInt(e.target.value))}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} stars</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Live preview */}
      <div style={{
        padding: '10px 0',
        display: 'flex',
        gap: 4,
        color: '#F59E0B',
        fontSize: 18,
      }}>
        {Array.from({ length: max }).map((_, i) => (
          <i key={i} className="pi pi-star-fill" />
        ))}
      </div>
      <small className="text-muted">Preview of star rating control</small>

      <div className="fb-divider" />
      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Allow Half Stars</div>
          <div className="fb-toggle-desc">Users can select 0.5 increments</div>
        </div>
        <Form.Check
          type="switch"
          id="config.allowHalf"
          checked={values.config?.allowHalf ?? false}
          onChange={(e) => setFieldValue('config.allowHalf', e.target.checked)}
        />
      </div>
      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Show Label</div>
          <div className="fb-toggle-desc">Display numeric value below the stars</div>
        </div>
        <Form.Check
          type="switch"
          id="config.showLabel"
          checked={values.config?.showLabel ?? true}
          onChange={(e) => setFieldValue('config.showLabel', e.target.checked)}
        />
      </div>
    </>
  );
};

export default RatingFieldConfig;
