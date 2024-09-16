import enum

class TokenDefinition(enum.Enum):
    """
    Enum class to define token types and their regex patterns for the forgeapi grammar.
    """

    DATABASE = r'DATABASE\b'
    TABLE = r'TABLE\b'
    COLUMN = r'COLUMN\b'
    AUTO_ID = r'auto_id\b'
    STRING = r'string\(\d+\)'
    INTEGER = r'integer\b'
    FLOAT = r'float\b'
    BOOLEAN = r'boolean\b'
    DATE = r'date\b'
    TIMESTAMP = r'timestamp\b'
    PK = r'PK\b'
    FK = r'FK\b'
    REST = r'REST\b'
    GET = r'get\b'
    POST = r'post\b'
    PUT = r'put\b'
    DELETE = r'delete\b'
    NOT_NULL = r'not null\b'
    LBRACE = r'\{'
    RBRACE = r'\}'
    LPAREN = r'\('
    RPAREN = r'\)'
    EQUALS = r'='
    URL = r'/[a-zA-Z_][a-zA-Z_0-9]*'
    IDENTIFIER = r'[a-zA-Z_][a-zA-Z_0-9]*'
    NUMBER = r'\d+'
    COMMA = r','
    DOT = r'\.'  
    SLASH = r'/'
    QUESTION_MARK = r'\?'
    WS = r'\s+'  # Whitespace Token
    NEWLINE = r'\n'

    def __repr__(self):
        return f"<TokenDefinition.{self.name}>"
