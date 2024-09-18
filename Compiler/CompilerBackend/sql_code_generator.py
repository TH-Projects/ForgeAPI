SQL_GENERATOR_VERSION = 1.0

class SQLCodeGenerator:
    def __init__(self, schema):
        self.schema = schema
        #mapping of ForgeAPI datatypes to SQL datatypes
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
        """
        # Validate the schema
        if not self._is_valid_schema(self.schema):
            raise ValueError("Schema must be of type 'database'")
        
        # Create SQL statements for each table
        sql_statements = []
        tables = self.schema.get('tables', [])
        if not tables:
            print("Warning: No tables found in schema.")
        
        for table in tables:
            if table.get('type') == 'table':
                sql_statements.append(self._generate_create_table(table))
        
        return "\n\n".join(sql_statements)
    
    def _is_valid_schema(self, schema):
        """
        Check if the schema is valid
        """
        if schema.get('type') != 'database':
            print(f"Invalid schema type: {schema.get('type')}")
            return False
        return True
    
    def _generate_create_table(self, table):
        """
        Generate a SQL statement for a table
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
        Compatilbe for mariaDB
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
        """
        import re
        match = re.search(r'\((\d+)\)', datatype)
        if match:
            return match.group(1)
        return '255'  # Default size if not specified
