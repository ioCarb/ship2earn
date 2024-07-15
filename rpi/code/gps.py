from datetime import datetime
import json
import time
import pynmea2
import os
import sys
import csv
import tempfile

sys.path.append("/home/user")
from gps4ghat.BG77X import BG77X


gps_json_string = """{
    "imei": 0,
    "latitude": 0,
    "longitude": 0,
    "altitude": 0,
    "utc": 0
}"""


def loc2gps_json(gpsloc):

    mqtt_json = json.loads(gps_json_string)

    mqtt_json["imei"] = module.IMEI

    point = gpsloc["latitude"].find(".")
    gradus = float(gpsloc["latitude"][0 : point - 2])
    minute = float(gpsloc["latitude"][point - 2 : -1]) / 60
    mqtt_json["latitude"] = round(gradus + minute, 6)
    if gpsloc["latitude"][-1] == "S":
        mqtt_json["latitude"] = -mqtt_json["latitude"]

    point = gpsloc["longitude"].find(".")
    gradus = float(gpsloc["longitude"][0 : point - 2])
    minute = float(gpsloc["longitude"][point - 2 : -1]) / 60
    mqtt_json["longitude"] = round(gradus + minute, 6)
    if gpsloc["longitude"][-1] == "W":
        mqtt_json["longitude"] = -mqtt_json["longitude"]

    mqtt_json["altitude"] = gpsloc["altitude"]

    dt = datetime(
        2000 + int(gpsloc["date"][4:]),  # year
        int(gpsloc["date"][2:4]),
        int(gpsloc["date"][0:2]),
        int(gpsloc["time"][0:2]),  # hour
        int(gpsloc["time"][2:4]),
        int(gpsloc["time"][4:6]),
    )
    mqtt_json["utc"] = dt.timestamp()
    return mqtt_json


bWriteLog = True


def writeNMAlog(file):

    head = "+QGPSGNMEA: "

    if bWriteLog:
        module.sendATcmd('AT+QGPSGNMEA="GSV"')
        start = module.response.find(head)
        while start != -1:
            start += len(head)
            end = module.response.find(head, start)
            if end == -1:
                file.write(
                    module.response[start : module.response.find("OK", start) - 2]
                )
                break
            file.write(module.response[start:end])
            start = end

    module.sendATcmd('AT+QGPSGNMEA="RMC"')
    start = module.response.find(head)
    end = module.response.find("*", start) + 3
    nmea_sent = module.response[start + len(head) : end]

    try:
        msg = pynmea2.parse(nmea_sent)
    except Exception:
        return False  # return on parser exception
    if msg.lat:
        mqtt_json = json.loads(gps_json_string)
        mqtt_json["imei"] = module.IMEI
        mqtt_json["latitude"] = round(msg.latitude, 6)
        mqtt_json["longitude"] = round(msg.longitude, 6)
        mqtt_json["altitude"] = 0
        mqtt_json["utc"] = msg.datetime.timestamp()
        with tempfile.NamedTemporaryFile('w', delete=False) as f:
            json.dump(mqtt_json, f)
        os.rename(f.name, 'gps.json')
        print("Writing GPS Position to JSON")
    else:
        mqtt_json = False
    return mqtt_json


#currentLocation = (0, 0)

module = BG77X()

module.sendATcmd("AT+CMEE=2")
module.getHardwareInfo()
module.getFirmwareInfo()
module.getIMEI()

# module.acquireGnssSettings()
if bWriteLog:
    file = open("../nmea_rmc.log", "a")
    file.write("\nIMEI: %s\n" % module.IMEI)


def update_current_location():
    if not module.isOn():
        module.open()
    module.gnssOn()
    start_time = time.time()
    mqtt_json = writeNMAlog(file)
    while not mqtt_json:
        time.sleep(1)
        mqtt_json = writeNMAlog(file)

    if mqtt_json:
        print(
            "\nhttps://maps.google.com/?q=%s,%s\n"
            % (mqtt_json["latitude"], mqtt_json["longitude"])
        )

    time.sleep(1)


while True:
    update_current_location()
