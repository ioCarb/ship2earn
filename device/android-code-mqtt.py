
import time
import paho.mqtt.client as mqtt
import event_pb2
import json
import random
import androidhelper as android

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

        print(dict["header"])

        # Populate header
        event.header.event_type = dict["header"]["event_type"]
        event.header.token = dict["header"]["token"]
        event.header.timestamp = dict["header"]["timestamp"]

        # Set payload
        payload = dict["payload"]

        event.payload = json.dumps(payload, ensure_ascii=False).encode('utf-8')

        # Serialize to bytes
        data = event.SerializeToString()
        # print(data)

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
        broker = '<W3bstream node host name>'
        topic = '<MQTT topic>'
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


if __name__ == "__main__":
    droid = android.Android()
    while True:
        droid.startLocating(1000,1)
        droid.eventWaitFor('location', int(9000))
        location = droid.readLocation().result
        data = str(location)
        
        obj_message = {"header": {
        "event_type": 'DEVICE_DATA',
        "token": '<Publisher Token>',
        "timestamp":123456,
    },
        "payload": {"timestamp":"1717351192","pebbleId":"987654","message": data}}
        ptb_message = convert__to_protobuf(obj_message)
        print(ptb_message)
        send(ptb_message, 1)

        
        
        time.sleep(3)    
    droid.stopLocating()


    
    
