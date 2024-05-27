import hashlib
import os
import json
import random



from zokrates_pycrypto.eddsa import PrivateKey, PublicKey
from zokrates_pycrypto.field import FQ
from zokrates_pycrypto.utils import write_signature_for_zokrates_cli, to_bytes

pebble_path = os.path.join(os.pardir, 'pebble-simulator/pebble.dat')

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


if __name__ == "__main__":

    print("=================== Original Data ===================")
    json_objects = []

    with open(pebble_path, 'r') as file:
        for row in file:
            json_objekt = json.loads(row)
            json_objects.append(json_objekt)

    for i, object in enumerate(json_objects):
        if i == 0:
            latitude1 = object['message']['latitude']
            longitude1 = object['message']['longitude']
            print(f"Latitude 1: {latitude1}, Longitude 1: {longitude1}")
        elif i == 1:
            latitude2 = object['message']['latitude']
            longitude2 = object['message']['longitude']
            print(f"Latitude 2: {latitude2}, Longitude 2: {longitude2}\n")

    lat1 = convert_lat(latitude1)
    long1 = convert_lon(longitude1)
    lat2 = convert_lat(latitude2)
    long2 = convert_lon(longitude2)

    print("Shifting the latitude range from -90...90 to 0...180 and move the decimal places")
    print("Shifting the longitude range from -180...180 to 0...360 and move the decimal places\n")

    print("=========== converted to unsigned integers ==========")
    print(f"Latitude 1: {lat1}, Longitude 1: {long1}")
    print(f"Latitude 2: {lat2}, Longitude 2: {long2}\n")

    #placeholder=byte_repr(11111111)
    blat1 = byte_repr(lat1)
    blong1 = byte_repr(long1)
    blat2 = byte_repr(lat2)
    blong2 = byte_repr(long2)
    vehicle = byte_repr(randome_vehicle()) 

    print("================= converted to bytes ================")
    #print("Placeholder:", placeholder)
    print(f"Latitude 1: {blat1}, Longitude 1: {blong1}")
    print(f"Latitude 2: {blat2}, Longitude 2: {blong2}\n")

    msg = to_bytes(blat1, blat1, blat1, blat1, blong1, blong1, blong1, blong1, blat2, blat2, blat2, blat2, blong2, blong2, blong2, vehicle)

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

    print('============== vehicle type =============')
    if vehicle == byte_repr(1):
        print("Bike")
    elif vehicle == byte_repr(2):
        print("E-Scooter")
    elif vehicle == byte_repr(3):    
        print("Scooter")
    elif vehicle == byte_repr(4):    
        print("Car")
        

    is_verified = pk.verify(sig, msg)
    print(is_verified)

    path = 'zokrates_inputs.txt'
    write_signature_for_zokrates_cli(pk, sig, msg, path)