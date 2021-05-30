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
node client
```

### Flags

All flags can be used together and in any order. The parameters include the following:

* TCP Server

TCP Host IP Address or name
```bash
node client -s 10.0.0.10
```
```bash
node client --tcp-server 10.0.0.10
```

* TCP Port

Host TCP Port to send message.
```bash
node client -p 12345
```
```bash
node client --tcp-port 12345
```

* UDP Port

UDP Port to open on system. If 0 the O.S. will assign an available port.

```bash
node client -u 54321
```
```bash
node client --udp-port 54321
```

* Server encoding

Host encoding. Supported encodings are `utf-8`, `utf-16le` and `latin`. Options are displayed on help.

```bash
node client -e utf-8
```
```bash
node client --server-encoding utf-8
```

* Verbose

Prints debugging information
```bash
node client -v
```
* Help

This information is availble using `-h` or `--help`

## Server

Server implementation. Available soon.

## License
[MIT](https://choosealicense.com/licenses/mit/)