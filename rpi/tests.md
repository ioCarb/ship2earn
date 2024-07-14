# Test 1 - Every Position is signed

* Experiment duration: 10 min​ ​(Trip)
* Message Frequency: 10 s​
* Payload: signed ID, Timestamp, Longitude, Latitude​
* Memory: initial and last position ​

See [test1 devnet data - ZoKrates inputs](test1_devnet.txt) and [test1 monitoring data](test1_monitoring.txt).


# Test 2 - Only one distance is signed from the first and last position

* Experiment duration: 10 min​ ​(Trip)
* Message Frequency: 1 single message​
* Payload: signed ID, Timestamp, Distance between first and last position.​
* Memory: list of positions

See [test2 devnet data - ZoKrates inputs](test2_devnet.txt) and [test2 monitoring data](test2_monitoring.txt).

# Test 3 - Only one payload is signed, it contains all the distances in a 10s interval

* Experiment duration: 10 min ​(Trip)
* Message Frequency: 1 singe message​
* Payload: signed ID, Timestamp, Distance between last and actual position.​
* Memory: list of positions

See [test3 devnet data - ZoKrates inputs](test3_devnet.txt) and [test3 monitoring data](test3_monitoring.txt).