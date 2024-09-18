import sys
from CompilerFrontend.Lexer.lexer import Lexer
from CompilerFrontend.Parser.parser import Parser
from CompilerFrontend.Parser.print_tree import PrintTree

def main():
    print("ForgeAPI Compiler")

    # Check if the source file is provided as argument
    if len(sys.argv) != 2:
        sys.exit("Error: Compiler needs source file as argument.")

    # Check if the source file has the correct file extension
    file_path = sys.argv[1]
    if not file_path.endswith('.forgeapi'):
        sys.exit("Error: The source file must have a .forgeapi extension.")

    # Read the source code from the file
    try:
        with open(file_path, 'r') as inputFile:
            source = inputFile.read()
    except FileNotFoundError:
        sys.exit(f"Error: File {file_path} not found.")
    
    # Initialise lexer and tokenize the source code
    lexer = Lexer(source)
    tokens = lexer.tokenize()

    # Output the tokenized source code
    #print("\nTokenized output:")
    #for token in tokens:
    #    print(token)

    # Initialise parser with the tokens and parse them
    parser = Parser(tokens)

    try:
        parse_tree = parser.parse()  # Parse the tokens to create the parse tree
        print("\nParse tree:")
        printed_tree = PrintTree(parse_tree)
        print(printed_tree)
    except SyntaxError as e:
        sys.exit(f"Syntax error during parsing: {e}")

if __name__ == "__main__":
    main()
