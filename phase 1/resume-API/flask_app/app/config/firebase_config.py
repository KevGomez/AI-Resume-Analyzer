import os
import firebase_admin
from firebase_admin import credentials, auth

# Get the path to the service account file
current_dir = os.path.dirname(os.path.abspath(__file__))
service_account_path = os.path.join(current_dir, 'service-account.json')

# Initialize Firebase Admin with your service account
cred = credentials.Certificate(service_account_path)

# Initialize the app
firebase_app = firebase_admin.initialize_app(cred) 