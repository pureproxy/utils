import stream from 'stream'

export class Interceptor extends stream.Duplex {
  async writeFore(data) {
    this.socket.write(data)
  }

  async writeBack(data) {
    this.push(data)
  }

  constructor(socket) {
    super()

    this.socket = socket

    this.socket.on('data', async (data) => {
      await this.writeBack(data)
    }) // WTF
    ;['lookup', 'connect', 'ready', 'timeout', 'error', 'end', 'close'].forEach(
      (event) => this.socket.on(event, (...args) => this.emit(event, ...args))
    )
  }

  async _write(data, encoding, callback) {
    await this.writeFore(data)

    callback()
  }

  _read() {}
}

export default Interceptor
