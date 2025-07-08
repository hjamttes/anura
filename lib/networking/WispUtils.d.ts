declare const wisp: {
    CONNECT: number;
    DATA: number;
    CONTINUE: number;
    CLOSE: number;
    INFO: number;
    TCP: number;
    UDP: number;
    textde: TextDecoder;
    texten: TextEncoder;
    errors: {
        1: string;
        3: string;
        65: string;
        66: string;
        67: string;
        68: string;
        71: string;
        72: string;
        73: string;
    };
    parseIncomingPacket(data: Uint8Array): {
        packetType: number;
        streamID: number;
        streamType: number;
        port: number;
        hostname: string;
        payload?: undefined;
        remainingBuffer?: undefined;
        reason?: undefined;
        infoObj?: undefined;
    } | {
        packetType: number;
        streamID: number;
        payload: Uint8Array<ArrayBufferLike>;
        streamType?: undefined;
        port?: undefined;
        hostname?: undefined;
        remainingBuffer?: undefined;
        reason?: undefined;
        infoObj?: undefined;
    } | {
        packetType: number;
        streamID: number;
        remainingBuffer: number;
        streamType?: undefined;
        port?: undefined;
        hostname?: undefined;
        payload?: undefined;
        reason?: undefined;
        infoObj?: undefined;
    } | {
        packetType: number;
        streamID: number;
        reason: number;
        streamType?: undefined;
        port?: undefined;
        hostname?: undefined;
        payload?: undefined;
        remainingBuffer?: undefined;
        infoObj?: undefined;
    } | {
        packetType: number;
        streamID: number;
        infoObj: any;
        streamType?: undefined;
        port?: undefined;
        hostname?: undefined;
        payload?: undefined;
        remainingBuffer?: undefined;
        reason?: undefined;
    };
    createWispPacket(instructions: any): Uint8Array<ArrayBuffer>;
};
