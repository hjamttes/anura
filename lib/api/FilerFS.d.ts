declare class FilerAFSProvider extends AFSProvider<any> {
    domain: string;
    name: string;
    version: string;
    fs: FilerFS;
    constructor(fs: FilerFS);
    promises: {
        appendFile: (path: string, data: Uint8Array, options: {
            encoding: string;
            mode: number;
            flag: string;
        }) => Promise<void>;
        access: (path: string, mode?: number) => Promise<void>;
        chown: (path: string, uid: number, gid: number) => Promise<void>;
        chmod: (path: string, mode: number) => Promise<void>;
        link: (srcPath: string, dstPath: string) => Promise<void>;
        lstat: (path: string) => Promise<TStats>;
        mkdir: (path: string, mode?: number) => Promise<void>;
        mkdtemp: (prefix: string, options?: {
            encoding: string;
        }) => Promise<string>;
        mknod: (path: string, mode: number) => Promise<void>;
        readdir: (path: string, options?: {
            encoding: string;
            withFileTypes: boolean;
        }) => Promise<string[]>;
        readFile: (path: string) => Promise<Uint8Array<ArrayBufferLike>>;
        readlink: (path: string) => Promise<string>;
        removexattr: (path: string, name: string) => Promise<void>;
        rename: (oldPath: string, newPath: string) => Promise<void>;
        rmdir: (path: string) => Promise<void>;
        stat: (path: string) => Promise<TStats>;
        symlink: (srcPath: string, dstPath: string, type?: string) => Promise<void>;
        truncate: (path: string, len: number) => Promise<void>;
        unlink: (path: string) => Promise<void>;
        utimes: (path: string, atime: number | Date, mtime: number | Date) => Promise<void>;
        writeFile: (path: string, data: Uint8Array | string, options: {
            encoding: string;
            mode: number;
            flag: string;
        }) => Promise<void>;
    };
}
