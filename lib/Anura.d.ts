declare class Anura {
    version: {
        semantic: {
            major: string;
            minor: string;
            patch: string;
        };
        buildstate: string;
        codename: string;
        readonly pretty: string;
    };
    initComplete: boolean;
    x86: null | V86Backend;
    settings: Settings;
    fs: AnuraFilesystem;
    config: any;
    notifications: NotificationService;
    x86hdd: FakeFile;
    net: Networking;
    platform: Platform;
    ui: AnuraUI;
    processes: Processes;
    dialog: Dialog;
    sw: SWProcess;
    anurad: Anurad;
    systray: Systray;
    uri: URIHandlerAPI;
    files: FilesAPI;
    wm: WMAPI;
    ContextMenu: typeof ContextMenu;
    private constructor();
    static new(config: any): Promise<Anura>;
    apps: any;
    libs: any;
    logger: {
        log: any;
        debug: any;
        info: any;
        warn: any;
        error: any;
        createStreams: (prefix?: string) => {
            stdout: WritableStream<any>;
            stderr: WritableStream<any>;
        };
    };
    registerApp(app: App): Promise<App>;
    registerExternalApp(source: string): Promise<ExternalApp | ShortcutApp>;
    registerExternalAppHandler(id: string, handler: string): void;
    registerLib(lib: Lib): Promise<Lib>;
    registerExternalLib(source: string): Promise<ExternalLib>;
    removeStaleApps(): void;
    import(packageName: string, searchPath?: string): Promise<any>;
    get wsproxyURL(): any;
}
declare class SWProcess extends Process {
    pid: number;
    title: string;
    constructor();
    kill(): void;
    get alive(): boolean;
}
