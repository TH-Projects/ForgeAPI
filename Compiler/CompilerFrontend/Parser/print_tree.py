class PrintTree:
    """
    Formats the parse tree into a readable format.

    Compatible with PARSER_VERSION=1.0

    - Parameters:
      parse_tree: dict - The parse tree to format.
    """
    def __init__(self, tree):
        self.tree = tree

    def __repr__(self):
        return self._format_node(self.tree, 0)

    def _format_node(self, node, indent_level):
        """
        Recursively formats a node of the parse tree with indentation.

        - Parameters:
          node: dict, list, str, bool, or None - The current node to format.
          indent_level: int - The current level of indentation.

        - Returns:
          str - A formatted string representation of the node.
        """
        indent = ' ' * (indent_level * 4)  # Create indentation based on the current level
        result = ""

        if isinstance(node, dict):
            # Format dictionary nodes (e.g., database, table, column)
            type_ = node.get('type', 'unknown')  # Get the type of the node, default to 'unknown'
            result += f"{indent}{{'type': '{type_}'"  # Start formatting with the type

            # Append additional attributes if present
            if 'name' in node:
                result += f", 'name': '{node['name']}'"
            if 'datatype' in node:
                result += f", 'datatype': '{node['datatype']}'"
            if 'primary_key' in node:
                result += f", 'primary_key': {node['primary_key']}"
            if 'foreign_key' in node:
                result += f", 'foreign_key': {node['foreign_key']}"
            if 'not_null' in node:
                result += f", 'not_null': {node['not_null']}"
            if 'method' in node:
                result += f", 'method': '{node['method']}'"
            if 'url' in node:
                result += f", 'url': '{node['url']}'"
            if 'query_params' in node:
                result += ", 'query_params': ["
                # Format query parameters
                for param in node['query_params']:
                    result += f"'{param}', "
                result = result.rstrip(', ') + "]"
            if 'tables' in node:
                # Recursively format tables
                result += ",\n" + f"{indent}  'tables': [\n"
                for table in node['tables']:
                    result += self._format_node(table, indent_level + 1) + ",\n"
                result += f"{indent}  ]"
            if 'columns' in node:
                # Recursively format columns
                result += ",\n" + f"{indent}  'columns': [\n"
                for column in node['columns']:
                    result += self._format_node(column, indent_level + 1) + ",\n"
                result += f"{indent}  ]"
            if 'foreign_keys' in node:
                # Recursively format foreign keys
                result += ",\n" + f"{indent}  'foreign_keys': [\n"
                for fk in node['foreign_keys']:
                    result += " \t" +  str(fk) + ",\n"
                result += f"{indent}  ]"
            if 'rest_block' in node:
                # Recursively format rest_block
                result += ",\n" + f"{indent}  'rest_block': "
                result += self._format_node(node['rest_block'], indent_level)
            if 'endpoints' in node:
                # Recursively format endpoints
                result += ",\n" + f"{indent}  'endpoints': [\n"
                for endpoint in node['endpoints']:
                    result += "\t" + str(endpoint) + ",\n"
                result += f"{indent}  ]"
            result += "}"

        elif isinstance(node, list):
            # Format list nodes (e.g., list of tables or columns)
            result += "[\n"
            for item in node:
                result += self._format_node(item, indent_level + 1) + ",\n"
            result += indent + "]"

        elif isinstance(node, str):
            # Format string nodes
            result += f"'{node}'"

        elif isinstance(node, bool):
            # Format boolean nodes
            result += f"{node}"

        elif node is None:
            # Format None nodes
            result += "None"
        return result
