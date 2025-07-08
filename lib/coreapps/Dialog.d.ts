type ProgressObject = {
    title: string;
    detail: string;
    progress: number;
};
declare class Dialog extends App {
    name: string;
    package: string;
    icon: string;
    source: string;
    hidden: boolean;
    css: string;
    constructor();
    private getFit;
    alert(message: string, title?: string): void;
    confirm(message: string, title?: string): Promise<boolean>;
    prompt(message: string, defaultValue?: any): Promise<any>;
    progress(title: string, detail?: string): Stateful<ProgressObject>;
}
