#!/bin/bash

# Export environment variables
export TOPIC="eth_0xa2490c896ac250bf5604aff008a9cebca705de20_ship2earn"
export PUBTOK="w3b_MV8xNzE2MzIwMjE3X2M1bHNTWSYkOG9CaQ"
export PAYLOAD="testme"
export MQTT_HOST="<HOSTNAME>"
export MQTT_USERNAME=""
export MQTT_PASSWORD=""
export HTTP_HOST="http://<HOSTNAME>:3000/api/w3bapp/event/eth_0xa2490c896ac250bf5604aff008a9cebca705de20_ship2earn"
export EVENTTYPE="START"                      # default means start handler
 this id is used for tracing event(recommended)#export EVENTID=$(uuidgen)                       #
export TIMESTAMP=$(date +%s)                    # event pub timestamp(recommended)

# Output MQTT API call [WIP]
#echo "MQTT API call:
#===================="
##echo "go run main.go -topic \"$TOPIC\" -token \"$PUBTOK\" -data \"$PAYLOAD\" -host \"$MQTT_HOST\""




#echo "HTTP API call: 
#===================="
echo "http POST \"$HTTP_HOST?eventType=$EVENTTYPE&timestamp=$TIMESTAMP Authorization:Bearer $PUBTOK --raw=testfromrpi"
http POST "$HTTP_HOST?eventType=$EVENTTYPE&timestamp=$TIMESTAMP" Authorization:"Bearer $PUBTOK" --raw="testfromrpi"

