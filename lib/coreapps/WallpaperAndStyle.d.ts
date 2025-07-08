type WallpaperObject = {
    name: string;
    url: string;
};
declare class WallpaperAndStyle extends App {
    name: string;
    package: string;
    icon: string;
    libfilepicker: {
        selectFile: (options?: object) => Promise<string | string[]>;
        selectFolder: (options?: object) => Promise<string | string[]>;
    };
    wallpaperList: () => Promise<any>;
    state: Stateful<{
        resizing: boolean;
        tab: string;
    }>;
    css: string;
    colorEditors: {
        prop: keyof ThemeProps;
        name: string;
    }[];
    page: () => Promise<JSX.Element>;
    setNewWallpaper(wallpaperObj: WallpaperObject): void;
    getCurrentWallpaper(): WallpaperObject;
    loadWallpaperManifest(): Promise<any>;
    updateCurrentWallpaperElements(): void;
    setWallpaper(url: string): void;
    importTheme(): Promise<void>;
    exportTheme(theme: string): void;
    constructor();
    open(): Promise<WMWindow | undefined>;
}
