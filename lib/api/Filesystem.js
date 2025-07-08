"use strict";
const numberSymbol = Symbol.for("number");
class AnuraFSOperations {
}
/**
 * Generic class for a filesystem provider
 * This should be extended by the various filesystem providers
 */
class AFSProvider extends AnuraFSOperations {
}
class AFSShell {
    env = new Proxy({}, {
        get: (target, prop) => {
            if (prop === "set") {
                return (key, value) => {
                    target[key] = value;
                };
            }
            if (prop === "get") {
                return (key) => target[key];
            }
            if (prop in target) {
                return target[prop];
            }
            return undefined;
        },
        set: (target, prop, value) => {
            if (prop === "set" || prop === "get") {
                return false;
            }
            target[prop] = value;
            return true;
        },
    });
    #relativeToAbsolute(path) {
        if (path.startsWith("/")) {
            return path;
        }
        return (this.env.PWD + "/" + path).replace(/\/+/g, "/");
    }
    cat(files, callback) {
        let contents = "";
        let remaining = files.length;
        files.forEach((file) => {
            anura.fs.readFile(this.#relativeToAbsolute(file), (err, data) => {
                if (err) {
                    callback(err, contents);
                    return;
                }
                contents += data.toString() + "\n";
                remaining--;
                if (remaining === 0) {
                    callback(null, contents.replace(/\n$/, ""));
                }
            });
        });
    }
    // This differs from the Filer version, because here we can use the anura.files API to open the file
    // instead of evaluating the contents as js. The behaviour of the Filer version can be replicated by
    // registering a file provider that evaluates the contents as js.
    exec(path) {
        anura.files.open(this.#relativeToAbsolute(path));
    }
    find(path, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        callback ||= () => { };
        options ||= {};
        function walk(dir, done) {
            const results = [];
            anura.fs.readdir(dir, (err, list) => {
                if (err) {
                    done(err, results);
                    return;
                }
                let pending = list.length;
                if (!pending) {
                    done(null, results);
                    return;
                }
                list.forEach((file) => {
                    file = dir + "/" + file;
                    anura.fs.stat(file, (err, stat) => {
                        if (err) {
                            done(err, results);
                            return;
                        }
                        if (stat.isDirectory()) {
                            walk(file, (err, res) => {
                                results.push(...res);
                                pending--;
                                if (!pending) {
                                    done(null, results);
                                }
                            });
                        }
                        else {
                            results.push(file);
                            pending--;
                            if (!pending) {
                                done(null, results);
                            }
                        }
                    });
                });
            });
        }
        walk(this.#relativeToAbsolute(path), (err, results) => {
            if (err) {
                callback(err, []);
                return;
            }
            if (options.regex) {
                results = results.filter((file) => options.regex.test(file));
            }
            if (options.name) {
                results = results.filter((file) => file.includes(options.name));
            }
            if (options.path) {
                results = results.filter((file) => file.includes(options.path));
            }
            if (options.exec) {
                results.forEach((file) => options.exec(file));
            }
            else {
                callback(null, results);
            }
        });
    }
    ls(dir, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        callback ||= () => { };
        options ||= {};
        const entries = [];
        if (options.recursive) {
            this.find(dir, (err, files) => {
                if (err) {
                    callback(err, []);
                    return;
                }
                callback(null, files);
            });
        }
        else {
            anura.fs.readdir(this.#relativeToAbsolute(dir), (err, files) => {
                if (err) {
                    callback(err, []);
                    return;
                }
                if (files.length === 0) {
                    callback(null, []);
                    return;
                }
                let pending = files.length;
                files.forEach((file) => {
                    anura.fs.stat(this.#relativeToAbsolute(dir) + "/" + file, (err, stats) => {
                        if (err) {
                            callback(err, []);
                            return;
                        }
                        entries.push(stats);
                        pending--;
                        if (!pending) {
                            callback(null, entries);
                        }
                    });
                });
            });
        }
    }
    mkdirp(path, callback) {
        this.promises
            .mkdirp(path)
            .then(() => callback(null))
            .catch((err) => {
            callback(err);
        });
    }
    rm(path, options, callback) {
        path = this.#relativeToAbsolute(path);
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        callback ||= () => { };
        options ||= {};
        function walk(dir, done) {
            anura.fs.readdir(dir, (err, list) => {
                if (err) {
                    done(err);
                    return;
                }
                let pending = list.length;
                if (!pending) {
                    anura.fs.rmdir(dir, done);
                    return;
                }
                list.forEach((file) => {
                    file = dir + "/" + file;
                    anura.fs.stat(file, (err, stats) => {
                        if (err) {
                            done(err);
                            return;
                        }
                        if (stats.isDirectory()) {
                            walk(file, (err) => {
                                if (err) {
                                    done(err);
                                    return;
                                }
                                pending--;
                                if (!pending) {
                                    anura.fs.rmdir(dir, done);
                                }
                            });
                        }
                        else {
                            anura.fs.unlink(file, (err) => {
                                if (err) {
                                    done(err);
                                    return;
                                }
                                pending--;
                                if (!pending) {
                                    anura.fs.rmdir(dir, done);
                                }
                            });
                        }
                    });
                });
            });
        }
        anura.fs.stat(path, (err, stats) => {
            if (err) {
                callback(err);
                return;
            }
            if (!stats.isDirectory()) {
                anura.fs.unlink(path, callback);
                return;
            }
            if (options.recursive) {
                walk(path, callback);
            }
            else {
                anura.fs.readdir(path, (err, files) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    if (files.length > 0) {
                        callback(new Error("Directory not empty! Pass { recursive: true } instead to remove it and all its contents."));
                        return;
                    }
                });
            }
        });
    }
    tempDir(callback) {
        callback ||= () => { };
        const tmp = this.env.TMP;
        anura.fs.mkdir(tmp, () => {
            callback(null, tmp);
        });
    }
    touch(path, options, callback) {
        path = this.#relativeToAbsolute(path);
        if (typeof options === "function") {
            callback = options;
            options = {
                updateOnly: false,
                date: Date.now(),
            };
        }
        callback ||= () => { };
        options ||= {
            updateOnly: false,
            date: Date.now(),
        };
        function createFile() {
            anura.fs.writeFile(path, "", callback);
        }
        function updateTimes() {
            anura.fs.utimes(path, options.date, options.date, callback);
        }
        anura.fs.stat(path, (err) => {
            if (err) {
                if (options.updateOnly) {
                    callback(new Error("File does not exist and updateOnly is true"));
                    return;
                }
                else {
                    createFile();
                }
            }
            else {
                updateTimes();
            }
        });
    }
    cd(dir) {
        this.env.PWD = this.#relativeToAbsolute(dir);
    }
    pwd() {
        return this.env.PWD;
    }
    promises = {
        cat: async (files) => {
            let contents = "";
            for (const file of files) {
                contents += (await anura.fs.promises.readFile(this.#relativeToAbsolute(file))).toString();
            }
            return contents;
        },
        exec: async (path) => {
            anura.files.open(this.#relativeToAbsolute(path));
        },
        find: (path, options) => {
            return new Promise((resolve, reject) => {
                this.find(path, options, (err, files) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(files);
                });
            });
        },
        ls: (dir, options) => {
            return new Promise((resolve, reject) => {
                this.ls(dir, options, (err, entries) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(entries);
                });
            });
        },
        cpr: async (src, dest, options) => {
            try {
                const stat = await anura.fs.promises.stat(src);
                if (options?.createInnerFolder === true) {
                    try {
                        const destStat = await anura.fs.promises.stat(dest);
                        if (destStat.type === "DIRECTORY") {
                            dest = Filer.Path.join(dest, Filer.Path.basename(src));
                        }
                    }
                    catch {
                        // Destination does not exist; continue as-is
                    }
                }
                if (stat.type === "FILE") {
                    // Make sure destination directory exists
                    const destDir = Filer.Path.dirname(dest);
                    await this.promises.mkdirp(destDir);
                    await anura.fs.promises.writeFile(dest, await anura.fs.promises.readFile(src));
                }
                else if (stat.type === "DIRECTORY") {
                    await this.promises.mkdirp(dest);
                    const items = await anura.fs.promises.readdir(src);
                    for (const item of items) {
                        const srcPath = Filer.Path.join(src, item);
                        const destPath = Filer.Path.join(dest, item);
                        await this.promises.cpr(srcPath, destPath);
                    }
                }
                else {
                    throw new Error(`Unsupported file type at path: ${src}`);
                }
            }
            catch (err) {
                console.error(`Error copying from ${src} to ${dest}:`, err);
                throw err;
            }
        },
        mkdirp: async (path) => {
            const parts = this.#relativeToAbsolute(path).split("/");
            let builder = "";
            for (const part of parts) {
                if (part === "")
                    continue;
                builder += "/" + part;
                try {
                    await anura.fs.promises.mkdir(builder);
                }
                catch (e) {
                    if (e.code !== "EEXIST")
                        throw e;
                }
            }
        },
        rm: (path, options) => {
            return new Promise((resolve, reject) => {
                this.rm(path, options, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        },
        touch: (path, options) => {
            return new Promise((resolve, reject) => {
                this.touch(path, options, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        },
    };
    constructor(options) {
        options ||= {
            env: {
                PWD: "/",
                TMP: "/tmp",
            },
        };
        if (options?.env) {
            Object.entries(options.env).forEach(([key, value]) => {
                this.env.set(key, value);
            });
        }
    }
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
class AnuraFilesystem {
    providers = new Map();
    fds = {};
    lastFd;
    providerCache = {};
    whatwgfs = {
        fs: undefined,
        getFolder: async () => {
            // @ts-ignore
            return await this.whatwgfs.fs.getOriginPrivateDirectory(
            // @ts-ignore
            import("/libs/nfsadapter/adapters/anuraadapter.js"));
        },
        fileOrDirectoryFromPath: async (path) => {
            try {
                return await this.whatwgfs.directoryHandleFromPath(path);
            }
            catch (e1) {
                try {
                    return await this.whatwgfs.fileHandleFromPath(path);
                }
                catch (e2) {
                    throw e1 + e2;
                }
            }
        },
        directoryHandleFromPath: async (path) => {
            const pathParts = path.split("/");
            // prettier-ignore
            let workingPath = (await anura.fs.whatwgfs.getFolder());
            for (const dir of pathParts) {
                if (dir !== "")
                    workingPath = await workingPath.getDirectoryHandle(dir);
            }
            return workingPath;
        },
        fileHandleFromPath: async (givenPath) => {
            let path = givenPath.split("/");
            const file = path.pop();
            path = path.join("/");
            // prettier-ignore
            const workingPath = (await anura.fs.whatwgfs.directoryHandleFromPath(path));
            return await workingPath.getFileHandle(file);
        },
        showDirectoryPicker: async (options) => {
            const picker = await anura.import("anura.filepicker");
            const path = await picker.selectFolder();
            return await this.whatwgfs.directoryHandleFromPath(path);
        },
        showOpenFilePicker: async (options) => {
            const picker = await anura.import("anura.filepicker");
            const path = await picker.selectFile();
            return await this.whatwgfs.fileHandleFromPath(path);
        },
    };
    // Note: Intentionally aliasing the property to a class instead of an instance
    static Shell = AFSShell;
    Shell = AFSShell;
    constructor(providers) {
        providers.forEach((provider) => {
            this.providers.set(provider.domain, provider);
        });
        // These paths must be TS ignore'd since they are in build/
        (async () => {
            // @ts-ignore
            const fs = await import("/libs/nfsadapter/nfsadapter.js");
            // @ts-ignore
            this.whatwgfs.FileSystemDirectoryHandle = fs.FileSystemDirectoryHandle;
            // @ts-ignore
            this.whatwgfs.FileSystemFileHandle = fs.FileSystemFileHandle;
            // @ts-ignore
            this.whatwgfs.FileSystemHandle = fs.FileSystemHandle;
            this.whatwgfs.fs = fs;
        })();
    }
    clearCache() {
        this.providerCache = {};
    }
    installProvider(provider) {
        this.providers.set(provider.domain, provider);
        this.clearCache();
    }
    processPath(path) {
        if (!path.startsWith("/")) {
            throw new Error("Path must be absolute");
        }
        path = path.replace(/^\/+/, "/");
        let provider = this.providerCache[path];
        if (provider) {
            return provider;
        }
        if (this.providers.has(path)) {
            path += "/";
        }
        const parts = path.split("/");
        parts.shift();
        parts.pop();
        while (!provider && parts.length > 0) {
            const checkPath = "/" + parts.join("/");
            provider = this.providers.get(checkPath);
            parts.pop();
        }
        if (!provider) {
            provider = this.providers.get("/");
        }
        this.providerCache[path] = provider;
        return provider;
    }
    rename(oldPath, newPath, callback) {
        this.promises
            .rename(oldPath, newPath)
            .then(() => callback(null))
            .catch(callback);
    }
    ftruncate(fd, len, callback) {
        anura.fs.truncate(this.fds[fd].path, len, callback);
    }
    truncate(path, len, callback) {
        this.promises
            .truncate(path, len)
            .then(() => callback(null))
            .catch(callback);
    }
    stat(path, callback) {
        this.promises
            .stat(path)
            .then((res) => {
            callback(null, res);
        })
            .catch((err) => {
            callback(err, null);
        });
    }
    fstat(fd, callback) {
        anura.fs.stat(this.fds[fd].path, callback);
    }
    lstat(path, callback) {
        this.promises
            .lstat(path)
            .then((res) => {
            callback(null, res);
        })
            .catch((err) => {
            callback(err, null);
        });
    }
    /** @deprecated fs.exists() is an anachronism and exists only for historical reasons. */
    async exists(path, callback) {
        try {
            await anura.fs.promises.access(path);
            callback(true);
        }
        catch (e) {
            callback(false);
        }
    }
    link(srcPath, dstPath, callback) {
        this.promises
            .link(srcPath, dstPath)
            .then((res) => {
            callback(null);
        })
            .catch((err) => {
            callback(err);
        });
    }
    symlink(path, ...rest) {
        // @ts-ignore - Overloaded methods are scary
        this.processPath(rest[0]).symlink(path, ...rest);
    }
    readlink(path, callback) {
        this.promises
            .readlink(path)
            .then((res) => {
            callback(null, res);
        })
            .catch((err) => {
            callback(err, undefined);
        });
    }
    unlink(path, callback) {
        this.promises
            .unlink(path)
            .then((res) => {
            callback(null);
        })
            .catch((err) => {
            callback(err);
        });
    }
    rmdir(path, callback) {
        this.promises
            .rmdir(path)
            .then((res) => {
            callback(null);
        })
            .catch((err) => {
            callback(err);
        });
    }
    mkdir(path, ...rest) {
        this.promises
            .mkdir(path)
            .then((res) => {
            rest[rest.length - 1](null);
        })
            .catch((err) => {
            rest[rest.length - 1](err);
        });
    }
    access(path, ...rest) {
        this.promises
            .access(path)
            .then((res) => {
            rest[rest.length - 1](null);
        })
            .catch((err) => {
            rest[rest.length - 1](err);
        });
    }
    mkdtemp(...args) {
        // Temp directories should remain in the root filesystem for now
        // @ts-ignore - Overloaded methods are scary
        this.processPath(path).mkdtemp(...args);
    }
    readdir(path, ...rest) {
        this.promises
            .readdir(path, typeof rest[0] !== "function" ? rest[0] : undefined)
            .then((res) => {
            rest[rest.length - 1](null, res);
        })
            .catch((err) => {
            rest[rest.length - 1](err);
        });
    }
    close(fd, callback) {
        try {
            delete this.fds[fd];
            if (callback)
                callback(null);
        }
        catch (e) {
            if (callback)
                callback(e);
        }
        // this.processFD(fd).close(fd, callback);
    }
    open(path, flags, mode, callback) {
        let definedMode = 0o644;
        let definedCallback;
        let definedFlags = "w+";
        if (typeof flags !== "number" && typeof flags !== "string") {
            definedCallback = flags;
        }
        else {
            if (typeof mode === "number") {
                definedFlags = flags;
                definedCallback = callback;
                definedMode = mode;
            }
            else {
                definedCallback = mode;
                definedFlags = flags;
            }
        }
        // @ts-ignore
        this.promises
            .open(path, definedFlags, definedMode)
            .then((res) => definedCallback(null, res))
            .catch((e) => definedCallback(e, null));
    }
    utimes(path, atime, mtime, callback) {
        this.promises
            .utimes(path, atime, mtime)
            .then((res) => {
            callback(null);
        })
            .catch((err) => {
            callback(err);
        });
    }
    futimes(fd, ...rest) {
        // @ts-ignore - Overloaded methods are scary
        anura.fs.utimes(this.fds[fd].path, ...rest);
    }
    chown(path, uid, gid, callback) {
        this.promises
            .chown(path, uid, gid)
            .then((res) => {
            callback(null);
        })
            .catch((err) => {
            callback(err);
        });
    }
    fchown(fd, ...rest) {
        // @ts-ignore - Overloaded methods are scary
        anura.fs.chown(this.fds[fd].path, ...rest);
    }
    chmod(path, mode, callback) {
        this.promises
            .chmod(path, mode)
            .then(() => callback(null))
            .catch(callback);
    }
    fchmod(fd, ...rest) {
        // @ts-ignore - Overloaded methods are scary
        anura.fs.chmod(this.fds[fd].path, ...rest);
    }
    fsync(fd, ...rest) {
        // @ts-ignore - Overloaded methods are scary
        rest[0]();
    }
    async write(fd, ...rest) {
        const callback = rest[rest.length - 1];
        try {
            // @ts-ignore
            const realPath = this.fds[fd].path;
            const buffer = rest[0];
            const callback = rest[rest.length - 1];
            let length = buffer.length;
            let offset = 0;
            let position = null;
            // VarArgs handler
            if (rest.length === 5) {
                offset = rest[1];
                length = rest[2];
                position = rest[3];
            }
            else if (rest.length === 4) {
                offset = rest[1];
                length = rest[2];
            }
            else if (rest.length === 3) {
                offset = rest[1];
            }
            let fileBuf = Filer.Buffer.from(new Uint8Array(0));
            try {
                fileBuf = Filer.Buffer.from((await anura.fs.promises.readFile(realPath)));
            }
            catch {
                // File just didn't exist, not a huge deal, it will exist by the end of this
            }
            const slice = buffer.slice(offset, offset + length);
            let outBuf;
            if (position === null) {
                outBuf = Filer.Buffer.concat([fileBuf, slice]);
            }
            else {
                const endPos = position + slice.length;
                if (endPos > fileBuf.length) {
                    outBuf = Filer.Buffer.alloc(endPos);
                    fileBuf.copy(outBuf, 0, 0, fileBuf.length);
                }
                else {
                    outBuf = Filer.Buffer.from(fileBuf);
                }
                slice.copy(outBuf, position);
            }
            await anura.fs.promises.writeFile(realPath, outBuf);
            callback(null, length, buffer);
        }
        catch (e) {
            callback(e);
        }
    }
    async read(fd, ...rest) {
        const callback = rest[rest.length - 1];
        try {
            // @ts-ignore
            const realPath = this.fds[fd].path;
            const buffer = rest[0];
            let length = buffer.length;
            let offset = 0;
            let position = 0;
            // VarArgs handler
            if (rest.length === 5) {
                offset = rest[1];
                length = rest[2];
                position = rest[3];
            }
            else if (rest.length === 4) {
                offset = rest[1];
                length = rest[2];
            }
            else if (rest.length === 3) {
                offset = rest[1];
            }
            const fileBuf = await anura.fs.promises.readFile(realPath);
            const slice = Filer.Buffer.from(fileBuf.slice(position, position + length));
            slice.copy(buffer, offset);
            callback(null, slice.length, buffer);
        }
        catch (e) {
            callback(e);
        }
    }
    readFile(path, callback) {
        this.promises
            .readFile(path)
            .then((res) => {
            callback(null, res);
        })
            .catch((err) => {
            callback(err);
        });
    }
    writeFile(path, data, ...rest) {
        if (data instanceof Uint8Array && !(data instanceof Filer.Buffer)) {
            data = Filer.Buffer.from(data);
        }
        this.promises
            .writeFile(path, data, typeof rest[0] !== "function" ? rest[0] : undefined)
            .then((res) => {
            if (typeof rest[rest.length - 1] === "function")
                rest[rest.length - 1](null, res);
        })
            .catch((err) => {
            if (typeof rest[rest.length - 1] === "function")
                rest[rest.length - 1](err);
        });
    }
    appendFile(path, data, ...rest) {
        if (data instanceof Uint8Array && !(data instanceof Filer.Buffer)) {
            data = Filer.Buffer.from(data);
        }
        this.promises
            .appendFile(path, data, typeof rest[0] !== "function" ? rest[0] : undefined)
            .then((res) => {
            if (typeof rest[rest.length - 1] === "function")
                rest[rest.length - 1](null, res);
        })
            .catch((err) => {
            if (typeof rest[rest.length - 1] === "function")
                rest[rest.length - 1](err);
        });
    }
    // @ts-ignore - This is still being implemented.
    promises = {
        appendFile: (path, data, options) => {
            if (data instanceof Uint8Array && !(data instanceof Filer.Buffer)) {
                data = Filer.Buffer.from(data);
            }
            return this.processPath(path).promises.appendFile(path, data, options);
        },
        access: (path, mode) => this.processPath(path).promises.access(path, mode),
        chown: (path, uid, gid) => this.processPath(path).promises.chown(path, uid, gid),
        chmod: (path, mode) => this.processPath(path).promises.chmod(path, mode),
        link: (srcPath, dstPath) => this.processPath(srcPath).promises.link(srcPath, dstPath),
        lstat: (path) => this.processPath(path).promises.lstat(path),
        mkdir: (path, mode) => this.processPath(path).promises.mkdir(path, mode),
        mkdtemp: (prefix, options) => this.processPath(prefix).promises.mkdtemp(prefix, options),
        open: async (path, flags, mode) => {
            let definedMode;
            if (typeof mode === "number") {
                definedMode = mode;
            }
            else {
                definedMode = 0o644;
            }
            if (["a", "a+", "w", "w+"].includes(flags)) {
                anura.fs.promises.writeFile(path, "");
            }
            const assignedFd = this.lastFd++;
            this.fds[assignedFd] = { path: path.replace(/^\/+/, "/") };
            return assignedFd;
        },
        readdir: (path, options) => this.processPath(path).promises.readdir(path, options),
        readFile: (path) => this.processPath(path).promises.readFile(path),
        readlink: (path) => this.processPath(path).promises.readlink(path),
        rename: (oldPath, newPath) => this.processPath(oldPath).promises.rename(oldPath, newPath),
        rmdir: (path) => this.processPath(path).promises.rmdir(path),
        stat: (path) => this.processPath(path).promises.stat(path),
        symlink: (srcPath, dstPath, type) => this.processPath(dstPath).promises.symlink(srcPath, dstPath, type),
        truncate: (path, len) => this.processPath(path).promises.truncate(path, len),
        unlink: (path) => this.processPath(path).promises.unlink(path),
        utimes: (path, atime, mtime) => this.processPath(path).promises.utimes(path, atime, mtime),
        writeFile: (path, data, options) => {
            if (data instanceof Uint8Array && !(data instanceof Filer.Buffer)) {
                data = Filer.Buffer.from(data);
            }
            return this.processPath(path).promises.writeFile(path, data, options);
        },
    };
}
//# sourceMappingURL=Filesystem.js.map