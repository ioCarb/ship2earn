# compile circuit
download the [zokrates-cli](https://github.com/Zokrates/ZoKrates/releases/) to compile your `root.zok` and perform the setup phase

## compile

```bash
./zokrates compile --stdlib-path stdlib -i root.zok
```

## perform the setup phase

```bash
./zokrates setup
```

# create config

## build ioctl

- clone iotex-core

```bash
git@github.com:ioCarb/iotex-core.git
```

- compile ioctl in the iotex-core folder do

```bash
make ioctl
```

- the binary will be `iotex-core/bin/ioctl`, you can execute it from there or copy it to some location in your `$PATH`

## create a config file using ioctl:

the order doesn't matter and the default values for `-p` and `-k` are the same as below so feel free to not set these options the `-e` field field is used for the proving scheme. Just use `ioctl ws procject config --help` for help

```bash
ioctl ws project config -t "zokrates" -i out -e "g16" -p proving.key -k verification.key
```

copy the output config (default: `zokrates-config.json`) to `test/projects/20000`

# "integrate" zokrates-sprout

when you're in the the parent folder of sprout

```bash
git clone git@github.com:ioCarb/zokrates-sprout.git
```

# start sprout
- if you have run sprout before, make sure the `postgres` folder is deleted (you need to be root for this). (otherwise the docker build stage might throw errors)
- stop and delete all docker containers (not sure if this is needed 🤷)

```bash
[ -n "$(sudo docker ps -a -q)" ] && sudo docker stop $(sudo docker ps -a -q) || echo "No containers to stop" && [ -n "$(sudo docker ps -a -q)" ] && sudo docker rm $(sudo docker ps -a -q) || echo "No containers to remove"
```

- build, start and monitor sprout
    

```bash
docker-compose build && docker compose -f docker-compose.yaml up -d && docker-compose logs -f coordinator sequencer prover zokrates
```

    
because of zokrates' compile times this will take forever, but if you dont change the zokrates-sprout code, the image/container will be cached

# send data

in a different window/tab run:


```bash
ioctl ws message send --project-id 20000 --project-version "0.1" --data "337 113569"
```

and look at the output of the docker log to see the generated proof
