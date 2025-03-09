import { ValidationAcceptor, ValidationChecks } from 'langium';
import { AuroraAstType, ConditionalExpression } from './generated/ast';
import { AuroraServices } from './aurora-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AuroraServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AuroraValidator;
    const checks: ValidationChecks<AuroraAstType> = {
        SingleValueUnit: validator.checkSingleValueUnit,
        // Add more validation checks for other expression types
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class AuroraValidator {
    
    checkSingleValueUnit(value: SingleValueUnit, accept: ValidationAcceptor): void {
        // Add validation for SingleValueUnit expressions
        if (!value.conditionalExpression) {
            accept('error', 'SingleValueUnit must contain a conditional expression', { node: value });
        }
    }
    
    checkDivisionByZero(expr: MultiplicativeExpression, accept: ValidationAcceptor): void {
        // Try to validate division by zero at compile time when possible
        for (const op of expr.operations) {
            if (op.operator === '/' || op.operator === '%') {
                const rightValue = op.right;
                if (rightValue.left && rightValue.left.expression.value === 0) {
                    accept('error', `Division by zero is not allowed`, { node: op });
                }
            }
        }
    }
    
    // Add more validation methods as needed
}