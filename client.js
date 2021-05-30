//Node.js
const net = require('net');
const dgram = require('dgram');
const event = require('events');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
   
//NPM
const md5 = require('md5')
const yargs = require('yargs');
const { alias } = require('yargs');

/**
 * Promise based TCP socket messaging
 * 
 * @param {net.Socket} client 
 * @param {String} message 
 * @returns 
 */
const writeSocket = (client,message) => { 

    verbose && console.debug(`Sending ${message}`)

    return new Promise((resolve,reject) => { 
        try{
            //Messages should en with new line
            client.write(`${message}\n`);

            client.once('error', e => { 
                throw new Error(e)
                reject(e)
            })

            client.once('data', data => {
                verbose && console.debug(`Promise data:\n${data}`)
                //We slide end of line and split message
                data = data.toString(defaultEncoding).slice(0,-1).split(' ');
                resolve({
                    code: data[0],
                    //Message should have only 2 parts so we rejoin spaces
                    message: data.slice(1).join(' ') 
                })
            });
            
        }
        catch (error){
            console.error(error)
            reject(error)
        }
    })
}

const main = async(tcp_server, tcp_port, username, udp_port) => {

    //Sockets
    const tcpSocket = new net.Socket();
    const udpSocket = dgram.createSocket('udp4');

    const eventEmitter = new event.EventEmitter()

    let response;
    //let udpMessage;
    
    //Close conexion on 20s
    tcpSocket.setTimeout(20000)

    //When a UDP Datagram is received handle accordingly
    udpSocket.on('message', (msg,rinfo) => {

        verbose && console.debug(`UDP listen: ${msg} from ${rinfo.address}:${rinfo.port}`)

        udpMessage = Buffer.from(msg.toString(),'base64').toString(defaultEncoding)
        verbose && console.debug(`UDP Mensaje: ${udpMessage}`)
        //We verify with checksum
        eventEmitter.emit('udp_decoded',udpMessage)
        
    })

    //When a UDP is decoded send cheksum to server
    eventEmitter.on('udp_decoded', async udpMessage => {
        response = await writeSocket(tcpSocket,`chkmsg ${md5(udpMessage)}`)
        if (response.code === 'ok'){
            console.log(`Here is your message:\n${udpMessage}\n`)
            response = await writeSocket(tcpSocket,'bye')
            if (response.code === 'ok'){
                console.log('Goodbye! Have a nice day! :D')
                tcpSocket.end( () => { process.exit(0)})
            }
        }
        else if (response.code === 'error'){
            console.error(`Message was not received correctly. ${response.message}`)
        }
        else {
            console.error('Server responded with a unknown response')
        }
    })

    //TCP timeout handler
    tcpSocket.on('timeout', ()=>{
        tcpSocket.end( () => {
            console.error('Server did not sent any more data. Check your connection or try again later (1)')
        })
    })

    //TCP Error handler
    tcpSocket.on('error', (e) => {
        console.error('TCP Socket error')
        verbose && console.error(e)
    })

    tcpSocket.connect(tcp_port,tcp_server, async () =>{
        verbose && console.debug(`Remote port is accessible: ${process.argv[2]}:${process.argv[3]}`);
        //We authenticate to server
        response = await writeSocket(tcpSocket,`helloiam ${username}`)

        if (response.code === 'ok') {
            
            //Ask server for message length
            response = await writeSocket(tcpSocket,'msglen')
        
            if (response.code === 'ok'){
                console.log('Requesting your message...')
                //We enable UDP Port by user or default to O.S. generated
                udpSocket.bind(udp_port? udp_port:0);

                //Handle UDP Socket ready event
                udpSocket.on('listening', async () => {
                    //We set up UDP Datagram buffer
                    udpSocket.setRecvBufferSize(parseInt(response.message))

                    //We obtain the socket binded information
                    const address = udpSocket.address()
                    verbose && console.debug(`server listening ${address.address}:${address.port}`);

                    //We ask server for message to the assigned port
                    response = await writeSocket(tcpSocket,`givememsg ${address.port}`)
                    if (response.code === 'ok'){
                        console.log('Message received!')
                    }
                    else if (response.code === 'error'){
                        console.error(`A network error ocurred. Try again later or verify your settings. Details: ${response.message}`)
                    }
                    else console.error('Server responded with a unknown response')

                    //We set a custom timeout to our listener
                    setTimeout(() => {
                        udpSocket.close()
                        console.error('Server timeout. Server did not sent any data. Check your connection or try again later (1)')
                    }, 20000)
                })

            }
            else if (response.code === 'error') {
                console.error('There was a problem with the server. Please try again later')
            }
            else console.error('Server responded with a unknown response')
        }
        //Auth failed
        else if (response.code === 'error') {
            console.error(`An error ocurred. Details: ${response.message}`)
        }
        else console.error('Server responded with a unknown response')
        
    });

}

//MAIN PROGRAM

const argv = yargs
    .option('tcp-server', {
        alias: ['s','server'],
        description: 'TCP Host IP Address or name',
        type: 'string',
        default: '127.0.0.1'
    })
    .option('tcp-port', {
        alias: 'p',
        description: 'Host TCP Port',
        type: 'number',
        default: 19876
    })
    .option('udp-port', {
        alias: 'u',
        description: 'UDP Port to open on system. If 0 the O.S. will assign available port.',
        type: 'number',
        default: 0
    })
    .option('server-encoding', {
        alias: ['e','encoding'],
        description: 'Host encoding',
        type: 'string',
        choices: ['utf8','utf-8','utf16le','utf-16le','latin'],
        default: 'utf8'
    })
    .option('verbose',{
        alias: 'v',
        description: 'Prints debugging information',
        type: 'boolean',
        default: false
    })
    .help()
    .alias('help','h')
    .argv;

const tcp_server = argv.tcpServer
const tcp_port = argv.tcpPort
const udp_port = argv.udpPort
const defaultEncoding = argv.serverEncoding
const verbose = argv.verbose

let username


verbose && console.debug('---- TCP/UDP CLIENT RUNNING CONFIG-----')
verbose && console.table({'TCP SERVER': tcp_server,'TCP PORT': tcp_port, 'UDP PORT': udp_port? udp_port:'Automatic','Server encoding': defaultEncoding})


rl.question('Please enter your username:\n', answer => {
    rl.close()
    try{
        main(tcp_server,tcp_port,answer,udp_port);
    }
    catch(error){
        console.log('Fatal error')
        verbose && console.error(error)
        process.exit(1)
    }
})

