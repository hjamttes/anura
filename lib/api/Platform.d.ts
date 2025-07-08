declare class Platform {
    type: string;
    touchInput: boolean;
    state: Stateful<{
        fullscreen: boolean;
    }>;
    constructor();
}
