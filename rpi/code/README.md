Clone the pyCrypto repo
```
git clone https://github.com/Zokrates/pycrypto.git
```

Enable SPI, I2C and interfaces and disable Seriel console, when asked say "No" and next "yes". 
```
sudo raspi-config
```
Clone the GPS repo
```
git clone https://github.com/finamon-de/gps-4g-hat-library.git
cd gps-4g-hat-library/
```
Install the virtual environment and the following dependencies.

```
python3 -m venv .venv --system-site-packages
source .venv/bin/activate
python3 -m pip install pynmea2 python-dotenv pyserial gpiod smbus tensorboard_logger

pip uninstall -y gpiod numpy
pip install numpy paho-mqtt bitstring pynmea2 numpy==2.0
sudo apt install -y python3-libgpiod libopenblas-base

```

copy all the files to the gps-4g-hat-library folder.

Newer code of BG77X.py throws errors. Take the 2 year old one.

UMTS Stick
```
sudo apt install -y wvdial
sudo nano /etc/wvdial.conf
```
wvdial.conf
```
[Dialer Defaults]
Init1 = ATZ
Init2 = ATQ0 V1 E1 S0=0 &C1 &D2 +FCLASS=0
Modem Type = USB Modem
Baud = 460800
New PPPD = yes
ISDN = 0

#[Dialer PIN]
#Init1 = AT+CPIN="XXXX" # meine pin

#[Dialer PINOFF]
#Init1 = AT+CLCK="SC",0,"XXXX"  #meine pin

#[Dialer PINON]
#Init1 = AT+CLCK="SC",1,"XXXX"  # meine pin

[Dialer umtseplus]
Modem = /dev/ttyUSB0
Dial Command = ATD
Carrier Check = no
Phone = *99#
Password = "eplus"
Username = "gprs"
Stupid Mode = 1
Init4 = AT+CGDCONT=1,"IP","internet.eplus.de"
Dial Attempts = 2
```
Connect to internet
```
wvdial -C /home/user/wvdial.conf umtseplus
```

