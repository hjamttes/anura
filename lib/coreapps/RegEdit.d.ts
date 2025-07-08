declare function hasChildren(entry: any[]): boolean;
declare const DisclosureGroup: Component<{
    entry: any[];
    sel: {
        [key: string]: any;
    };
    level?: number;
}>;
declare class RegEdit extends App {
    name: string;
    package: string;
    icon: string;
    css: string;
    constructor();
    state: Stateful<{
        selected: {
            [key: string]: any;
        };
    }>;
    page: () => Promise<JSX.Element>;
    open(): Promise<WMWindow | undefined>;
}
