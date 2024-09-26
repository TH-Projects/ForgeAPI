import copy
import sys
import os
import logging
from CompilerFrontend.Lexer.lexer import Lexer
from CompilerFrontend.Parser.parser import Parser
from CompilerFrontend.Parser.print_tree import PrintTree
from CompilerBackend.sql_code_generator import SQLCodeGenerator
from CompilerBackend.nodejs_endpoint_generator import NodeJSCodeGenerator
from CompilerBackend.appjs_route_generator import AppJSRouteGenerator
from CompilerBackend.env_generator import EnvGenerator

# Logging-Konfiguration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def check_arguments():
    """
    Check command line arguments for the source file
    :return: The path to the source file
    """
    if len(sys.argv) != 2:
        logging.error("Compiler needs source file as argument.")
        sys.exit(1)
    file_path = sys.argv[1]
    if not file_path.endswith('.forgeapi'):
        logging.error("The source file must have a .forgeapi extension.")
        sys.exit(1)
    return file_path

def read_source_file(file_path):
    """
    Read the source code from the file
    :param file_path: The path to the source file
    """
    try:
        with open(file_path, 'r') as inputFile:
            return inputFile.read()
    except FileNotFoundError:
        logging.error(f"File {file_path} not found.")
        sys.exit(1)

def initialize_lexer(source):
    """
    Initialize the lexer and tokenize the source code
    :param source: The source code to tokenize
    :return: The tokenized source code
    """
    lexer = Lexer(source)
    return lexer.tokenize()

def parse_tokens(tokens):
    """
    Initialize the parser with tokens and parse them
    :param tokens: The tokenized source code
    :return: The parse tree
    """
    parser = Parser(tokens)
    try:
        return parser.parse()  # Parse the tokens to create the parse tree
    except SyntaxError as e:
        logging.error(f"Syntax error during parsing: {e}")
        sys.exit(1)

def extract_endpoint_data(parse_tree):
    """
    Extract the endpoint data from the parse tree
    :param parse_tree: The parse tree
    :return: The endpoint section of the parse tree
    """
    return parse_tree.get('rest_block', {})

def process_database_schema(parse_tree):
    """
    Create and return a deep copy of the parse tree with endpoint data removed
    :param parse_tree: The parse tree
    :return: The database schema section of the parse tree
    """
    database_schema = copy.deepcopy(parse_tree)
    if 'rest_block' in database_schema:
        del database_schema['rest_block']
    return database_schema

def print_endpoint_data(endpoint_data):
    """
    Print the endpoint data and generated code for debugging
    :param endpoint_data: List of dictionaries containing endpoint data, including table name, URL, method, and generated code
    """
    for i, endpoint in enumerate(endpoint_data):
        print(f"Endpoint {i + 1}:\n")
        print("Metadata:")
        print(f"  Method: {endpoint['method']}")
        print(f"  URL: {endpoint['url']}")
        print(f"  Query-Parameters: {endpoint['query_params']}\n")
        
        print("Generated Code:\n")
        print(endpoint['generated_code'])
        print("\n" + "=" * 40 + "\n")

def get_auto_id_columns(database_schema):
    auto_id_columns = []
    for table in database_schema.get('tables', []):
        for column in table.get('columns', []):
            if column.get('datatype') == 'auto_id':
                auto_id_columns.append(column['name'])
    return auto_id_columns

def write_sql_to_file(sql_code, output_file_path):
    """
    Write the generated SQL code to a file, overwriting it if it exists
    :param sql_code: The SQL code to write
    :param output_file_path: The path to the output file
    """
    try:
        logging.info(f"Writing SQL code to {output_file_path}")
        with open(output_file_path, 'w') as outputFile:
            outputFile.write(sql_code)
        logging.info(f"SQL code successfully written to {output_file_path}")
    except IOError as e:
        logging.error(f"Error writing to file: {e}")
        sys.exit(1)

def write_endpoints_to_files(endpoint_data, endpoint_output_dir):
    """
    Writes the endpoint data to separate files organized by table names.

    :param endpoint_data: List of dictionaries containing endpoint data, including table name, URL, method, and generated code.
    :param endpoint_output_dir: The root directory where the table folders and endpoint files will be created.
    """
    # Check if the output directory exists, if not create it
    if not os.path.exists(endpoint_output_dir):
        os.makedirs(endpoint_output_dir)
    
    # Group the endpoints by table name
    endpoints_by_table = {}
    for endpoint in endpoint_data:
        table_name = endpoint['table']
        if table_name not in endpoints_by_table:
            endpoints_by_table[table_name] = []
        endpoints_by_table[table_name].append(endpoint)
    
    # Create a folder for each table and write the endpoint files
    for table_name, endpoints in endpoints_by_table.items():
        table_dir = os.path.join(endpoint_output_dir, table_name)
        if not os.path.exists(table_dir):
            os.makedirs(table_dir)
        
        # Write each endpoint to a separate file
        for endpoint in endpoints:
            file_name = endpoint['url'].strip('/').replace('/', '_') + '.js'
            file_path = os.path.join(table_dir, file_name)
            try:
                with open(file_path, 'w') as file:
                    file.write(endpoint['generated_code'])
                logging.info(f"File '{file_name}' was created in '{table_name}' folder")
            except IOError as e:
                logging.error(f"Error writing to file: {e}")
                sys.exit(1)           

def write_env_to_file(env_content, env_file_path):
    """
    Write the generated environment variables to a file, overwriting it if it exists
    :param env_content: The environment variables to write
    :param env_file_path: The path to the output file
    """
    try:
        with open(env_file_path, 'w') as outputFile:
            outputFile.write(env_content)
        logging.info(f"Environment variables successfully written to {env_file_path}")
    except IOError as e:
        logging.error(f"Error writing to file: {e}")
        sys.exit(1)

def main():
    logging.info("ForgeAPI Compiler started")
    
    file_path = check_arguments()
    source = read_source_file(file_path)
    tokens = initialize_lexer(source)
    parse_tree = parse_tokens(tokens)
    
    # Extract endpoint data
    endpoint_data = extract_endpoint_data(parse_tree)

    # Extract database schema
    database_schema = process_database_schema(parse_tree)

    # Generate SQL code
    sql_generator = SQLCodeGenerator(database_schema)
    sql_code = sql_generator.generate()
    output_file_path = "./DB/schema.sql"
    write_sql_to_file(sql_code, output_file_path)

    # Get auto_id columns of database schema
    auto_id_columns = get_auto_id_columns(database_schema)

    # Generate environment variables for database
    database_name = database_schema.get('name')
    env_generator = EnvGenerator(database_name)
    env_content = env_generator.generate_env_content()
    env_file_path = "./.env"
    write_env_to_file(env_content, env_file_path)

    # Generate Node.js code
    endpoint_output_dir = "./RaftNode/REST"
    nodejs_generator = NodeJSCodeGenerator(auto_id_columns, endpoint_data)
    print(endpoint_data)
    nodejs_code = nodejs_generator.generate_code()
    write_endpoints_to_files(nodejs_code, endpoint_output_dir)

    # Register routes in app.js
    app_js_path = "./RaftNode/app.js"
    app_js_generator = AppJSRouteGenerator(app_js_path)
    app_js_generator.register_routes(endpoint_data)

    # Print the formatted parse tree for debugging
    #printed_tree = PrintTree(parse_tree)
    #print(printed_tree)

    # Print endpoint data and generated code for debugging
    #print_endpoint_data(nodejs_code)

    logging.info("ForgeAPI Compiler finished successfully")

if __name__ == "__main__":
    main()
