import { ValidationAcceptor, ValidationChecks } from 'langium';
import { AuroraAstType, ConditionalExpression } from './generated/ast';
import { AuroraServices } from './aurora-module';

export function registerValidationChecks(services: AuroraServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AuroraValidator;
    const checks: ValidationChecks<AuroraAstType> = {
        SingleValueUnit: validator.checkSingleValueUnit,
    };
    registry.register(checks, validator);
}

export class AuroraValidator {
    
    checkSingleValueUnit(value: SingleValueUnit, accept: ValidationAcceptor): void {
        if (!value.conditionalExpression) {
            accept('error', 'SingleValueUnit must contain a conditional expression', { node: value });
        }
    }
    
    checkDivisionByZero(expr: MultiplicativeExpression, accept: ValidationAcceptor): void {
        for (const op of expr.operations) {
            if (op.operator === '/' || op.operator === '%') {
                const rightValue = op.right;
                if (rightValue.left && rightValue.left.expression.value === 0) {
                    accept('error', `Division by zero is not allowed`, { node: op });
                }
            }
        }
    }
}
