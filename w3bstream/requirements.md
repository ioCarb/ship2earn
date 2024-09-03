# requirements
you need
- docker and docker-compose
- golang

## obtaining w3btream

clone our w3bstream fork

```bash
git clone --depth 5 https://github.com/ioCarb/sprout
```

## build ioctl

- clone our `iotex-core` fork

```bash
git clone --depth 5 https://github.com/ioCarb/iotex-core-old.git
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

> **_NOTE:_** Please keep in mind, that these versions are not up to date with the iotex upstream. This is mostly due to undocumented, workflow breaking changes, for example when using the ioctl command line tool where the `-t` flag in the  [upstream code](https://github.com/iotexproject/iotex-core/blob/778b8eeb9de57187c0ba232c20ae5ebbac17af30/ioctl/cmd/ws/wsprojectconfig.go#L134) expects a number representing a zkp mechanism but the [official documentation](https://docs.iotex.io/depin-infra-modules-dim/w3bstream-depin-verification/build-with-w3bstream/deploy-to-w3bstream/create-the-project-file#risc-zero-provers) a string.
