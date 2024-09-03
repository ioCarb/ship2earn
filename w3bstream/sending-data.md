# sending data to w3bstream

put the message you intend to send in a file. For this [example](https://zokrates.github.io/gettingstarted.html#hello-zokrates) add `337 113569` to the input.txt file

in a different window/tab then the w3bstream docker log, run:

```bash
./bin/ioctl ws message send --project-id 20000 --project-version "0.1" --data "$(cat input.txt)"
```

and look at the output of the docker log to see the generated proof be sent to the coordinator, which will then send the proof to the blockchain

if you dont want to save the input to an extra file just run:

```bash
./bin/ioctl ws message send --project-id 20000 --project-version "0.1" --data "337 113569"
```

> **_NOTE:_** Sometimes the messages wont arrive because some error occured during starting the w3bstream services. In this case you might want to try [running-w3bstream.md](./running-w3bstream.md) again.
