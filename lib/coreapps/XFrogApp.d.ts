declare class XFrogApp extends App {
    name: string;
    package: string;
    icon: string;
    hidden: boolean;
    activeWin: WMWindow;
    xwindows: {
        [wid: string]: WMWindow;
    };
    constructor();
    startup(): Promise<void>;
    proc_xwids(wids: string[]): Promise<void>;
    spawn_xwindow(xwid: string): Promise<void>;
    open(): Promise<void>;
}
