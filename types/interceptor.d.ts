/// <reference types="node" />
export class Interceptor extends stream.Duplex {
    constructor(socket: any);
    writeFore(data: any): Promise<void>;
    writeBack(data: any): Promise<void>;
    socket: any;
    _write(data: any, encoding: any, callback: any): Promise<void>;
    _read(): void;
}
export default Interceptor;
import stream from "stream";
