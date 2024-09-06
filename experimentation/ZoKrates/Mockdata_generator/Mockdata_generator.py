import hashlib
from zokrates_pycrypto.eddsa import PrivateKey, PublicKey
from zokrates_pycrypto.field import FQ
from zokrates_pycrypto.utils import write_signature_for_zokrates_cli, return_signature_for_zokrates_cli, to_bytes

if __name__ == "__main__":
    R_values = []
    S_values = []
    A_values = []
    M0_values = []
    M1_values = []
    input_values = {
        'Temperature': [],
        'Humidity': [],
        'Speed': [],
        'Acceleration': [],
        'HasMoved': [],
        'DeviceID': []
    }

    for x in range(5):
        Tempinputs = [20 + x] * 144
        Huminputs = [67 + x] * 144
        Speedinputs = [90 + x] * 144
        accelinputs = [101 + x] * 144
        hasmovedinputs = [1] * 144
        deviceID = [6969 + x]

        inputs = {
            'Temperature': Tempinputs,
            'Humidity': Huminputs,
            'Speed': Speedinputs,
            'Acceleration': accelinputs,
            'HasMoved': hasmovedinputs,
            'DeviceID': deviceID
        }

        # Collect inputs by type
        for key, value in inputs.items():
            input_values[key].extend(value)

        # Prepare input string for hashing
        input_string = ' '.join(map(str, [item for sublist in inputs.values() for item in sublist]))

        #Hashing in UTF-8?
        msg = hashlib.sha512(input_string.encode("utf-8")).digest()

        # Seeded for debug purpose
        key = FQ(1997011358982923168928344992199991480689546837621580239342656433234255379025)
        sk = PrivateKey(key)
        sig = sk.sign(msg)

        pk = PublicKey.from_private(sk)
        is_verified = pk.verify(sig, msg)

        signed_msg = return_signature_for_zokrates_cli(pk, sig, msg)
        signed_msg_split = signed_msg.split()

        R_values.extend(signed_msg_split[0:2])
        S_values.append(signed_msg_split[2])
        A_values.extend(signed_msg_split[3:5])
        M0_values.extend(signed_msg_split[5:13])
        M1_values.extend(signed_msg_split[13:21])

    #Walletaddress = [1005985697357705131861915430156080433505852968342]

    # Write outputs to file
    with open('signed_inputs.txt', 'w') as f:
        f.write('\n'.join(R_values) + "\n")
        f.write('\n'.join(S_values) + "\n")
        f.write('\n'.join(A_values) + "\n")
        f.write('\n'.join(M0_values) + "\n")
        f.write('\n'.join(M1_values) + "\n")
        for key, values in input_values.items():
            f.write('\n'.join(map(str, values)) + "\n")
        #f.write('\n'.join(map(str, Walletaddress)) + "\n")  