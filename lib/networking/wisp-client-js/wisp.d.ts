declare const packet_types: {
    CONNECT: number;
    DATA: number;
    CONTINUE: number;
    CLOSE: number;
};
declare const packet_names: (string | undefined)[];
declare function uint_from_array(array: any): any;
declare function array_from_uint(int: number, size: number): Uint8Array<ArrayBuffer>;
declare function concat_uint8array(...args: any): Uint8Array<ArrayBuffer>;
declare function create_packet(packet_type: any, stream_id: any, payload: any): Uint8Array<ArrayBuffer>;
declare class WispStream extends EventTarget {
    hostname: any;
    port: any;
    ws: any;
    buffer_size: any;
    stream_id: any;
    connection: any;
    stream_type: number;
    send_buffer: any[];
    open: boolean;
    onopen: () => void;
    onclose: () => void;
    onerror: () => void;
    onmessage: () => void;
    constructor(hostname: any, port: any, websocket: any, buffer_size: any, stream_id: any, connection: any, stream_type: number);
    send(data: any): void;
    continue_received(buffer_size: any): void;
    close(reason?: number): void;
}
declare class WispConnection extends EventTarget {
    wisp_url: any;
    max_buffer_size: null;
    active_streams: any;
    connected: boolean;
    connecting: boolean;
    next_stream_id: number;
    ws: any;
    constructor(wisp_url: any);
    connect_ws(): void;
    close_stream(stream: {
        open: boolean;
        dispatchEvent: (arg0: CloseEvent) => void;
        stream_id: string | number;
    }, reason: number | undefined): void;
    on_ws_close(): void;
    create_stream(hostname: string | undefined, port: number, type?: string): WispStream;
    on_ws_msg(event: {
        data: any;
    }): void;
}
