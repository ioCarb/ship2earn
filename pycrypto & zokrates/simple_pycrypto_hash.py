import hashlib

from zokrates_pycrypto.eddsa import PrivateKey, PublicKey
from zokrates_pycrypto.field import FQ
from zokrates_pycrypto.utils import write_signature_for_zokrates_cli, return_signature_for_zokrates_cli, to_bytes


if __name__ == "__main__":

    raw_msg = "42"


    print("============== message that gets signed =============")
    print(raw_msg)
    msg = hashlib.sha512(raw_msg.encode("utf-8")).digest()

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

    print('================= inputs for zokrates ================')


    is_verified = pk.verify(sig, msg)
    #print(is_verified)

    path = 'zokrates_inputs_new.txt'
    #write_signature_for_zokrates_cli(pk, sig, msg)
    signed_msg = return_signature_for_zokrates_cli(pk, sig, msg)
    print(signed_msg + " " + raw_msg)