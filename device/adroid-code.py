import androidhelper as android
import time
import socket
import requests 

#port=12345
#s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
#s.connect(("[Reciever HOST]",port)) #Ip address of the connected network
droid = android.Android()
url = "http://<Node Hostname>:3000/api/w3bapp/event/eth_0xa2490c896ac250bf5604aff008a9cebca705de20_ship2earn"
params = {
    "eventType": "START",
    "timestamp": "1717015298"
}

# Define the headers
headers = {
    "Authorization": "Bearer <Publisher Token>",
    "Content-Type": "application/json"  # Ensure proper content-type if sending JSON data
}


while True:
    droid.startLocating(1000,1)
    droid.eventWaitFor('location', int(9000))
    location = droid.readLocation().result
    data = bytes(str(location),'ascii')
    # Define the raw data
    raw_data = data

    # Send the POST request
    response = requests.post(url, headers=headers, params=params, data=raw_data)

    # Check the response
    print("Status Code:", response.status_code)
    print("Response Body:", response.text)
    #s.send(data)
    #print(location)
    time.sleep(3)    
droid.stopLocating()

# Define the URL and the parameters
