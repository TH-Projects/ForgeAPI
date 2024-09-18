from CompilerFrontend.Lexer.lexer import TokenDefinition

PARSER_VERSION = 1.0

class Parser:
    def __init__(self, tokens):
        """
        Initializes the Parser with a list of tokens.

        - Parameters:
          tokens: list - A list of tokens to be parsed.
        """
        self.tokens = tokens
        self.current_token_index = 0  # Index of the current token being processed
        self.current_token = self.tokens[self.current_token_index]  # The current token

    def _advance(self):
        """
        Moves to the next token in the list of tokens.
        Updates the current token to the next one in the sequence.
        """

        self.current_token_index += 1  # Move to the next token index
        if self.current_token_index < len(self.tokens):
            self.current_token = self.tokens[self.current_token_index]  # Update the current token
        else:
            self.current_token = None  # End of input reached

    def _expect(self, *expected_tokens):
        """
        Checks if the current token matches one of the expected tokens.
        If it matches, returns the token's value and advances to the next token.
        If it does not match, raises a SyntaxError.

        - Parameters:
        expected_tokens: One or more tokens to expect (can be passed as multiple arguments).

        - Returns:
        The value of the current token if it matches, otherwise raises a SyntaxError.
        """
        current_token = self.current_token[0]  # Get the type of the current token

        # Check if the current token matches any of the expected tokens
        if current_token in expected_tokens:
            token_value = self.current_token[1]  # Get the value of the token
            self._advance()  # Move to the next token
            return token_value
        else:
            # Raise a SyntaxError with information about the expected and actual tokens
            expected_names = ', '.join([repr(token) for token in expected_tokens])
            raise SyntaxError(f"Expected one of {expected_names}, but found {repr(self.current_token[1])}")


    def parse(self):
        """
        The main parsing function that starts the parsing process based on the grammar.
        
        - Returns:
          The result of parsing the input as a database definition.
        """
        return self._parse_database()

    # Parsing functions for each grammar rule

    def _parse_database(self):
        """
        Parses a database definition.

        - Returns:
          A dictionary representing the database definition.
        """
        self._expect(TokenDefinition.DATABASE)  # Expect 'DATABASE'
        dbname = self._expect(TokenDefinition.IDENTIFIER)  # Expect database name
        self._expect(TokenDefinition.LBRACE)  # Expect '{'

        tables = []  # List to hold table definitions
        while self.current_token[0] == TokenDefinition.TABLE:
            tables.append(self._parse_table())  # Parse tables and add to the list

        rest_block = None
        if self.current_token[0] == TokenDefinition.REST:
            rest_block = self._parse_rest_block()  # Parse REST block if present

        self._expect(TokenDefinition.RBRACE)  # Expect '}'
        return {
            "type": "database",
            "name": dbname,
            "tables": tables,
            "rest_block": rest_block
        }

    def _parse_table(self):
        """
        Parses a table definition.

        - Returns:
          A dictionary representing the table definition.
        """
        self._expect(TokenDefinition.TABLE)  # Expect 'TABLE'
        tablename = self._expect(TokenDefinition.IDENTIFIER)  # Expect table name
        self._expect(TokenDefinition.LBRACE)  # Expect '{'

        columns = []  # List to hold column definitions
        while self.current_token[0] == TokenDefinition.COLUMN:
            columns.append(self._parse_column())  # Parse columns and add to the list
            if self.current_token[0] == TokenDefinition.COMMA:
                self._advance()  # Consume the comma

        foreign_keys = []  # List to hold foreign key definitions
        while self.current_token[0] == TokenDefinition.FK:
            foreign_keys.append(self._parse_foreign_key())  # Parse foreign keys and add to the list
            if self.current_token[0] == TokenDefinition.COMMA:
                self._advance()  # Consume the comma

        self._expect(TokenDefinition.RBRACE)  # Expect '}'
        return {
            "type": "table",
            "name": tablename,
            "columns": columns,
            "foreign_keys": foreign_keys
        }

    def _parse_column(self):
        """
        Parses a column definition.

        - Returns:
          A dictionary representing the column definition.
        """
        self._expect(TokenDefinition.COLUMN)  # Expect 'COLUMN'
        columnname = self._expect(TokenDefinition.IDENTIFIER)  # Expect column name
        datatype = self._parse_datatype()  # Parse datatype (e.g., string(100) or integer)

        # Initialize optional attributes
        primary_key = False
        not_null = False

        # Check for optional attributes like PK, FK, and NOT NULL
        while self.current_token[0] in (TokenDefinition.PK, TokenDefinition.FK, TokenDefinition.NOT_NULL):
            if self.current_token[0] == TokenDefinition.PK:
                primary_key = True
                self._advance()  # Consume 'PK'
            elif self.current_token[0] == TokenDefinition.NOT_NULL:
                not_null = True
                self._advance()  # Consume 'NOT NULL'
        return {
            "type": "column",
            "name": columnname,
            "datatype": datatype,
            "primary_key": primary_key,
            "not_null": not_null
        }

    def _parse_datatype(self):
        """
        Parses the datatype of a column, including possible size for string types.

        - Returns:
        A string representing the datatype of the column.
        """

        # Check if there is a current token available for parsing
        if not self.current_token:
            raise SyntaxError("No current token available for parsing.")

        datatype_token = self.current_token[0]  # Get the type of the current token

        # Check if the datatype is valid
        if datatype_token in (TokenDefinition.STRING, TokenDefinition.INTEGER, TokenDefinition.FLOAT,
                            TokenDefinition.BOOLEAN, TokenDefinition.DATE, TokenDefinition.TIMESTAMP,
                            TokenDefinition.AUTO_ID):  # Include AUTO_ID here

            # Consume the datatype token and get its value
            datatype_value = self._expect(datatype_token)  # This should get the value of the datatype token

            # Check if it's a datatype that requires parentheses, like string(100)
            if datatype_token == TokenDefinition.STRING and self.current_token and self.current_token[0] == TokenDefinition.LPAREN:
                self._expect(TokenDefinition.LPAREN)  # Expect '('
                size = self._expect(TokenDefinition.NUMBER)  # Expect a number inside the parentheses
                self._expect(TokenDefinition.RPAREN)  # Expect ')'
                datatype = f"{datatype_value}({size})"  # Format datatype with size
            else:
                datatype = datatype_value

            return datatype
        else:
            raise SyntaxError(f"Expected a valid datatype, but found {self.current_token[1]}")

    def _parse_foreign_key(self):
        """
        Parses a foreign key definition.

        - Returns:
          A dictionary representing the foreign key definition.
        """
        self._expect(TokenDefinition.FK)  # Expect 'FK'
        self._expect(TokenDefinition.LPAREN)  # Expect '('
        referenced_table = self._expect(TokenDefinition.IDENTIFIER)  # Expect referenced table
        self._expect(TokenDefinition.DOT)  # Expect '.'
        referenced_column = self._expect(TokenDefinition.IDENTIFIER)  # Expect referenced column
        self._expect(TokenDefinition.RPAREN)  # Expect ')'
        return {
            "type": "foreign_key",
            "table": referenced_table,
            "column": referenced_column
        }

    def _parse_rest_block(self):
        """
        Parses a REST definition.

        - Returns:
          A dictionary representing the REST block definition.
        """
        self._expect(TokenDefinition.REST)  # Expect 'REST'
        self._expect(TokenDefinition.LBRACE)  # Expect '{'

        rest_endpoints = []  # List to hold REST endpoints
        
        # Loop through the REST endpoints until hitting the closing brace
        while self.current_token[0] != TokenDefinition.RBRACE:
            rest_endpoints.append(self._parse_rest_endpoint())  # Parse REST endpoints and add to the list
            
            # Check if there's a comma after the current endpoint and consume it
            if self.current_token[0] == TokenDefinition.COMMA:
                self._advance()  # Consume the comma
            
        self._expect(TokenDefinition.RBRACE)  # Expect '}'
        return {
            "type": "rest",
            "endpoints": rest_endpoints
        }

    def _parse_rest_endpoint(self):
        """
        Parses a single REST endpoint definition, including HTTP method and URL.

        - Returns:
        A dictionary representing a single REST endpoint.
        """
        method = self._expect(TokenDefinition.GET, TokenDefinition.POST, TokenDefinition.PUT, TokenDefinition.DELETE)  # HTTP method
        url = self._expect(TokenDefinition.URL)  # URL path
        
        # Optionally, handle URL parameters (e.g., /employees?first_name&last_name)
        query_params = []
        if self.current_token[0] == TokenDefinition.QUESTION_MARK:
            self._advance()  # Consume '?'
            query_params.append(self._expect(TokenDefinition.IDENTIFIER))  # Expect first query parameter

            # Consume additional parameters, separated by '&'
            while self.current_token[0] == TokenDefinition.AMPERSAND:
                self._advance()  # Consume '&'
                query_params.append(self._expect(TokenDefinition.IDENTIFIER))  # Expect next query parameter

        return {
            "type": "endpoint",
            "method": method,
            "url": url,
            "query_params": query_params
        }

    def _parse_parameters(self):
        """
        Parses a list of parameters in a REST endpoint.

        - Returns:
          A list of tuples representing parameters (name, value).
        """
        parameters = []
        while self.current_token[0] == TokenDefinition.IDENTIFIER:
            param_name = self._expect(TokenDefinition.IDENTIFIER)  # Parameter name
            self._expect(TokenDefinition.EQUALS)  # Expect '='
            param_value = self._expect(TokenDefinition.IDENTIFIER)  # Parameter value
            parameters.append((param_name, param_value))  # Add the parameter to the list
        return parameters
