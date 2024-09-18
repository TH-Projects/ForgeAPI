import copy
import sys
from CompilerFrontend.Lexer.lexer import Lexer
from CompilerFrontend.Parser.parser import Parser
from CompilerFrontend.Parser.print_tree import PrintTree
from CompilerBackend.sql_code_generator import SQLCodeGenerator


def check_arguments():
    """
    Check command line arguments for the source file
    """
    if len(sys.argv) != 2:
        sys.exit("Error: Compiler needs source file as argument.")
    file_path = sys.argv[1]
    if not file_path.endswith('.forgeapi'):
        sys.exit("Error: The source file must have a .forgeapi extension.")
    return file_path

def read_source_file(file_path):
    """
    Read the source code from the file
    """
    try:
        with open(file_path, 'r') as inputFile:
            return inputFile.read()
    except FileNotFoundError:
        sys.exit(f"Error: File {file_path} not found.")

def initialize_lexer(source):
    """
    Initialize the lexer and tokenize the source code
    """
    lexer = Lexer(source)
    return lexer.tokenize()

def parse_tokens(tokens):
    """
    Initialize the parser with tokens and parse them
    """
    parser = Parser(tokens)
    try:
        return parser.parse()  # Parse the tokens to create the parse tree
    except SyntaxError as e:
        sys.exit(f"Syntax error during parsing: {e}")

def extract_endpoint_data(parse_tree):
    """
    Extract the endpoint data from the parse tree
    """
    return parse_tree.get('rest_block', {})

def process_database_schema(parse_tree):
    """
    Create and return a deep copy of the parse tree with endpoint data removed
    """
    database_schema = copy.deepcopy(parse_tree)
    if 'rest_block' in database_schema:
        del database_schema['rest_block']
    return database_schema

def generate_sql_code(database_schema):
    """
    Generate SQL code from the database schema
    """
    sql_generator = SQLCodeGenerator(database_schema)
    return sql_generator.generate()

def write_sql_to_file(sql_code, output_file_path):
    """
    Write the generated SQL code to a file, overwriting it if it exists
    """
    try:
        # Write the SQL code to the file
        print(f"Writing SQL code to {output_file_path}")
        with open(output_file_path, 'w') as outputFile:
            outputFile.write(sql_code)
        print(f"SQL code successfully written to {output_file_path}")
    except IOError as e:
        sys.exit(f"Error writing to file: {e}")

def main():
    print("ForgeAPI Compiler")
    
    file_path = check_arguments()
    source = read_source_file(file_path)
    tokens = initialize_lexer(source)
    parse_tree = parse_tokens(tokens)
    
    # Extract endpoint data
    endpoint_data = extract_endpoint_data(parse_tree)
    # print(endpoint_data)

    # Extract database schema
    database_schema = process_database_schema(parse_tree)
    #print(database_schema)

    # Generate SQL code
    sql_code = generate_sql_code(database_schema)
        
    # Write SQL code to file
    output_file_path = "./DB/schema.sql"
    write_sql_to_file(sql_code, output_file_path)
    
    # Print the formatted parse tree
    printed_tree = PrintTree(parse_tree)
    #print(printed_tree)

if __name__ == "__main__":
    main()
