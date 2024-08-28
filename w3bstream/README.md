# requirements
- docker and docker-compose
# compile circuit
download the [zokrates-cli](https://github.com/Zokrates/ZoKrates/releases/) to compile your `root.zok` and perform the setup phase

## compile

```bash
./zokrates compile --stdlib-path stdlib -i root.zok
```

## perform zokrates setup

```bash
./zokrates setup
```

# obtain w3btream

clone our w3bstream fork

```bash
git clone --depth 5 https://github.com/ioCarb/w3bstream
```

# create config

## build ioctl

- clone our `iotex-core` fork

```bash
git clone --depth 5 https://github.com/ioCarb/iotex-core.git
```

- to compile ioctl, `cd` to the iotex-core folder and run:

```bash
make ioctl
```

- the binary will be `iotex-core/bin/ioctl`, you can execute it from there or copy it to some location in your `$PATH`

## create a config file using ioctl:

The default values for `-p` and `-k` are the same as selected below so feel free to not set these options. The `-e` field is used for the proving scheme. Just use `ioctl ws procject config --help` for help

```bash
ioctl ws project config -t "zokrates" -i out -e "g16" -p proving.key -k verification.key
```

copy the output config (default: `zokrates-config.json`) to `test/projects/20000` of your w3bstream folder

# "integrate" zokrates-sprout

when you're in the the parent folder of w3bstream run:

```bash
git clone https://github.com/ioCarb/zokrates-sprout.git
```

# starting w3bstream
- if you have run w3bstream before, make sure the `postgres` folder is deleted (you need to be root for this). (otherwise the docker build stage might throw errors)
- stop and delete all docker containers (not sure if this is needed on all systems 🤷)

```bash
[ -n "$(sudo docker ps -a -q)" ] && sudo docker stop $(sudo docker ps -a -q) || echo "No containers to stop" && [ -n "$(sudo docker ps -a -q)" ] && sudo docker rm $(sudo docker ps -a -q) || echo "No containers to remove"
```

- build, start and monitor w3bstream
    

```bash
docker-compose build && docker compose -f docker-compose.yaml up -d && docker-compose logs -f coordinator sequencer prover zokrates
```
    
because of zokrates' compile times (generating static code for momorphization) this step might take very long, but if you don't change the zokrates-sprout code, the built image/container will be cached

# send data

in a different window/tab run:

```bash
ioctl ws message send --project-id 20000 --project-version "0.1" --data "337 113569"
```

and look at the output of the docker log to see the generated proof
