grammar Aurora

entry ArithmeticExpression:
    expr=ConditionalExpression
;

SingleValueUnit:
    '{' ConditionalExpression '}';

ConditionalExpression:
    LogicalOrExpression ('?' ConditionalExpression ':' ConditionalExpression)?;

LogicalOrExpression:
    LogicalAndExpression (op='||' right=LogicalAndExpression)*;

LogicalAndExpression:
    EqualityExpression (op='&&' right=EqualityExpression)*;

EqualityExpression:
    RelationalExpression (op=('==' | '!=') right=RelationalExpression)*;

RelationalExpression:
    AdditiveExpression (op=('<' | '>' | '<=' | '>=') right=AdditiveExpression)*;

AdditiveExpression:
    MultiplicativeExpression (op=('+' | '-') right=MultiplicativeExpression)*;

MultiplicativeExpression:
    UnaryExpression (op=('*' | '/' | '%') right=UnaryExpression)*;

UnaryExpression:
    (op=('!' | '-' | '+'))? AtomicExpression;

AtomicExpression:
    '(' ConditionalExpression ')'  
    | value=(ID | INT | Float | Fraction | Boolean | StringLiteral);


// Added String Literal
StringLiteral returns string:
     '"' /[^"]*/ '"';

Fraction returns string: INT '/' INT;
Boolean returns string: 'y' | 'n' ;
Float returns string: INT '.' INT ;


terminal INT: /[0-9]+/;
terminal ID: /[a-zA-Z0-9_]+/;