// Add these interfaces to your generated AST types or create custom extensions

export interface SingleValueUnit {
    conditionalExpression: ConditionalExpression;
}

export interface ConditionalExpression {
    logicalOrExpression: LogicalOrExpression;
    thenExpression?: ConditionalExpression;  
    elseExpression?: ConditionalExpression;
}

export interface LogicalOrExpression {
    left: LogicalAndExpression;
    operations: { operator: '||', right: LogicalAndExpression }[];
}

export interface LogicalAndExpression {
    left: EqualityExpression;
    operations: { operator: '&&', right: EqualityExpression }[];
}

export interface EqualityExpression {
    left: RelationalExpression;
    operations: { operator: '==' | '!=', right: RelationalExpression }[];
}

export interface RelationalExpression {
    left: AdditiveExpression;
    operations: { operator: '<' | '>' | '<=' | '>=', right: AdditiveExpression }[];
}

export interface AdditiveExpression {
    left: MultiplicativeExpression;
    operations: { operator: '+' | '-', right: MultiplicativeExpression }[];
}

export interface MultiplicativeExpression {
    left: UnaryExpression;
    operations: { operator: '*' | '/' | '%', right: UnaryExpression }[];
}

export interface UnaryExpression {
    operator?: '!' | '-' | '+';
    expression: AtomicExpression;
}

export interface AtomicExpression {
    parenthesizedExpression?: ConditionalExpression;
    value?: string | number | boolean;
}