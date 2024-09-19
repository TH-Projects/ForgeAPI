import os

APPJS_ROUTE_GENERATOR_VERSION = '1.0'

class AppJSRouteGenerator:
    def __init__(self, app_js_path):
        self.app_js_path = app_js_path

    def insert_routes(self, routes_file_dir, generated_routes):
        """
        Inserts generated routes into the app.js content
        The routes will be inserted at the location where the content of "insert_marker" is found
        
        :param app_js_content: The content of app.js file as a string
        :param generated_routes: A string containing the registered routes
        :return: The modified content of app.js with the routes inserted
        """
        
        with open(routes_file_dir, 'w') as file:
            return file.write(generated_routes)
        print(f"Routes have been registered in {routes_file_dir}.")

    def generate_routes(self, data):
        """
        Generate all routes based on the provided data.
        :param data: The input data containing tables and endpoints.
        :return: A string containing all generated Fastify route registrations.
        """
        generated_routes = ""
        generated_routes += "module.exports = async function (fastify) {\n"
        
        for table in data['tables']:
            for endpoint in table['endpoints']:
                generated_routes += f"    fastify.register(require('./Rest/{endpoint['table']}{endpoint['url']}'));\n"
        
        generated_routes += "};\n"
        return generated_routes

    def register_routes(self, data):
        """
        The main method that orchestrates reading, updating, and writing app.js with generated routes
        :param data: Dictionary containing the tables and endpoints to generate routes from
        """

        # Generate Fastify routes
        generated_routes = self.generate_routes(data)
        
        # Insert the generated routes into registered-routes.txt
        registered_routes_file = "./RaftNode/routes.js"
        self.insert_routes(registered_routes_file, generated_routes)
