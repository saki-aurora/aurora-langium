import { AuroraServices } from './aurora-module';
import { 
    ConditionalExpression, LogicalOrExpression, LogicalAndExpression, 
    EqualityExpression, RelationalExpression, AdditiveExpression, 
    MultiplicativeExpression, UnaryExpression, AtomicExpression
} from './generated/ast';

export function registerGrammarActions(services: AuroraServices) {
    const actionsRegistry = services.parser.GrammarActions;
    
    // Register your actions for each expression type
    actionsRegistry.register(ConditionalExpression, {
        create: (args) => {
            const { logicalOrExpression, thenExpression, elseExpression } = args;
            return {
                logicalOrExpression,
                ...(thenExpression && { thenExpression }),
                ...(elseExpression && { elseExpression })
            };
        }
    });
    
    actionsRegistry.register(LogicalOrExpression, {
        create: (args) => {
            const { left, right, op } = args;
            const operations = right ? [{ operator: op, right }] : [];
            return { left, operations };
        },
        add: (target, property, value) => {
            if (property === 'right' && value) {
                const { op, right } = value;
                if (!target.operations) {
                    target.operations = [];
                }
                target.operations.push({ operator: op, right });
            }
        }
    });
    
    // Similar actions for other expression types...
    
    actionsRegistry.register(UnaryExpression, {
        create: (args) => {
            const { op, expression } = args;
            return {
                ...(op && { operator: op }),
                expression
            };
        }
    });
    
    actionsRegistry.register(AtomicExpression, {
        create: (args) => {
            const { value, conditionalExpression } = args;
            return {
                ...(value !== undefined && { value }),
                ...(conditionalExpression && { parenthesizedExpression: conditionalExpression })
            };
        }
    });
}