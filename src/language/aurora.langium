grammar Aurora

entry PCM:
    package=PACKAGE ?
    imports+=Import *
    module=MODULE ?
    template=TEMPLATE ?
    elements+=(Issues |  Orders | Clinical)*
;

/* Package and Import */
PACKAGE:'package' name=QualifiedName  ';';
Import: 'import' importedNamespace=QualifiedNameWithWildcard  ';';
QualifiedNameWithWildcard returns string: QualifiedName '.*'?;
QualifiedName returns string: ID ('.' ID )*;
NL_STATEMENT:
    name=( NL_STATEMENTMULTI | SINGLENL  );
Clinical:
'Clinical:'
narrative+=NL_STATEMENT*
namedGroups+=NamedGroupClinical*;

NamedGroupClinical:
    name=ID_WITH_COLON
    timestamp=TimeStamp ?
    ('('refs+=[ReferenceCoordinate:ID] (',' refs+=[ReferenceCoordinate:ID])* ')')?
    narrative+=NL_STATEMENT *
    coord+=(ClinicalCoordinate | ClinicalValue  )*
;

ClinicalCoordinate:
    qu+=QU *
    timestamp=TimeStamp ?
    name=ID
    ('('refs+=[ReferenceCoordinate:ID] (',' refs+=[ReferenceCoordinate:ID])* ')')?
    narrative+=NL_STATEMENT *
;

ClinicalValue:
    qu+=QU *
    timestamp=TimeStamp ?
    name=ID
    '['
    values+=SingleValueUnit
    (',' values+=SingleValueUnit  )*
    ']'
    ('('refs+=[ReferenceCoordinate:ID] (',' refs+=[ReferenceCoordinate:ID])* ')')?
    narrative+=NL_STATEMENT *
;

/* Value Unit */
// SingleValueUnit :
//     negative='(-)' ?
//     value=(ID | INT | Float | Fraction | Boolean  )
//     unit=(ID | INT | Float | Fraction | Boolean | '_'  )
// ;



// Enhanced Arithmetic and Conditional Expressions
SingleValueUnit:
    '{' ConditionalExpression '}';  

// New Conditional Expression
ConditionalExpression:
    LogicalOrExpression
    ('?' ConditionalExpression ':' ConditionalExpression)?;

// Logical OR Expression
LogicalOrExpression:
    LogicalAndExpression
    (op='||' right=LogicalAndExpression)*;

// Logical AND Expression
LogicalAndExpression:
    EqualityExpression
    (op='&&' right=EqualityExpression)*;

// Equality Expression (==, !=)
EqualityExpression:
    RelationalExpression
    (op=('==' | '!=') right=RelationalExpression)*;

// Relational Expression (<, >, <=, >=)
RelationalExpression:
    AdditiveExpression
    (op=('<' | '>' | '<=' | '>=') right=AdditiveExpression)*;

// Additive Expression (existing, slightly modified)
AdditiveExpression:
    MultiplicativeExpression
    (op=('+' | '-') right=MultiplicativeExpression)*;

// Multiplicative Expression (existing, slightly modified)
MultiplicativeExpression:
    UnaryExpression
    (op=('*' | '/' | '%') right=UnaryExpression)*;

// Unary Expression (added support for unary operators)
UnaryExpression:
    (op=('!' | '-' | '+'))? AtomicExpression;

// Atomic Expression (enhanced)
AtomicExpression:
    '(' ConditionalExpression ')'  
    | value=(
        ID 
        | INT 
        | Float 
        | Fraction 
        | Boolean
        | StringLiteral
    );

// Added String Literal
StringLiteral returns string:
    '"' /[^"]*/ '"';

Fraction returns string: INT '/' INT;
Boolean returns string: 'y' | 'n' ;
Float returns string: INT '.' INT ;

TimeStamp:
    '@' ((empty="time" ) | (date=AuroraDate  | time=Time  )| (date=AuroraDate  time=Time  ) )
;

Issues:
'Issues:'
narrative+=NL_STATEMENT*
coord+=IssueCoordinate*;

IssueCoordinate:
    comment+= ML_COMMENT*
    qu += QU*
    name=ID
    ('('refs+=[ReferenceCoordinate:ID] (',' refs+=[ReferenceCoordinate:ID])* ')')?
    (':' snomed=Snomed)?
    ('from' mods+=[MODULE:ID] (',' mods+=[MODULE:ID])*
            ('with' temps+=[TEMPLATE: ID] (',' temps+=[TEMPLATE:ID])*)? )?
    narrative+=NL_STATEMENT*
;

ReferenceCoordinate: (IssueCoordinate | OrderCoordinate | ClinicalCoordinate);

Orders:
'Orders:'
narrative+=NL_STATEMENT*
(namedGroups+=NamedGroupOrder)*;

NamedGroupOrder:
    comment+= ML_COMMENT*
    qu += QU*
    name=ID_WITH_COLON
    ('('refs+=[ReferenceCoordinate:ID] (',' refs+=[ReferenceCoordinate:ID])* ')')?
    narrative+=NL_STATEMENT *
    (orders+=(OrderCoordinate | MutuallyExclusive))*;

OrderCoordinate:
    comment+= ML_COMMENT*
    qu += QU*
    name=ID
    ('('refs+=[ReferenceCoordinate:ID] (',' refs+=[ReferenceCoordinate:ID])* ')')?
    narrative+= NL_STATEMENT* ;

MutuallyExclusive:
    comment+= ML_COMMENT*
    order1=OrderCoordinate 'or' order2=OrderCoordinate;

/* Template and Module */
TEMPLATE: "template" name=ID  elements+=(Clinical |  Orders)*;
MODULE:   "module:"  name=ID  elements+=(Issues |  Orders)*;

AuroraDate returns string:INT '/' INT '/' INT  | INT | INT '/' INT;
Time returns string: INT ':' INT ;
QU: query=QUTERMINAL;

Snomed:name=ID;

terminal PREFIXSINGLE : ('-') ('?' | '!' | '.' | 'x' )? ;
terminal PREFIXMULTI :('--' | '??' | '!!' | '..' | 'xx' );


terminal NL_STATEMENTMULTI returns string: PREFIXMULTI  -> ';'  ;
terminal ID_WITH_COLON: /[a-zA-Z0-9_]+:/;
terminal ID: /[a-zA-Z0-9_]+/;
terminal SINGLENL returns string: /-(\??|\.\?|!|x)?([^\n]*)/;
terminal INT: /[0-9]+/;
terminal ML_COMMENT returns string:'/*'  -> '*/'  ;
terminal SL_COMMENT returns string:'//'  !('\n' | '\r' )('\r'? '\n' )?  ;
hidden terminal WS: /\s+/;
terminal QUTERMINAL returns string:('?' | '!' | '*' | '~' );