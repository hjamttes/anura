declare class WispBus {
    clientMappings: Map<any, any>;
    serverMappings: Map<any, any>;
    upstream: WebSocket | RTCDataChannel;
    lastGlobalID: number;
    lastUpstreamId: number;
    upstreamClients: Map<any, any>;
    virtualServerMapping: Map<any, any>;
    upstreamBuffer: number;
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;
    setUpstreamProvider(upstreamProvider: WebSocket | RTCDataChannel): void;
    handleOutgoingPacket(packet: Uint8Array, virtualServerID: number, packetCallBack?: any): null | undefined;
    handleIncomingPacket(packet: Uint8Array, sourceID: string): void;
    registerServer(regex: RegExp, id: string, handler: RTCDataChannel | WebSocket): void;
    getFakeWispProxySocket(): {
        new (): {
            binaryType: string;
            readyState: number;
            bufferedAmount: number;
            virtualServerID: number;
            onopen: () => void;
            onmessage: () => void;
            onclose: () => void;
            send(data: any): void;
            close(code?: number, reason?: string): void;
            addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
            dispatchEvent(event: Event): boolean;
            removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
        };
    };
    getFakeWSProxySocket(): {
        new (url: any, protocols: any): {
            url: any;
            protocols: any;
            binaryType: string;
            stream: any;
            event_listeners: any;
            connection: any;
            onopen: (event: Event) => void;
            onerror: (event: Event) => void;
            onmessage: (event: Event) => void;
            onclose: (event: Event) => void;
            CONNECTING: number;
            OPEN: number;
            CLOSING: number;
            CLOSED: number;
            host: any;
            port: number;
            real_url: string;
            on_conn_close(): void;
            init_connection(): void;
            init_stream(): void;
            send(data: any): void;
            close(): void;
            readonly bufferedAmount: number;
            readonly extensions: string;
            readonly protocol: string;
            readonly readyState: number;
            addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
            dispatchEvent(event: Event): boolean;
            removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
        };
    };
    constructor(upstreamProvider: WebSocket | RTCDataChannel);
}
