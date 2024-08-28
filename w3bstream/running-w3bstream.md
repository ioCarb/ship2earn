# running w3bstream

## "integrate" zokrates-sprout

[zokrates-sprout](https://github.com/ioCarb/zokrates-sprout) is an additional zksnark mechanism for w3bstream using ZoKrates developed by us.

when you're in the the parent folder of w3bstream run:

```bash
git clone https://github.com/ioCarb/zokrates-sprout.git
```

## set smart contract

	set the verifier smart-contract address as the `CONTRACT_WHITELIST` env var in the docker-compose.yaml. W3bstream will send the proof there.

```yaml
CONTRACT_WHITELIST=0xYOUR_ADDRESS
```

## start w3bstream

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

