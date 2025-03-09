import { Injectable } from '@nestjs/common';
import { SingleValueUnit, ConditionalExpression, LogicalOrExpression, LogicalAndExpression, 
         EqualityExpression, RelationalExpression, AdditiveExpression, 
         MultiplicativeExpression, UnaryExpression, AtomicExpression } from './generated/ast';

@Injectable()
export class ExpressionEvaluator {
    
    // Main evaluation entry point
    evaluateSingleValueUnit(expression: SingleValueUnit): any {
        if (expression.conditionalExpression) {
            return this.evaluateConditionalExpression(expression.conditionalExpression);
        }
        return null;
    }

    evaluateConditionalExpression(expression: ConditionalExpression): any {
        const condition = this.evaluateLogicalOrExpression(expression.logicalOrExpression);
        
        if (expression.thenExpression && expression.elseExpression) {
            return condition ? 
                this.evaluateConditionalExpression(expression.thenExpression) : 
                this.evaluateConditionalExpression(expression.elseExpression);
        }
        
        return condition;
    }

    evaluateLogicalOrExpression(expression: LogicalOrExpression): boolean {
        let result = this.evaluateLogicalAndExpression(expression.left);
        
        for (const operationPair of expression.operations) {
            const rightValue = this.evaluateLogicalAndExpression(operationPair.right);
            if (operationPair.operator === '||') {
                result = result || rightValue;
            }
        }
        
        return result;
    }

    evaluateLogicalAndExpression(expression: LogicalAndExpression): boolean {
        let result = this.evaluateEqualityExpression(expression.left);
        
        for (const operationPair of expression.operations) {
            const rightValue = this.evaluateEqualityExpression(operationPair.right);
            if (operationPair.operator === '&&') {
                result = result && rightValue;
            }
        }
        
        return result;
    }

    evaluateEqualityExpression(expression: EqualityExpression): boolean {
        let result = this.evaluateRelationalExpression(expression.left);
        
        for (const operationPair of expression.operations) {
            const rightValue = this.evaluateRelationalExpression(operationPair.right);
            if (operationPair.operator === '==') {
                result = result === rightValue;
            } else if (operationPair.operator === '!=') {
                result = result !== rightValue;
            }
        }
        
        return result;
    }

    evaluateRelationalExpression(expression: RelationalExpression): boolean {
        let result = this.evaluateAdditiveExpression(expression.left);
        
        for (const operationPair of expression.operations) {
            const rightValue = this.evaluateAdditiveExpression(operationPair.right);
            switch (operationPair.operator) {
                case '<':
                    result = result < rightValue;
                    break;
                case '>':
                    result = result > rightValue;
                    break;
                case '<=':
                    result = result <= rightValue;
                    break;
                case '>=':
                    result = result >= rightValue;
                    break;
            }
        }
        
        return result;
    }

    evaluateAdditiveExpression(expression: AdditiveExpression): number {
        let result = this.evaluateMultiplicativeExpression(expression.left);
        
        for (const operationPair of expression.operations) {
            const rightValue = this.evaluateMultiplicativeExpression(operationPair.right);
            if (operationPair.operator === '+') {
                result = result + rightValue;
            } else if (operationPair.operator === '-') {
                result = result - rightValue;
            }
        }
        
        return result;
    }

    evaluateMultiplicativeExpression(expression: MultiplicativeExpression): number {
        let result = this.evaluateUnaryExpression(expression.left);
        
        for (const operationPair of expression.operations) {
            const rightValue = this.evaluateUnaryExpression(operationPair.right);
            switch (operationPair.operator) {
                case '*':
                    result = result * rightValue;
                    break;
                case '/':
                    if (rightValue === 0) {
                        throw new Error('Division by zero');
                    }
                    result = result / rightValue;
                    break;
                case '%':
                    if (rightValue === 0) {
                        throw new Error('Modulo by zero');
                    }
                    result = result % rightValue;
                    break;
            }
        }
        
        return result;
    }

    evaluateUnaryExpression(expression: UnaryExpression): number | boolean {
        const value = this.evaluateAtomicExpression(expression.expression);
        
        if (expression.operator) {
            switch (expression.operator) {
                case '-': return -value;
                case '+': return +value;
                case '!': return !value;
                default: return value;
            }
        }
        
        return value;
    }

    evaluateAtomicExpression(expression: AtomicExpression): any {
        if (expression.parenthesizedExpression) {
            return this.evaluateConditionalExpression(expression.parenthesizedExpression);
        }
        
        if (expression.value !== undefined) {
            const value = expression.value;
            
            // Handle different value types
            if (typeof value === 'number') {
                return value;
            } else if (value === 'y') {
                return true;
            } else if (value === 'n') {
                return false;
            } else if (typeof value === 'string') {
                // Try to parse number if possible
                const num = parseFloat(value);
                if (!isNaN(num) && /^\d+(\.\d+)?$/.test(value)) {
                    return num;
                }
                
                // Handle fractions
                if (value.includes('/')) {
                    const [numerator, denominator] = value.split('/').map(n => parseInt(n.trim()));
                    if (denominator === 0) {
                        throw new Error('Division by zero in fraction');
                    }
                    return numerator / denominator;
                }
                
                // Return as string for other cases
                return value;
            }
        }
        
        return null;
    }
}