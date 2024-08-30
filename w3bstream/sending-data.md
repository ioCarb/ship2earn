# sending data to w3bstream

put the message you intend to send in a file. For this [example](https://zokrates.github.io/gettingstarted.html#hello-zokrates) add `337 113569` to the input.txt file

in a different window/tab then the w3bstream docker log, run:

```bash
ioctl ws message send --project-id 20000 --project-version "0.1" --data "337 113569"
ioctl ws message send --project-id 20000 --project-version "0.1" --data input.txt
```

and look at the output of the docker log to see the generated proof be sent to the coordinator, which will then send the proof to the blockchain
