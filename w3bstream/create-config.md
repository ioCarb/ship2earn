# creating a config

## create a config file using ioctl:

The default values for `-p` and `-k` are the same as selected below so feel free to not set these options. The `-e` field is used for the proving scheme. Just use `ioctl ws procject config --help` for help

```bash
ioctl ws project config -t "zokrates" -i out -e "g16" -p proving.key -k verification.key
```

copy the output config (default: `zokrates-config.json`) to `test/projects/20000` of your w3bstream folder

## modifying the config

to make w3bstream send the proof to the previously defined smart contract change the `output` field in the newly generated config like:

```json
"output": {
  "type": "ethereumContract",
  "ethereum": {
    "chainEndpoint": "https://babel-api.testnet.iotex.io",
    "contractAddress": "",
    "receiverContract": "",
    "contractMethod": "verifyTx",
    "contractAbiJSON": "[eth abi json]"
  }
}
```
the abi field doesn't matter for now as the `zokrates-sprout` service reads the abi from file system which, thus the abi needs to copied in your `zokrates-sprout` folder.
