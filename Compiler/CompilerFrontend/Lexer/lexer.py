from .token_definition import TokenDefinition
import re

class Lexer:
    def __init__(self, input_text):
        self.input_text = input_text
        self.position = 0  # Current position in the input_text
        self.tokens = []  # List of found tokens

    def _get_next_substring(self):
        """
        Returns the next token and the matched substring from the input_text.
        """
        if self.position >= len(self.input_text):
            return None, None
        
        for token in TokenDefinition:
            pattern = re.compile(token.value)
            match = pattern.match(self.input_text, self.position)
            if match:
                token_value = match.group(0)
                self.position = match.end()
                
                # If the matched token is a comment, skip it
                if token == TokenDefinition.COMMENT:
                    return self._get_next_substring()
                
                return token, token_value
        
        # If no token matches, move one character forward and mark it as an unknown token
        current_char = self.input_text[self.position]
        self.position += 1
        return None, current_char

    def tokenize(self):
        """
        Tokenize the input string into a list of (TokenDefinition, value) tuples.
        """
        while self.position < len(self.input_text):
            token, substring = self._get_next_substring()

            if token:
                # Skip over whitespaces and newlines
                if token not in (TokenDefinition.WS, TokenDefinition.NEWLINE):
                    self.tokens.append((token, substring))
            elif substring:  # Handle unknown tokens
                raise ValueError(f"Unknown token at position {self.position}: '{substring}'")

        return self.tokens
