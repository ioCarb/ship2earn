# requirements
you need
- docker and docker-compose
- golang

## obtaining w3btream

clone our w3bstream fork

```bash
git clone --depth 5 https://github.com/ioCarb/w3bstream
```

## build ioctl

- clone our `iotex-core` fork

```bash
git clone --depth 5 https://github.com/ioCarb/iotex-core.git
```

- to compile ioctl, `cd` to the iotex-core folder and run:

```bash
make ioctl
```

- set the endpoint to be the local w3btream docker container

```bash
ioctl config set wsEndpoint 'localhost:9000'
```

- the binary will be `iotex-core/bin/ioctl`, you can execute it from there or copy it to some location in your `$PATH`
