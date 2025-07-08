"use strict";
class FilerAFSProvider extends AFSProvider {
    domain = "/";
    name = "Filer";
    version = "1.0.0";
    fs;
    constructor(fs) {
        super();
        this.fs = fs;
    }
    promises = {
        appendFile: (path, data, options) => this.fs.promises.appendFile(path, data, options),
        access: (path, mode) => this.fs.promises.access(path, mode),
        chown: (path, uid, gid) => this.fs.promises.chown(path, uid, gid),
        chmod: (path, mode) => this.fs.promises.chmod(path, mode),
        link: (srcPath, dstPath) => this.fs.promises.link(srcPath, dstPath),
        lstat: (path) => this.fs.promises.lstat(path),
        mkdir: (path, mode) => this.fs.promises.mkdir(path, mode),
        mkdtemp: (prefix, options) => this.fs.promises.mkdtemp(prefix, options),
        mknod: (path, mode) => this.fs.promises.mknod(path, mode),
        readdir: (path, options) => this.fs.promises.readdir(path, options),
        readFile: (path) => this.fs.promises.readFile(path),
        readlink: (path) => this.fs.promises.readlink(path),
        removexattr: (path, name) => this.fs.promises.removexattr(path, name),
        rename: (oldPath, newPath) => this.fs.promises.rename(oldPath, newPath),
        rmdir: (path) => this.fs.promises.rmdir(path),
        stat: (path) => this.fs.promises.stat(path),
        symlink: (srcPath, dstPath, type) => this.fs.promises.symlink(srcPath, dstPath, type),
        truncate: (path, len) => this.fs.promises.truncate(path, len),
        unlink: (path) => this.fs.promises.unlink(path),
        utimes: (path, atime, mtime) => this.fs.promises.utimes(path, atime, mtime),
        writeFile: (path, data, options) => this.fs.promises.writeFile(path, data, options),
    };
}
//# sourceMappingURL=FilerFS.js.map