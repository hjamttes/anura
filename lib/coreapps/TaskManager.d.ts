declare class TaskManager extends App {
    name: string;
    package: string;
    icon: string;
    css: string;
    constructor();
    state: Stateful<{
        selected: number;
    }>;
    page: () => Promise<JSX.Element>;
    open(args?: string[]): Promise<WMWindow | undefined>;
}
declare const createResizableTable: (table: HTMLElement) => void;
