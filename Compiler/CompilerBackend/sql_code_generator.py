SQL_GENERATOR_VERSION = 1.2

class SQLCodeGenerator:
    def __init__(self, schema):
        self.schema = schema
        # Mapping of ForgeAPI datatypes to SQL datatypes
        self.datatype_mapping = {
            'string': 'VARCHAR',
            'integer': 'INT',
            'float': 'FLOAT',
            'boolean': 'BOOLEAN',
            'date': 'DATE',
            'timestamp': 'TIMESTAMP',
            'auto_id': 'INT AUTO_INCREMENT'
        }

    def generate(self):
        """
        Generate SQL code from the database schema
        :return: generated SQL code
        """
        # Validate the schema
        if not self._is_valid_schema(self.schema):
            raise ValueError("Schema must be of type 'database'")
        
        # Extract database name
        database_name = self.schema.get('name')
        if not database_name:
            raise ValueError("Database name is missing in the schema.")

        # Create SQL statements for creating the database and using it
        sql_statements = []
        sql_statements.append(f"CREATE DATABASE IF NOT EXISTS {database_name};")
        sql_statements.append(f"USE {database_name};")
        
        # Create SQL statements for each table
        tables = self.schema.get('tables', [])
        if not tables:
            print("Warning: No tables found in schema.")
        
        for table in tables:
            if table.get('type') == 'table':
                sql_statements.append(self._generate_create_table(table))

        sql_statements.append(self.add_consensus_log_table())
        
        return "\n\n".join(sql_statements)
    
    def _is_valid_schema(self, schema):
        """
        Check if the schema is valid
        :param schema: Schema dictionary
        :return: True if the schema is valid, False otherwise
        """
        if schema.get('type') != 'database':
            print(f"Invalid schema type: {schema.get('type')}")
            return False
        return True
    
    def _generate_create_table(self, table):
        """
        Generate a SQL statement for a table
        :param table: Table dictionary
        :return: SQL statement for creating the table
        """
        table_name = table.get('name')
        if not table_name:
            raise ValueError("Table name is missing.")
        
        columns = table.get('columns', [])
        foreign_keys = table.get('foreign_keys', [])
        
        # Create SQL statement for table creation
        sql = f"CREATE TABLE {table_name} (\n"
        
        # Column definitions
        column_definitions = []
        for column in columns:
            col_name = column.get('name')
            col_type = self._map_datatype(column.get('datatype', 'TEXT'))  # Default datatype is TEXT (only one supported currently)
            primary_key = 'PRIMARY KEY' if column.get('primary_key') else ''
            not_null = 'NOT NULL' if column.get('not_null') else ''
            column_definitions.append(f"  {col_name} {col_type} {primary_key} {not_null}".strip())
        
        if not column_definitions:
            print(f"Warning: No column definitions for table {table_name}.")
        
        sql += ",\n".join(column_definitions)
        
        # Foreign Key-Constraints
        fk_constraints = []
        for fk in foreign_keys:
            fk_table = fk.get('table')
            fk_column = fk.get('column')
            if fk_table and fk_column:
                fk_constraints.append(f"  FOREIGN KEY ({fk_column}) REFERENCES {fk_table} ({fk_column})")
        
        if fk_constraints:
            sql += ",\n" + ",\n".join(fk_constraints)
        
        sql += "\n);"
        
        return sql

    def _map_datatype(self, datatype):
        """
        Maps the ForgeAPI datatype to a SQL datatype
        Compatible for MariaDB
        :param datatype: ForgeAPI datatype string
        :return: SQL datatype string
        """
        if 'string' in datatype:
            size = self._extract_size(datatype)
            return f"VARCHAR({size})"
        elif datatype in self.datatype_mapping:
            return self.datatype_mapping[datatype]
        else:
            raise ValueError(f"Unsupported datatype: {datatype}")

    def _extract_size(self, datatype):
        """
        Extracts the size of a string datatype
        :param datatype: ForgeAPI datatype string
        :return: Size of the datatype
        """
        import re
        match = re.search(r'\((\d+)\)', datatype)
        if match:
            return match.group(1)
        return '255'  # Default size if not specified
    
    def add_consensus_log_table(self):
        """
        Add a Consensus_Node_Log table to the schema
        :return: SQL code for creating the Consensus_Node_Log table
        """
        return(
            "CREATE TABLE Consensus_Node_Log (\n"
            "id SERIAL PRIMARY KEY,\n"
            "command TEXT NOT NULL\n"
            ");\n"
        )
