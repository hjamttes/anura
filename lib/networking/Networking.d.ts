declare class Networking {
    libcurl: any;
    libcurl_src: string;
    libcurl_wasm: string;
    external: {
        fetch: ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) & typeof fetch;
    };
    WebSocket: typeof WebSocket;
    Socket: any;
    TLSSocket: any;
    bus: WispBus;
    WSProxyEmulation: any;
    constructor(wisp_server: string);
    loopback: {
        addressMap: Map<any, any>;
        call: (port: number, request: Request) => Promise<any>;
        set: (port: number, handler: () => Response) => Promise<void>;
        deregister: (port: number) => Promise<void>;
    };
    fetch: (url: any, methods: any) => Promise<any>;
    setWispServer: (wisp_server: string) => void;
}
