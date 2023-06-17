from flask import Flask, request, Response
import requests
import json

app = Flask(__name__)

@app.route('/', methods=['POST'])
def forward_request():
    url = 'https://php-server-try.000webhostapp.com/'  # Replace with the URL of the target server
    reqData = request.data.decode('utf-8')
    # turn reqData to JSON and print action_type
    reqData = json.loads(reqData)
    response = requests.post(url, data= reqData)
    # print requset.data as JSON
    print(response.text)
    return response.text

if __name__ == '__main__':
    app.run()
