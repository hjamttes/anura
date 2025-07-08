interface ModuleProcessExports {
    main?: (args: string[]) => void;
}
type ModuleProcessFrame = HTMLIFrameElement & {
    contentWindow: Window & {
        moduleProcess: ModuleProcessExports;
    };
};
declare class Processes {
    processesDiv: JSX.Element;
    constructor();
    get procs(): Stateful<WeakRef<Process>[]>;
    set procs(value: Stateful<WeakRef<Process>[]>);
    state: Stateful<{
        procs: Stateful<WeakRef<Process>[]>;
    }>;
    remove(pid: number): void;
    register(proc: Process): void;
    create(script: string, type?: "common" | "module", args?: string[]): IframeProcess;
    execute(path: string, args?: string[], useLogger?: boolean): Promise<IframeProcess>;
}
declare abstract class Process {
    abstract pid: number;
    abstract title: string;
    stdout: ReadableStream<Uint8Array>;
    stderr: ReadableStream<Uint8Array>;
    stdin: WritableStream<Uint8Array>;
    kill(code?: number): void;
    get args(): string[];
    abstract get alive(): boolean;
}
/**
 * Dumb hack to convert utf-8 to base64
 */
declare function utoa(data: string): string;
declare class IframeProcess extends Process {
    #private;
    pid: number;
    script: string;
    title: string;
    frame: HTMLIFrameElement;
    constructor(script: string, type: "common" | "module" | undefined, pid: number, args?: string[]);
    kill(code?: number): void;
    get args(): string[];
    get alive(): boolean;
    get window(): Window;
    get document(): Document;
}
