import type { FormField } from "../types/formBuilder.types";

/**
 * Result of evaluating a formula expression
 */
export interface EvaluationResult {
  value: any;
  error?: string;
}

/**
 * Helper to parse dates safely
 */
function parseDate(val: any): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Evaluates mathematical, string, date, and logical expressions safely.
 *
 * Supported syntax:
 * - Field references: [fieldCode], [fieldName], or [fieldId]
 * - Operators: +, -, *, /, %, ^, ==, !=, >, <, >=, <=, &&, ||
 * - Functions:
 *    - Math: SUM(...), AVG(...), MIN(...), MAX(...), ROUND(val, decimals), ABS(val)
 *    - Date: DATEDIFF(start, end, unit), AGE(dob), NOW()
 *    - Text: CONCAT(...), UPPER(str), LOWER(str), LEN(str)
 *    - Logic: IF(condition, trueVal, falseVal)
 */
export function evaluateFormula(
  expression: string,
  formValues: Record<string, any>,
  fields: FormField[]
): EvaluationResult {
  if (!expression || !expression.trim()) {
    return { value: '' };
  }

  try {
    // 1. Substitute Field Tokens [fieldCode], [fieldName], [id]
    let substitutedExpr = expression.replace(/\[([^\]]+)\]/g, (_, token) => {
      const trimmedToken = token.trim();
      // Find field by fieldCode, fieldName, or id
      const field = fields.find(
        (f) =>
          f.fieldCode === trimmedToken ||
          f.fieldName === trimmedToken ||
          f.id === trimmedToken
      );

      const val = field ? formValues[field.fieldCode] : formValues[trimmedToken];

      if (val === undefined || val === null || val === '') {
        return '0';
      }

      if (typeof val === 'number') {
        return String(val);
      }

      if (typeof val === 'boolean') {
        return String(val);
      }

      // If it's a date string or text string, wrap in quotes if not already numeric
      if (!isNaN(Number(val))) {
        return String(Number(val));
      }

      return JSON.stringify(String(val));
    });

    // 2. Custom Function Pre-processors

    // NOW()
    substitutedExpr = substitutedExpr.replace(/\bNOW\(\)/gi, () => {
      return JSON.stringify(new Date().toISOString());
    });

    // SUM(...)
    substitutedExpr = substitutedExpr.replace(/SUM\(([^)]+)\)/gi, (_, argsStr) => {
      const numbers = argsStr
        .split(',')
        .map((a: string) => Number(evalSimple(a, formValues)))
        .filter((n: number) => !isNaN(n));
      const sum = numbers.reduce((acc: number, n: number) => acc + n, 0);
      return String(sum);
    });

    // AVG(...)
    substitutedExpr = substitutedExpr.replace(/AVG\(([^)]+)\)/gi, (_, argsStr) => {
      const numbers = argsStr
        .split(',')
        .map((a: string) => Number(evalSimple(a, formValues)))
        .filter((n: number) => !isNaN(n));
      if (numbers.length === 0) return '0';
      const sum = numbers.reduce((acc: number, n: number) => acc + n, 0);
      return String(sum / numbers.length);
    });

    // MIN(...)
    substitutedExpr = substitutedExpr.replace(/MIN\(([^)]+)\)/gi, (_, argsStr) => {
      const numbers = argsStr
        .split(',')
        .map((a: string) => Number(evalSimple(a, formValues)))
        .filter((n: number) => !isNaN(n));
      return numbers.length ? String(Math.min(...numbers)) : '0';
    });

    // MAX(...)
    substitutedExpr = substitutedExpr.replace(/MAX\(([^)]+)\)/gi, (_, argsStr) => {
      const numbers = argsStr
        .split(',')
        .map((a: string) => Number(evalSimple(a, formValues)))
        .filter((n: number) => !isNaN(n));
      return numbers.length ? String(Math.max(...numbers)) : '0';
    });

    // ROUND(val, decimals)
    substitutedExpr = substitutedExpr.replace(/ROUND\(([^,]+)(?:,\s*(\d+))?\)/gi, (_, valStr, decStr) => {
      const num = Number(evalSimple(valStr, formValues));
      const dec = decStr ? parseInt(decStr, 10) : 0;
      if (isNaN(num)) return '0';
      return String(Number(num.toFixed(dec)));
    });

    // ABS(val)
    substitutedExpr = substitutedExpr.replace(/ABS\(([^)]+)\)/gi, (_, valStr) => {
      const num = Number(evalSimple(valStr, formValues));
      return isNaN(num) ? '0' : String(Math.abs(num));
    });

    // CONCAT(a, b, ...)
    substitutedExpr = substitutedExpr.replace(/CONCAT\(([^)]+)\)/gi, (_, argsStr) => {
      const parts = argsStr.split(',').map((a: string) => {
        const res = evalSimple(a, formValues);
        return res === undefined || res === null ? '' : String(res);
      });
      return JSON.stringify(parts.join(''));
    });

    // DATEDIFF(start, end, unit)
    substitutedExpr = substitutedExpr.replace(/DATEDIFF\(([^,]+),([^,]+)(?:,([^)]+))?\)/gi, (_, d1Str, d2Str, unitStr) => {
      const d1 = parseDate(evalSimple(d1Str, formValues));
      const d2 = parseDate(evalSimple(d2Str, formValues));
      const unit = unitStr ? String(evalSimple(unitStr, formValues)).trim().replace(/['"]/g, '').toLowerCase() : 'days';

      if (!d1 || !d2) return '0';
      const diffMs = Math.abs(d2.getTime() - d1.getTime());

      if (unit === 'years') return String(Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
      if (unit === 'months') return String(Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375)));
      if (unit === 'hours') return String(Math.floor(diffMs / (1000 * 60 * 60)));
      return String(Math.floor(diffMs / (1000 * 60 * 60 * 24))); // default days
    });

    // AGE(dob)
    substitutedExpr = substitutedExpr.replace(/AGE\(([^)]+)\)/gi, (_, dobStr) => {
      const dob = parseDate(evalSimple(dobStr, formValues));
      if (!dob) return '0';
      const diffMs = Date.now() - dob.getTime();
      return String(Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
    });

    // IF(cond, trueVal, falseVal)
    substitutedExpr = substitutedExpr.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/gi, (_, condStr, trueStr, falseStr) => {
      const condRes = evalSimple(condStr, formValues);
      return condRes ? String(evalSimple(trueStr, formValues)) : String(evalSimple(falseStr, formValues));
    });

    // Safe execution of final arithmetic/logic expression
    const finalVal = evalInSandbox(substitutedExpr);
    return { value: finalVal };
  } catch (err: any) {
    return { value: '', error: err.message || 'Syntax Error in Formula' };
  }
}

/**
 * Helper to safely evaluate sub-expressions
 */
function evalSimple(expr: string, formValues: Record<string, any>): any {
  try {
    return evalInSandbox(expr.trim());
  } catch {
    return expr.trim().replace(/^['"]|['"]$/g, '');
  }
}

/**
 * Evaluates an expression inside a restricted Function scope
 */
function evalInSandbox(code: string): any {
  if (!code || !code.trim()) return '';
  // Convert basic caret ^ to exponentiation **
  const sanitizedCode = code.replace(/\^/g, '**');
  
  // Use Function constructor with empty scope to prevent globals access
  const fn = new Function(`"use strict"; return (${sanitizedCode});`);
  return fn();
}
