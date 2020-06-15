#!/usr/bin/env python3

import sys
import requests


from_url, to_application, jwt_token = sys.argv[1:]

response = requests.get(from_url)
data = response.json()
print(data)
headers = {'x-jwt-token': jwt_token}

requests.post(to_application + '/form', json=data, headers=headers)
