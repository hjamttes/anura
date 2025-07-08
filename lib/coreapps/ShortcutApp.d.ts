interface AnuraShortcut {
    name: string;
    command: string;
    icon?: string;
    console?: boolean;
}
declare function b26(s: string): string;
declare class ShortcutApp extends App implements AnuraShortcut {
    static launchShortcut(props: AnuraShortcut): Promise<any>;
    name: string;
    package: string;
    icon: string;
    console: boolean;
    command: string;
    constructor(filePath: string, props: AnuraShortcut);
    open(): Promise<void>;
}
