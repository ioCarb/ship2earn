# calculateDistance haversine formula in python
# https://stackoverflow.com/questions/4913349/haversine-formula-in-python-bearing-and-distance-between-two-gps-points

from datetime import datetime
import json
import time
import os
import event_pb2
import hashlib
import paho.mqtt.client as mqtt
import sys

sys.path.append("/home/user")

from pycrypto.zokrates_pycrypto.eddsa import PrivateKey, PublicKey
from pycrypto.zokrates_pycrypto.field import FQ
from pycrypto.zokrates_pycrypto.utils import (
    write_signature_for_zokrates_cli,
    return_signature_for_zokrates_cli,
    to_bytes,
)

#from gps4ghat.BG77X import BG77X
import threading
import signal
from collections import deque
import math

import psutil
import tempfile

stop_event = threading.Event()

def byte_repr(i):
    result = i.to_bytes((i.bit_length() + 7) // 8, "big")
    return result

def randome_vehicle():
    vehicle_list = [1000000001, 1000000002, 1000000003, 1000000004]
    num = random.choice(vehicle_list)
    return num


def convert__to_protobuf(dict):

    try:

        event = event_pb2.Event()

        event.header.event_type = dict["header"]["event_type"]
        event.header.token = dict["header"]["token"]
        event.header.timestamp = dict["header"]["timestamp"]

        payload = dict["payload"]

        event.payload = json.dumps(payload, ensure_ascii=False).encode("utf-8")

        data = event.SerializeToString()

        hex_output = data.hex()

        return hex_output
    except Exception as e:
        return f"Error: {str(e)}"


def send(payload, loop_count):
    try:
        broker = "devnet-staging-mqtt.w3bstream.com"
        #topic = "eth_0x8ef5b88a455fc8a0077c708d14d8355bfa725efd_iocarb_test3"
        topic = "eth_0x8ef5b88a455fc8a0077c708d14d8355bfa725efd_iocarb"
        message = bytes.fromhex(payload)

        client = mqtt.Client()

        try:
            client.connect(broker)
        except Exception as e:
            print(f"Failed to connect to the broker: {e} \n")
            return

        total_time = 0
        for _ in range(loop_count):
            start_time = time.time()
            print(topic)
            print(message)
            result = client.publish(topic, message)
            if result.rc != mqtt.MQTT_ERR_SUCCESS:
                print(f"Failed to publish message: {mqtt.error_string(result.rc)} \n")
                client.disconnect()
                return

            end_time = time.time()
            total_time += end_time - start_time

        client.disconnect()

        average_time = total_time / loop_count
        print(
            f"Average time taken for {loop_count} publishes: {average_time} seconds \n"
        )
    except Exception as e:
        print(f"Error: {str(e)}\n")


raw_msg = ""

def start(positions):
    vehicle = 1
    prehash = positions + " " + str(vehicle)
    msg = hashlib.sha512(prehash.encode("utf-8")).digest()

    key = FQ(
        1997011358982923168928344992199991480689546837621580239342656433234255379025
    )
    sk = PrivateKey(key)
    sig = sk.sign(msg)

    pk = PublicKey.from_private(sk)

    is_verified = pk.verify(sig, msg)

    signed_msg = return_signature_for_zokrates_cli(pk, sig, msg)
    signed_msg_with_prehash = signed_msg + " " + prehash

    protobuf_msg = convert__to_protobuf(
        {
            "header": {
                "event_type": "DEVICE_DATA",
                #"token": "w3b_MV8xNzIwMTcyMzk2X3tsPXw_MVlVPyhZbQ",
                "token": "w3b_MV8xNzE3NDM0MTQwX1c-KiAhNnk2NSJiWg",
                "timestamp": int(time.time()),
            },
            "payload": {
                "timestamp": str(int(time.time())),
                "pebbleId": "98765",
                "message": signed_msg_with_prehash,
            },
        }
    )

    send(protobuf_msg, 1)
    print("message send...")


currentLocationQueue = deque()

def calculateDistance(tupel1, tupel2):
    lat1, lon1 = math.radians(tupel1[0]), math.radians(tupel1[1])
    lat2, lon2 = math.radians(tupel2[0]), math.radians(tupel2[1])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    r = 6371.0
    distance_in_km = r * c
    distance_in_m = distance_in_km * 1000
    return int(distance_in_m)

def read_from_json():
    with open('gps.json', 'r') as file:
        data = json.load(file)
        print(f"Latitude: {data['latitude']}, Longitude: {data['longitude']}")
        return data['latitude'], data['longitude']

logfile = "resource_usage_test_3.log"

def write_log():
    try:
        with open(logfile, 'w') as f:
            f.write("Timestamp, CPU-Usage, Memory\n")
        while not stop_event.is_set():
            timestamp = str(int(time.time()))
            cpu_usage = f"{psutil.cpu_percent(interval=1)}%"
            memory = psutil.virtual_memory()
            memory_usage = f"{memory.percent}%"
            with open(logfile, 'a') as f:
                f.write(f"{timestamp}, {cpu_usage}, {memory_usage}\n")
            time.sleep(1)
    except Exception as e:
        print(f"Error in write_log: {e}")


def update_current_location():
    global raw_msg
    try:
        (lat1,lon1) = read_from_json()
        while not stop_event.is_set():
            time.sleep(10)
            #print("queuing new position.")
            (lat2,lon2) = read_from_json()
            if raw_msg == "":
                raw_msg += str(calculateDistance((lat1,lon1),(lat2,lon2)))
            else:
                raw_msg += " " + str(calculateDistance((lat1,lon1),(lat2,lon2)))
            (lat1,lon1) = (lat2,lon2)
    except Exception as e:
        print(f"Error in stopp_app: {e}")




def stopp_app():
    try:
        while not stop_event.is_set():
            time.sleep(600) #10 min 600
            print("Time is up")
            start(raw_msg)
            stop_event.set()
            sys.exit(0)
    except Exception as e:
        print(f"Error in stopp_app: {e}")


write_log_thread = threading.Thread(target=write_log)
update_location_thread = threading.Thread(target=update_current_location)
stopp_app_thread = threading.Thread(target=stopp_app)

try:
    write_log_thread.start()
    update_location_thread.start()
    stopp_app_thread.start()

except TypeError as e:
        print(f"Caught an error: {e}")

except AttributeError as e:
        print(f"Caught an error: {e}")