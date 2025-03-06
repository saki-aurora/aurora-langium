import { LangiumDocument } from 'langium';
import { 
    Module, 
    Statement, 
    Expression, 
    Definition, 
    Reference
} from '../language/generated/ast.js';
import { isDefinition, isNumberLiteral, isBooleanLiteral, isPlusOrMinus, isMultiOrDiv, isReference, isComparison, isConditionalExpression } from '../language/generated/ast.js';

// Type for the evaluation context
type EvaluationContext = {
    values: Record<string, EvaluationResult>;
};

// Type for evaluation results that can be either number or boolean
type EvaluationResult = number | boolean;

/**
 * Main evaluation function for the Aurora language
 * Evaluates an entire document and returns the values of all definitions
 */
export function evaluate(document: LangiumDocument): Record<string, EvaluationResult> {
    const context: EvaluationContext = { values: {} };
    const module = document.parseResult.value as Module;
    
    // Evaluate all statements in the module
    for (const stmt of module.statements) {
        evaluateStatement(stmt, context);
    }
    
    return context.values;
}

/**
 * Evaluates a single statement
 */
function evaluateStatement(stmt: Statement, context: EvaluationContext): void {
    if (isDefinition(stmt)) {
        // For definitions, evaluate the expression and store it with the name
        context.values[stmt.name] = evaluateExpression(stmt.expr, context);
    }
    // Other statement types can be handled here if needed
}

/**
 * Evaluates any expression and returns its value
 */
function evaluateExpression(expr: Expression, context: EvaluationContext): EvaluationResult {
    // Number literals
    if (isNumberLiteral(expr)) {
        return expr.value;
    } 
    // Boolean literals
    else if (isBooleanLiteral(expr)) {
        return expr.value === 'true';
    }
    // Addition or subtraction
    else if (isPlusOrMinus(expr)) {
        const left = evaluateExpression(expr.left, context) as number;
        const right = evaluateExpression(expr.right, context) as number;
        
        if (expr.operator === '+') {
            return left + right;
        } else {
            return left - right;
        }
    } 
    // Multiplication or division
    else if (isMultiOrDiv(expr)) {
        const left = evaluateExpression(expr.left, context) as number;
        const right = evaluateExpression(expr.right, context) as number;
        
        if (expr.operator === '*') {
            return left * right;
        } else {
            if (right === 0) {
                throw new Error('Division by zero');
            }
            return left / right;
        }
    } 
    // Variable references
    else if (isReference(expr)) {
        const refName = getReferenceName(expr);
        if (refName && refName in context.values) {
            return context.values[refName];
        }
        throw new Error(`Reference to undefined variable: ${refName}`);
    }
    // Comparison operators
    else if (isComparison(expr)) {
        const left = evaluateExpression(expr.left, context) as number;
        const right = evaluateExpression(expr.right, context) as number;
        
        switch (expr.operator) {
            case '==': return left === right;
            case '!=': return left !== right;
            case '<': return left < right;
            case '<=': return left <= right;
            case '>': return left > right;
            case '>=': return left >= right;
            default:
                throw new Error(`Unknown comparison operator: ${expr.operator}`);
        }
    }
    // Conditional expressions (ternary)
    else if (isConditionalExpression(expr)) {
        const condition = evaluateExpression(expr.condition, context) as boolean;
        if (condition) {
            return evaluateExpression(expr.thenExpr, context);
        } else {
            return evaluateExpression(expr.elseExpr, context);
        }
    }
    
    // Default case for unhandled expression types
    throw new Error(`Unhandled expression type: ${expr.$type}`);
}

/**
 * Helper function to get the name from a reference
 */
function getReferenceName(ref: Reference): string | undefined {
    if (ref.ref && isDefinition(ref.ref)) {
        return ref.ref.name;
    }
    return undefined;
}