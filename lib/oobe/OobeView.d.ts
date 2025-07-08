declare class OobeView {
    state: Stateful<{
        color: string;
        text: string;
        step: number;
        offlineEnabled: boolean;
        v86Enabled: boolean;
        localfsdriver: boolean;
        dlsize: string;
    }>;
    constructor();
    css: string;
    steps: {
        elm: JSX.Element;
        on: () => void;
    }[];
    element: JSX.Element;
    nextStep(): void;
    complete(): Promise<void>;
}
declare function installx86(tracker?: HTMLElement | null): Promise<void>;
declare function preloadFiles(tracker?: HTMLElement | null): Promise<void>;
