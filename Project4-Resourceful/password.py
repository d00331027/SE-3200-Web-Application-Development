from werkzeug.security import generate_password_hash
from getpass import getpass

password = getpass("Enter administrator password: ")
print(generate_password_hash(password))