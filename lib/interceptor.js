const stream = require('stream')

class Interceptor extends stream.Duplex {
    writeFore(data) {
        this.socket.write(data)
    }

    writeBack(data) {
        this.push(data)
    }

    constructor(socket) {
        super()

        this.socket = socket

        this.socket.on('data', (data) => {
            this.writeBack(data)
        })

        ; // WTF

        [
            'lookup',
            'connect',
            'ready',
            'timeout',
            'error',
            'end',
            'close'
        ].forEach((event) => this.socket.on(event, (...args) => this.emit(event, ...args)))
    }

    _write(data, encoding, callback) {
        this.writeFore(data)

        callback()
    }

    _read() {}
}

module.exports = Interceptor
