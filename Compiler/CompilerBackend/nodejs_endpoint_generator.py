NODEJ_CODE_GENERATOR_VERSION = '1.1'

class NodeJSCodeGenerator:
    def __init__(self, endpoint_data):
        self.endpoint_data = endpoint_data
        self.generated_endpoints = []  # List to store the generated endpoints

    def format_query_params(self, query_params):
        """
        Formats the query parameters as a string for the generated code
        Getting parameters by object descructuring

        :param query_params: List of query parameters.
        :return: The formatted query parameters as a string.
        """
        if query_params:
            return f"{{ {', '.join(query_params)} }} = req.query"
        return ""
    
    def generate_sql_query(self, table_name, method, query_params):
        """
        Generates an SQL statement based on the HTTP method, table name, URL, and query parameters.

        :param table_name: Name of the table to generate the SQL for.
        :param method: HTTP method (GET, POST, PUT, DELETE).
        :param url: URL path (used to derive query parameters).
        :param query_params: List of query parameters.
        :return: The SQL statement as a string.
        """
        if method == 'get':
            # Generate SELECT query
            columns = '*'
            sql_query = f"SELECT {columns} FROM {table_name}"
            # Assuming the URL contains query parameters, e.g., /path?param=value
            if query_params:
                sql_query += f" WHERE {' AND '.join([f'{param} = ?' for param in query_params])}"
        
        elif method == 'post':
            # Generate INSERT query
            columns = ', '.join(query_params)
            placeholders = ', '.join(['?' for _ in query_params])
            sql_query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
        
        elif method == 'put':
            # Generate UPDATE query
            set_clause = ', '.join([f"{param} = ?" for param in query_params])
            sql_query = f"UPDATE {table_name} SET {set_clause} WHERE id = ?"
        
        elif method == 'delete':
            # Generate DELETE query
            sql_query = f"DELETE FROM {table_name} WHERE {' AND '.join([f'{param} = ?' for param in query_params])}"
        
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return sql_query

    def generate_parmeter_validation(self, query_params):
        """
        Generates the parameter validation code for the query parameters

        :param query_param: List of query parameters.
        :return: The generated code in JavaScript notation for Fastify servers.
        """
        validation_code = ""
        for param in query_params:
            validation_code += f"    if (!{param}) {{\n"
            validation_code += f"       return res.code(400).send(\n"
            validation_code += f"           {{\n"
            validation_code += f"               success: false,\n"
            validation_code += f"               message: 'Missing required parameter {param}'\n"
            validation_code += f"           }}\n"
            validation_code += f"    }}\n"
        return validation_code

    def generate_endpoint_code(self, table_name, method, url, query_params):
        """
        Generates the code for a single endpoint based on the table name, HTTP method, URL, and query parameters

        :param table_name: Name of the table to generate the endpoint for.
        :param method: HTTP method (GET, POST, PUT, DELETE).
        :param url: URL path for the endpoint.
        :param query_params: List of query parameters.
        :return: The generated code in JavaScript notation for Fastify servers.
        """
        query_params_code = self.format_query_params(query_params)
        parameter_validation_code = self.generate_parmeter_validation(query_params)
        
        # Templating module and endpoint function
        endpoint_code = (
            f"const TARGET_TABLE = '{table_name}';\n\n"
            f"const {url.replace('/', '')} = async (fastify) => {{\n"
            f"  fastify.{method}('{url}', async (req, res) => {{\n\n"
        )

        # Templating parameters and validation if query parameters are present
        if query_params_code:
            endpoint_code += (
                f"    // Destructure query params\n"
                f"    const {query_params_code};\n"
                f"{parameter_validation_code}\n\n"
            )
        
        # Templating SQL query
        endpoint_code += (
            f"    // Sending the SQL query to the consensus and validate the response\n"
            f"    const sql_query = `{self.generate_sql_query(table_name, method, query_params)}`;\n"
            f"    const queryResult = await consensus.query(sql_query, query_params);  // Placeholder: Target function not implemented yes\n"
            f"    if (!queryResult.success) {{\n"
            f"        return res.code(500).send(queryResult);\n"
            f"    }}\n\n"
        )
        # Templating success response
        endpoint_code += (
            f"    // Return the query result\n"
            f"    return res.code(200).send(\n"
            f"        {{\n"
            f"            success: true,\n"
            f"            data: queryResult\n"
            f"        }}\n"
            f"    );\n"
        )

        # Templating closing brackets for module and endpoint function
        endpoint_code += (
            f"  }});\n"
            f"}};\n\n"
        )
        # Export the endpoint function
        endpoint_code += f"module.exports = {url.replace('/', '')};\n"
        return endpoint_code

    def generate_code(self):
        """
        Generates the code for all endpoints based on the provided endpoint data
        
        :return: List of dictionaries containing endpoint data, including table name, URL, method, query parameters, and generated code.
        """
        for table in self.endpoint_data['tables']:
            table_name = table['table']
            for endpoint in table['endpoints']:
                method = endpoint['method']
                url = endpoint['url']
                query_params = endpoint['query_params']

                # Generate the code for each endpoint
                code = self.generate_endpoint_code(table_name, method, url, query_params)
                
                # Apply the generated code to the endpoint_object list
                endpoint_object = {
                    'table': table_name,
                    'method': method,
                    'url': url,
                    'query_params': query_params,
                    'generated_code': code
                }
                self.generated_endpoints.append(endpoint_object)

        return self.generated_endpoints
