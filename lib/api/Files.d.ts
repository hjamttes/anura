declare class FilesAPI {
    fallbackIcon: string;
    folderIcon: string;
    open(path: string): Promise<void>;
    defaultOpen(path: string): Promise<void>;
    getIcon(path: string): Promise<string>;
    defaultIcon(path: string): Promise<string>;
    getFileType(path: string): Promise<string>;
    setFolderIcon(path: string): void;
    set(path: string, extension: string): void;
    setModule(id: string, extension: string): void;
}
