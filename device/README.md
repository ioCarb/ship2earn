# HTTP Call Bash Script

This Bash script gerate a HTTP request to the W3bstream Node

## Prerequisites

- `httpie` command-line tool
- Running W3ebstram node


## Usage

1. Set your environment variables in the Script a folow:
```
TOPIC=<topic of the project>
   export PUBTOK=<publisher token generated in the w3bstream studio>
   export PAYLOAD=<message to send to the node>
   export MQTT_HOST=<hostname of w3bstreamnode localhost for localnode>
   export MQTT_USERNAME="" #empty for now
   export MQTT_PASSWORD="" #empty for now
   export HTTP_HOST=<http FDDN and route of the http call>
   export EVENTTYPE=<type of the event defined in the w3bstream node>
   export TIMESTAMP=$(date +%s)  # Event pub timestamp 
```
as shown in the example below
   ```bash
   export TOPIC="eth_0xa2490c896ac250bf5604aff008a9cebca705de20_ship2earn"
   export PUBTOK="w3b_MV8xNzE2MzIwMjE3X2M1bHNTWSYkOG9CaQ"
   export PAYLOAD="testme"
   export MQTT_HOST="<HOSNAME>"
   export MQTT_USERNAME=""
   export MQTT_PASSWORD=""
   export HTTP_HOST="http://<HOSNAME>:3000/api/w3bapp/event/eth_0xa2490c896ac250bf5604aff008a9cebca705de20_ship2earn"
   export EVENTTYPE="START"  # Default means start handler
   export TIMESTAMP=$(date +%s)  # Event pub timestamp (recommended)
```
2. Run the script\
``./rn.sh``

## Further tools
- Send GPS data from your android phone to your laptop [README.md](https://github.com/EdisonTT/To-receive-GPS-data-from-smart-phone-using-Python/blob/main/README.md)
- Convert JSON to ProtoBuff (only for MQTT messages) and W3bstream endpoints testing tool [README.md](https://github.com/boooooooooooob/IoT-Net-Tester/blob/main/README.md)
- Golang Script to convert and send a MQTT message to a W3bstream node [main.go](https://github.com/machinefi/w3bstream/blob/main/cmd/pub_client/main.go) 
