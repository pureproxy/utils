[![Follow on Twitter](https://img.shields.io/twitter/follow/pdp.svg?logo=twitter)](https://twitter.com/pdp)
[![NPM](https://img.shields.io/npm/v/@pureproxy/utils.svg)](https://www.npmjs.com/package/@pureproxy/utils)

# Utils

Collection of utills for PureProxy.

## How To Install

You need to install this library as a dependency like this:

```
$ npm install @pureproxy/utils
```

## How To Use

Here is a practical example how to intercept requests and responses:

```javascript
const MitmProxy = require('@pureproxy/mitmproxy')
const Interceptor = require('@pureproxy/utils/lib/interceptor')

const { HTTPParser, methods } = process.binding('http_parser')

const kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0
const kOnBody = HTTPParser.kOnBody | 0
const kOnMessageComplete = HTTPParser.kOnMessageComplete | 0

const server = new class extends MitmProxy {
  makeRequestParser() {
    const requestParser = new HTTPParser(HTTPParser.REQUEST)

    requestParser[kOnHeadersComplete] = (...args) => {
      console.log('>>>', ...args)
    }

    requestParser[kOnBody] = (buffer, start, len) => {
      buffer = buffer.slice(start, start + len)

      console.log('>>>', buffer.toString())
    }

    requestParser[kOnMessageComplete] = () => {
      console.log('>>> ~')
    }

    return requestParser
  }

  makeResponseParser() {
    const responseParser = new HTTPParser(HTTPParser.RESPONSE)

    responseParser[kOnHeadersComplete] = (...args) => {
      console.log('<<<', ...args)
    }

    responseParser[kOnBody] = (buffer, start, len) => {
      buffer = buffer.slice(start, start + len)

      console.log('<<<', buffer.toString())
    }

    responseParser[kOnMessageComplete] = () => {
      console.log('<<< ~')
    }

    return responseParser
  }

  wrapClientForObservableStreaming(client, { hostname, port, context }) {
    const requestParser = this.makeRequestParser()
    const responseParser = this.makeResponseParser()

    return new class extends Interceptor {
      constructor() {
        super(client)

        this.writeFore = this._writeFore
        this.writeBack = this._writeBack

        this.writeFore = this._sniffIt
      }

      _sniffIt(data) {
        this.writeFore = this._writeFore

        this.writeFore(data)
      }

      _writeFore(data) {
        requestParser.execute(data)

        super.writeFore(data)
      }

      _writeBack(data) {
        responseParser.execute(data)

        super.writeBack(data)
      }
    }
  }

  shouldIntercept(hostname, port, context) {
    return true
  }
}

server.listen(8080)
```
