# Node.js Socket Client

TCP and UDP Node.js client. 

Note: UDP messages are decoded from base64 and checked using MD5.

## Requirements

[Node.js](https://nodejs.org/en/) >= 12

## Installation

Use the package manager [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install.

```bash
npm install
```

## Usage

```bash
npm start
```

### Flags

All flags can be used together and in any order. The parameters include the following:

* TCP Server

TCP Host IP Address or name
```bash
npm start -- -s
```
```bash
npm start -- --tcp-server 10.0.0.10
```

* TCP Port

Host TCP Port to send message.
```bash
npm start -- -p 12345
```
```bash
npm start -- --tcp-port 12345
```

* UDP Port

UDP Port to open on system. If 0 the O.S. will assign an available port.

```bash
npm start -- -u 12345
```
```bash
npm start -- --udp-port 12345
```

* Server encoding

UDP Port to open on system. If 0 the O.S. will assign an available port.

```bash
npm start -- -e 12345
```
```bash
npm start -- --server-encoding 12345
```

* Verbose

Prints debugging information
```bash
npm start -- -v
```
* Help

This information is availble using `-h` or `--help`


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)