from datetime import datetime
import json
import time
import os
import event_pb2

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

import threading
import signal

import psutil
import tempfile

stop_event = threading.Event()

def byte_repr(i):
    result = i.to_bytes((i.bit_length() + 7) // 8, "big")
    return result

def convert_lat(lat):
    lat_unsigned = int(
        (lat + 90) * 10**7
    )  
    return lat_unsigned

def convert_lon(lon):
    lon_unsigned = int(
        (lon + 180) * 10**7
    )  
    return lon_unsigned

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
        topic = "eth_0x8ef5b88a455fc8a0077c708d14d8355bfa725efd_iocarb_test1"
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


def start(latitude, longitude):

    lat = convert_lat(latitude)
    long = convert_lon(longitude)

    blat = byte_repr(lat)
    blong = byte_repr(long)
    vehicle = byte_repr(1000000001)  

    msg = to_bytes(
        blat,
        blat,
        blat,
        blat,
        blong,
        blong,
        blong,
        blong,
        blat,
        blat,
        blat,
        blat,
        blong,
        blong,
        blong,
        vehicle,
    )

    key = FQ(
        1997011358982923168928344992199991480689546837621580239342656433234255379025
    )
    sk = PrivateKey(key)
    sig = sk.sign(msg)

    pk = PublicKey.from_private(sk)

    signed_msg = return_signature_for_zokrates_cli(pk, sig, msg)

    protobuf_msg = convert__to_protobuf(
        {
            "header": {
                "event_type": "DEVICE_DATA",
                "token": "w3b_MV8xNzIwMTcxODE2XyRnPGRsN2p6UTczOA",
                "timestamp": int(time.time()),
            },
            "payload": {
                "timestamp": str(int(time.time())),
                "pebbleId": "98765",
                "message": signed_msg,
            },
        }
    )

    send(protobuf_msg, 1)
    print("message send...")


gps_json_string = """{
    "imei": 0,
    "latitude": 0,
    "longitude": 0,
    "altitude": 0,
    "utc": 0
}"""


def read_from_json():
    with open('gps.json', 'r') as file:
        data = json.load(file)
        print(f"Latitude: {data['latitude']}, Longitude: {data['longitude']}")
        return data['latitude'], data['longitude']

logfile = "resource_usage_test_1.log"

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

def send_location_message():
    try:
        while not stop_event.is_set():
            time.sleep(10)
            start(*read_from_json())
    except Exception as e:
        print(f"Error in send_location_message: {e}")

def stopp_app():
    try:
        while not stop_event.is_set():
            time.sleep(600) #10 Min
            print("Time is up.")
            stop_event.set()
            sys.exit(0)
    except Exception as e:
        print(f"Error in stopp_app: {e}")

write_log_thread = threading.Thread(target=write_log)
send_message_thread = threading.Thread(target=send_location_message)
stopp_app_thread = threading.Thread(target=stopp_app)

try:
    write_log_thread.start()
    send_message_thread.start()
    stopp_app_thread.start()

except TypeError as e:
        print(f"Caught an error: {e}")

except AttributeError as e:
        print(f"Caught an error: {e}")
