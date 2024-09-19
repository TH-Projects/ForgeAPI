import os

APPJS_ROUTE_GENERATOR_VERSION = '1.0'

class AppJSRouteGenerator:
    def __init__(self, app_js_path):
        self.app_js_path = app_js_path

    def read_app_js(self):
        """
        Reads the contents of app.js to modify
        :return: The content of app.js as a string
        """
        if not os.path.exists(self.app_js_path):
            raise FileNotFoundError(f"File not found: {self.app_js_path}")
        
        with open(self.app_js_path, 'r') as file:
            return file.read()

    def insert_routes(self, app_js_content, generated_routes):
        """
        Inserts generated routes into the app.js content
        The routes will be inserted at the location where the content of "insert_marker" is found
        
        :param app_js_content: The content of app.js file as a string
        :param generated_routes: A string containing the registered routes
        :return: The modified content of app.js with the routes inserted
        """
        insert_marker = '// Register Routes -> This part is generated automatically'
        parts = app_js_content.split(insert_marker)

        if len(parts) != 2:
            raise ValueError(f"Insert marker '{insert_marker}' not found in app.js.")
        
        # Insert the generated routes after the marker
        updated_content = parts[0] +  insert_marker + '\n' + generated_routes  + parts[1]
        return updated_content

    def write_app_js(self, updated_content):
        """
        Writes the updated content back to the app.js file.
        :param updated_content: The modified content of the app.js file.
        """
        with open(self.app_js_path, 'w') as file:
            file.write(updated_content)
        print(f"Routes have been registered in {self.app_js_path}.")

    def generate_routes(self, data):
        """
        Generate all routes based on the provided data.
        :param data: The input data containing tables and endpoints.
        :return: A string containing all generated Fastify route registrations.
        """
        generated_routes = ""
        
        for table in data['tables']:
            for endpoint in table['endpoints']:
                generated_routes += f"fastify.register(require('./Rest/{endpoint['table']}{endpoint['url']}'));\n"
        
        return generated_routes

    def register_routes(self, data):
        """
        The main method that orchestrates reading, updating, and writing app.js with generated routes
        :param data: Dictionary containing the tables and endpoints to generate routes from
        """
        # Read app.js file
        app_js_content = self.read_app_js()

        # Generate Fastify routes
        generated_routes = self.generate_routes(data)
        
        # Insert the generated routes into app.js
        updated_content = self.insert_routes(app_js_content, generated_routes)

        # Write the updated content back to the app.js file
        self.write_app_js(updated_content)