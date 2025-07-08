declare const numberSymbol: unique symbol;
type AnuraFD = {
    fd: number;
    [numberSymbol]: string;
};
declare abstract class AnuraFSOperations<TStats> {
    abstract promises: {
        appendFile(path: string, data: Uint8Array, options: {
            encoding: string;
            mode: number;
            flag: string;
        }): Promise<void>;
        access(path: string, mode?: number): Promise<void>;
        chown(path: string, uid: number, gid: number): Promise<void>;
        chmod(path: string, mode: number): Promise<void>;
        link(srcPath: string, dstPath: string): Promise<void>;
        lstat(path: string): Promise<TStats>;
        mkdir(path: string, mode?: number): Promise<void>;
        mkdtemp(prefix: string, options?: {
            encoding: string;
        }): Promise<string>;
        readdir(path: string, options?: string | {
            encoding: string;
            withFileTypes: boolean;
        }): Promise<string[]>;
        readFile(path: string): Promise<Uint8Array>;
        readlink(path: string): Promise<string>;
        rename(oldPath: string, newPath: string): Promise<void>;
        rmdir(path: string): Promise<void>;
        stat(path: string): Promise<TStats>;
        symlink(srcPath: string, dstPath: string, type?: string): Promise<void>;
        truncate(path: string, len: number): Promise<void>;
        unlink(path: string): Promise<void>;
        utimes(path: string, atime: number | Date, mtime: number | Date): Promise<void>;
        writeFile(path: string, data: Uint8Array | string, options?: {
            encoding: string;
            mode: number;
            flag: string;
        }): Promise<void>;
    };
}
/**
 * Generic class for a filesystem provider
 * This should be extended by the various filesystem providers
 */
declare abstract class AFSProvider<TStats> extends AnuraFSOperations<TStats> {
    /**
     * This is the domain that the filesystem provider is responsible
     * for. The provider with the most specific domain
     * will be used to handle a given path.
     *
     * @example "/" If you want to handle the root filesystem
     *
     * @example "/tmp" If you want to handle everything under /tmp.
     * This will take precedence over the root filesystem.
     */
    abstract domain: string;
    /**
     * The name of the filesystem provider
     */
    abstract name: string;
    /**
     * The filesystem provider's version
     */
    abstract version: string;
}
declare class AFSShell {
    #private;
    env: any;
    cat(files: string[], callback: (err: Error | null, contents: string) => void): void;
    exec(path: string): void;
    find(path: string, options?: {
        /**
         * Regex to match file paths against
         */
        regex?: RegExp;
        /**
         * Base name to search for (match patern)
         */
        name?: string;
        /**
         * Folder to search in (match pattern)
         */
        path?: string;
        /**
         * Callback to execute on each file.
         */
        exec?: (path: string) => void;
    }, callback?: (err: Error | null, files: string[]) => void): void;
    find(path: string, callback?: (err: Error | null, files: string[]) => void): void;
    ls(dir: string, options?: {
        recursive?: boolean;
    }, callback?: (err: Error | null, entries: any[]) => void): void;
    ls(dir: string, callback?: (err: Error | null, entries: any[]) => void): void;
    mkdirp(path: string, callback: (err: Error | null) => void): void;
    rm(path: string, options?: {
        recursive?: boolean;
    }, callback?: (err: Error | null) => void): void;
    rm(path: string, callback?: (err: Error | null) => void): void;
    tempDir(callback?: (err: Error | null, path: string) => void): void;
    touch(path: string, options?: {
        updateOnly?: boolean;
        date?: Date;
    }, callback?: (err: Error | null) => void): void;
    touch(path: string, callback?: (err: Error | null) => void): void;
    cd(dir: string): void;
    pwd(): any;
    promises: {
        cat: (files: string[]) => Promise<string>;
        exec: (path: string) => Promise<void>;
        find: (path: string, options?: {
            regex?: RegExp;
            name?: string;
            path?: string;
            exec?: (path: string) => void;
        }) => Promise<string[]>;
        ls: (dir: string, options?: {
            recursive?: boolean;
        }) => Promise<string[]>;
        cpr: (src: string, dest: string, options?: any) => Promise<void>;
        mkdirp: (path: string) => Promise<void>;
        rm: (path: string, options?: {
            recursive?: boolean;
        }) => Promise<void>;
        touch: (path: string, options?: {
            updateOnly?: boolean;
            date?: Date;
        }) => Promise<void>;
    };
    constructor(options?: {
        env?: {
            [key: string]: string;
        };
    });
}
/**
 * Anura File System API
 *
 * This is fully compatible with Filer's filesystem API and,
 * by extension, most of the Node.js filesystem API. This is
 * a drop-in replacement for the legacy Filer API and should
 * be used in place of the Filer API in all new code.
 *
 * This API has the added benefit of type safety and a the ability
 * to register multiple filesystem providers. This allows for the
 * creation of virtual filesystems and the ability to mount filesystems
 * at arbitrary paths.
 */
