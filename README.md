# SpreadJs

If the command `yarn start` or `yarn build` will fail due to memory availability check [this](https://stackoverflow.com/questions/38558989/node-js-heap-out-of-memory#38560292)

Details: [V8 options](https://nodejs.org/docs/latest-v14.x/api/cli.html#cli_useful_v8_options)

Set the env variable **NODE_OPTIONS** with:

```sh
--max-old-space-size=4096
```

or:

```sh
--max-old-space-size=8192
```

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
