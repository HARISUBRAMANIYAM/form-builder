import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { ErrorMessage, Field, useFormikContext } from 'formik';

const NumberFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  return (
    <>
      <Row className="mb-2">
        <Col xs={6}>
          <Form.Group controlId="config.min">
            <Form.Label>Min Value</Form.Label>
            <Field name="config.min" type="number" placeholder="e.g. 0" className="form-control" />
            <ErrorMessage name="config.min" component="div" className="invalid-feedback d-block" />
          </Form.Group>
        </Col>
        <Col xs={6}>
          <Form.Group controlId="config.max">
            <Form.Label>Max Value</Form.Label>
            <Field name="config.max" type="number" placeholder="e.g. 9999" className="form-control" />
            <ErrorMessage name="config.max" component="div" className="invalid-feedback d-block" />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.precision">
            <Form.Label>Max Digits (Precision)</Form.Label>
            <Field name="config.precision" type="number" placeholder="e.g. 10" className="form-control" />
            <ErrorMessage name="config.precision" component="div" className="invalid-feedback d-block" />
          </Form.Group>
        </Col>
      </Row>
      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Allow Decimals</div>
          <div className="fb-toggle-desc">Permits decimal point values</div>
        </div>
        <Form.Check
          type="switch"
          id="config.allowDecimal"
          checked={values.config?.allowDecimal ?? false}
          onChange={(e) => setFieldValue('config.allowDecimal', e.target.checked)}
        />
      </div>
    </>
  );
};

export default NumberFieldConfig;
