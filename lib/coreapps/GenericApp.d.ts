declare class GenericApp extends App {
    name: string;
    package: string;
    icon: string;
    hidden: boolean;
    constructor();
    open(args?: string[]): Promise<WMWindow | undefined>;
}
