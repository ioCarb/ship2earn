# Finamon GPS-4G-Hat
Enable SPI, I2C and interfaces and disable Seriel console, when asked say "No" and next "yes". 
```
sudo raspi-config
```
Clone the repo
```
git clone https://github.com/finamon-de/gps-4g-hat-library.git
cd gps-4g-hat-library/
```
Install the virtual environment and the following dependencies.

```
python3 -m venv .venv --system-site-packages
source .venv/bin/activate
python3 -m pip install pynmea2 python-dotenv pyserial gpiod smbus dist/gps4ghat-0.2.0-py3-none-any.whl
pip uninstall -y gpiod
sudo apt install -y python3-libgpiod
```
Create personal setting file.

```
nano .env
# TCP/IP context settings
# Use the variables below to configure your APN.
CONTEXT_APN="internet.blau.de" # wsim, emnify
CONTEXT_USERNAME=""
CONTEXT_PASSWORD=""

# Echo service settings
#ECHO_SERVER_IP=52.215.34.155
#ECHO_SERVER_PORT=7

# MQTT service settings
MQTT_BROKER="devnet-staging-mqtt.w3bstream.com"   # IP address of your MQTT broker
MQTT_PORT=1883 # MQTT default port

MQTT_CLIENT_ID="eth_0x8ef5b88a455fc8a0077c708d14d8355bfa725efd_raspi_test"  # your MQTT clie>
MQTT_USERNAME="raspi"   # your MQTT username
MQTT_PASSWORD="w3b_MV8xNzE3MTc3NzU5X3xvaG1oYi5EZEUnTw"   # your MQTT password
#publisher_name="raspi"
#topic="eth_0x8ef5b88a455fc8a0077c708d14d8355bfa725efd_raspi_test"
#token="w3b_MV8xNzE3MTc3NzU5X3xvaG1oYi5EZEUnTw"

# Note:
# The topics below are just examples. Please make sure
# that your MQTT service can handle them if you want
# to use them.
MQTT_TOPIC_RECEIVE=receive/
MQTT_TOPIC_GPS=gps/coordinates/
MQTT_TOPIC_SENSORS=sensors/acceleration/
```
Run a script.

```
python examples/demo_
```