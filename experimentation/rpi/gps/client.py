from datetime import datetime
import json
import time
import pynmea2
import os, sys
import event_pb2

import paho.mqtt.client as mqtt
import sys
sys.path.append('/home/user')

from pycrypto.zokrates_pycrypto.eddsa import PrivateKey, PublicKey
from pycrypto.zokrates_pycrypto.field import FQ
from pycrypto.zokrates_pycrypto.utils import write_signature_for_zokrates_cli, return_signature_for_zokrates_cli, to_bytes

from gps4ghat.BG77X  import BG77X


def byte_repr(i):
    result = i.to_bytes((i.bit_length() + 7) // 8, 'big')
    return result


def convert_lat(lat):
    lat_unsigned = int((lat + 90) * 10**7)  #Shifting the range from -90...90 to 0...180 and move the decimal places
    return lat_unsigned

def convert_lon(lon):
    lon_unsigned = int((lon + 180) * 10**7) #Shifting the range from -180...180 to 0...360 and move the decimal places

    return lon_unsigned

def randome_vehicle():
    vehicle_list = [1000000001, 1000000002, 1000000003, 1000000004]
    num = random.choice(vehicle_list)
    return num

def convert__to_protobuf(dict):

    try:

        event = event_pb2.Event()

        #print(dict["header"])

        # Populate header
        event.header.event_type = dict["header"]["event_type"]
        event.header.token = dict["header"]["token"]
        event.header.timestamp = dict["header"]["timestamp"]

        # Set payload
        payload = dict["payload"]

        event.payload = json.dumps(payload, ensure_ascii=False).encode('utf-8')

        # Serialize to bytes
        data = event.SerializeToString()
        #print(data)

        # Convert to hex string
        hex_output = data.hex()

        # convert hex_output back to bytes
        # bytes_output = bytes.fromhex(hex_output)

        return hex_output
    except Exception as e:
        # Handle any errors in conversion and show a simple error message
        return f"Error: {str(e)}"

def send(payload, loop_count):
    try:
        broker = 'devnet-staging-mqtt.w3bstream.com'
        topic = 'eth_0x8ef5b88a455fc8a0077c708d14d8355bfa725efd_iocarb'
        message = bytes.fromhex(payload)

        client = mqtt.Client()

        try:
            client.connect(broker)
        except Exception as e:
            print(
                f"Failed to connect to the broker: {e} \n")
            return

        total_time = 0
        for _ in range(loop_count):
            start_time = time.time()

            # Publish to the topic
            print(topic)
            print(message)
            result = client.publish(topic, message)
            if result.rc != mqtt.MQTT_ERR_SUCCESS:
                print(
                    f"Failed to publish message: {mqtt.error_string(result.rc)} \n")
                client.disconnect()
                return

            end_time = time.time()
            total_time += (end_time - start_time)

        client.disconnect()

        average_time = total_time / loop_count
        print(
            f"Average time taken for {loop_count} publishes: {average_time} seconds \n")
    except Exception as e:
        print(f"Error: {str(e)}\n")


def start (latitude, longitude):

    print("=================== Original Data ===================")
    print(f"Latitude: {latitude}, Longitude: {longitude}")
    lat = convert_lat(latitude)
    long = convert_lon(longitude)
    print("Shifting the latitude range from -90...90 to 0...180 and move the decimal places")
    print("Shifting the longitude range from -180...180 to 0...360 and move the decimal places\n")
    print("=========== converted to unsigned integers ==========")
    print(f"Latitude: {lat}, Longitude: {long}")
    #placeholder=byte_repr(11111111)
    blat = byte_repr(lat)
    blong = byte_repr(long)
    vehicle = byte_repr(1000000001) #byte_repr(randome_vehicle())
    print("================= converted to bytes ================")
    #print("Placeholder:", placeholder)
    print(f"Latitude: {blat}, Longitude: {blong}\n")

    msg = to_bytes(blat, blat, blat, blat, blong, blong, blong, blong, blat, blat, blat, blat, blong, blong, blong, vehicle)

    print("============== message that gets signed =============")
    print(msg)
     # Seeded for debug purpose
    key = FQ(1997011358982923168928344992199991480689546837621580239342656433234255379025)
    #print('Private Key:')
    #print(key)
    sk = PrivateKey(key)
    sig = sk.sign(msg)
    #print(sig)

    pk = PublicKey.from_private(sk)
    #print('Public Key:')
    #print(pk.p)

    print('==================== vehicle type ===================')
    vehicle = 1000000001
    if vehicle == byte_repr(1000000001):
        print("Bike")
    elif vehicle == byte_repr(1000000002):
        print("E-Scooter")
    elif vehicle == byte_repr(1000000003):
        print("Scooter")
    elif vehicle == byte_repr(1000000004):
        print("Car")

    print('================= inputs for zokrates ================')


    is_verified = pk.verify(sig, msg)
    #print(is_verified)

    path = 'zokrates_inputs_new.txt'
    #write_signature_for_zokrates_cli(pk, sig, msg)
    signed_msg = return_signature_for_zokrates_cli(pk, sig, msg)
    print(signed_msg)

    print('================= protobuf ================')

    protobuf_msg = convert__to_protobuf({"header": {
    "event_type": 'DEVICE_DATA',
    "token": 'w3b_MV8xNzE3NDM0MTQwX1c-KiAhNnk2NSJiWg',
    "timestamp":123456,
    },
    "payload": {"timestamp":"1717351192","pebbleId":"98765","message": signed_msg}})
    send(protobuf_msg,1)

gps_json_string = """{
    "imei": 0,
    "latitude": 0,
    "longitude": 0,
    "altitude": 0,
    "utc": 0
}"""


def loc2gps_json (gpsloc):

    mqtt_json = json.loads(gps_json_string)

    mqtt_json['imei'] = module.IMEI

    point = gpsloc['latitude'].find('.')
    gradus = float(gpsloc['latitude'][0:point-2])
    minute = float(gpsloc['latitude'][point-2:-1])/60
    mqtt_json['latitude'] = round(gradus + minute, 6)
    if gpsloc['latitude'][-1] == 'S':
        mqtt_json['latitude'] = - mqtt_json['latitude']

    point = gpsloc['longitude'].find('.')
    gradus = float(gpsloc['longitude'][0:point-2])
    minute = float(gpsloc['longitude'][point-2:-1])/60
    mqtt_json['longitude'] = round(gradus + minute, 6)
    if gpsloc['longitude'][-1] == 'W':
        mqtt_json['longitude'] = - mqtt_json['longitude']

    mqtt_json['altitude'] = gpsloc['altitude']

    dt = datetime(
        2000 +
        int(gpsloc['date'][4:]),    # year
        int(gpsloc['date'][2:4]),
        int(gpsloc['date'][0:2]),
        int(gpsloc['time'][0:2]),    # hour
        int(gpsloc['time'][2:4]),
        int(gpsloc['time'][4:6]),
        )
    mqtt_json['utc'] = dt.timestamp()
    return mqtt_json

bWriteLog = True

def writeNMAlog (file):

    head = "+QGPSGNMEA: "

    if bWriteLog:
        module.sendATcmd('AT+QGPSGNMEA="GSV"')
        start = module.response.find(head)
        while start != -1:
            start += len(head)
            end = module.response.find(head, start)
            if end == -1:
                file.write(module.response[start:module.response.find("OK", start) - 2])
                break;
            file.write(module.response[start:end])
            start = end

    module.sendATcmd('AT+QGPSGNMEA="RMC"')
    start = module.response.find(head)
    end = module.response.find("*", start) + 3
    nmea_sent = module.response[start + len(head) : end]
    file.write(nmea_sent + '\r\n')
    file.flush()

    try:
        msg = pynmea2.parse(nmea_sent)
    except Exception:
        return False  #return on parser exception

    if msg.lat:
        mqtt_json = json.loads(gps_json_string)
        mqtt_json['imei'] = module.IMEI
        mqtt_json['latitude'] = round(msg.latitude, 6)
        mqtt_json['longitude'] = round(msg.longitude, 6)
        mqtt_json['altitude'] = 0
        mqtt_json['utc'] = msg.datetime.timestamp()
    else:
       mqtt_json = False

    return mqtt_json

module = BG77X()

module.sendATcmd("AT+CMEE=2")
module.getHardwareInfo()
module.getFirmwareInfo()
module.getIMEI()

if bWriteLog:
    file = open("../nmea_rmc.log", "a")
    file.write("\nIMEI: %s\n" % module.IMEI)

try:
    while True:
        if not module.isOn():
            module.open()
        module.gnssOn()

        start_time = time.time()
        mqtt_json = writeNMAlog(file)
        while(not mqtt_json):
            time.sleep(10.)
            mqtt_json = writeNMAlog(file)
        print ("\nposition search time %s seconds\n" % int(time.time() - start_time))

        for sec in range (30):
            mqtt_json = writeNMAlog(file)
            time.sleep(.99)

        module.gnssOff()
        time.sleep(2.)

        if (mqtt_json):
            print("\nhttps://maps.google.com/?q=%s,%s\n" % (mqtt_json['latitude'], mqtt_json['longitude']))
        else:
            continue

        start(mqtt_json['latitude'], mqtt_json['longitude'])
        time.sleep(2.)

except Exception as e:
    print('exception: ' + str(e))

finally:
    print("Ctrl+C pressed, switch BG77X off and exit")
    module.close()
    if bWriteLog:
        file.close()
    sys.exit(0)
