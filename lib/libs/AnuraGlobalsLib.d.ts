/**
 * Export helpful global objects from the anura top level window
 */
declare class AnuraGlobalsLib extends Lib {
    icon: string;
    package: string;
    name: string;
    latestVersion: string;
    versions: {
        [x: string]: {
            /**
             * Run a top level eval to get a global object,
             * this is how you would get an object from the top level
             * before this library was created but this helper method
             * is more verbose and easier to explain.
             */
            getWithPath: any;
        };
    };
    constructor();
    getImport(version: string): Promise<any>;
}
