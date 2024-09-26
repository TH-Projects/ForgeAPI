import secrets
import string

class EnvGenerator:
    def __init__(self, dbname):
        self.dbname = dbname
        self.user = f"{dbname}User"
        self.password = self.generate_secure_password()
        self.root_password = self.generate_secure_password()
        
    def generate_secure_password(self, length=128):
        """
        Generate a secure random password
        :param length: The length of the password
        :return: The generated password as a string
        """
        characters = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(characters) for i in range(length))
        return password
    
    def generate_env_content(self):
        """
        Generate the content for the .env file containing the database configuration
        :return: The content for the .env file as a string
        """
        env_content = (
            f"MYSQL_USER={self.user}\n"
            f"MYSQL_PASSWORD={self.password}\n"
            f"MYSQL_DATABASE={self.dbname}\n"
            f"MYSQL_ROOT_PASSWORD={self.root_password}\n"
        )
        return env_content