declare class AnuraFilesystem implements AnuraFSOperations<any> {
    providers: Map<string, AFSProvider<any>>;
    fds: any;
    lastFd: 3;
    providerCache: {
        [path: string]: AFSProvider<any>;
    };
    whatwgfs: {
        fs: undefined;
        getFolder: () => Promise<any>;
        fileOrDirectoryFromPath: (path: string) => Promise<any>;
        directoryHandleFromPath: (path: string) => Promise<any>;
        fileHandleFromPath: (givenPath: string) => Promise<any>;
        showDirectoryPicker: (options: object) => Promise<any>;
        showOpenFilePicker: (options: object) => Promise<any>;
    };
    static Shell: typeof AFSShell;
    Shell: typeof AFSShell;
    constructor(providers: AFSProvider<any>[]);
    clearCache(): void;
    installProvider(provider: AFSProvider<any>): void;
    processPath(path: string): AFSProvider<any>;
    rename(oldPath: string, newPath: string, callback?: (err: Error | null) => void): void;
    ftruncate(fd: number, len: number, callback?: (err: Error | null) => void): void;
    truncate(path: string, len: number, callback?: (err: Error | null) => void): void;
    stat(path: string, callback?: (err: Error | null, stats: any) => void): void;
    fstat(fd: number, callback?: ((err: Error | null, stats: any) => void) | undefined): void;
    lstat(path: string, callback?: (err: Error | null, stats: any) => void): void;
    /** @deprecated fs.exists() is an anachronism and exists only for historical reasons. */
    exists(path: string, callback?: (exists: boolean) => void): Promise<void>;
    link(srcPath: string, dstPath: string, callback?: (err: Error | null) => void): void;
    symlink(path: string, ...rest: any[]): void;
    readlink(path: string, callback?: (err: Error | null, linkContents: string | undefined) => void): void;
    unlink(path: string, callback?: (err: Error | null) => void): void;
    rmdir(path: string, callback?: (err: Error | null) => void): void;
    mkdir(path: string, ...rest: any[]): void;
    access(path: string, ...rest: any[]): void;
    mkdtemp(...args: any[]): void;
    readdir(path: string, ...rest: any[]): void;
    close(fd: number, callback?: ((err: Error | null) => void) | undefined): void;
    open(path: string, flags: "r" | "r+" | "w" | "w+" | "a" | "a+", mode: number, callback?: ((err: Error | null, fd: number) => void) | undefined): void;
    open(path: string, flags: "r" | "r+" | "w" | "w+" | "a" | "a+", callback?: ((err: Error | null, fd: number) => void) | undefined): void;
    utimes(path: string, atime: number | Date, mtime: number | Date, callback?: (err: Error | null) => void): void;
    futimes(fd: number, ...rest: any[]): void;
    chown(path: string, uid: number, gid: number, callback?: (err: Error | null) => void): void;
    fchown(fd: number, ...rest: any[]): void;
    chmod(path: string, mode: number, callback?: (err: Error | null) => void): void;
    fchmod(fd: number, ...rest: any[]): void;
    fsync(fd: number, ...rest: any[]): void;
    write(fd: number, ...rest: any[]): Promise<void>;
    read(fd: number, ...rest: any[]): Promise<void>;
    readFile(path: string, callback?: (err: Error | null, data?: Uint8Array) => void): void;
    writeFile(path: string, data: Uint8Array | string, ...rest: any[]): void;
    appendFile(path: string, data: Uint8Array, ...rest: any[]): void;
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
        lstat: (path: string) => Promise<any>;
        mkdir: (path: string, mode?: number) => Promise<void>;
        mkdtemp: (prefix: string, options?: {
            encoding: string;
        }) => Promise<string>;
        open: (path: string, flags: "r" | "r+" | "w" | "w+" | "a" | "a+", mode?: number) => Promise<number>;
        readdir: (path: string, options?: string | {
            encoding: string;
            withFileTypes: boolean;
        }) => Promise<string[]>;
        readFile: (path: string) => Promise<Uint8Array<ArrayBufferLike>>;
        readlink: (path: string) => Promise<string>;
        rename: (oldPath: string, newPath: string) => Promise<void>;
        rmdir: (path: string) => Promise<void>;
        stat: (path: string) => Promise<any>;
        symlink: (srcPath: string, dstPath: string, type?: string) => Promise<void>;
        truncate: (path: string, len: number) => Promise<void>;
        unlink: (path: string) => Promise<void>;
        utimes: (path: string, atime: number | Date, mtime: number | Date) => Promise<void>;
        writeFile: (path: string, data: Uint8Array | string, options?: {
            encoding: string;
            mode: number;
            flag: string;
        }) => Promise<void>;
    };
}
