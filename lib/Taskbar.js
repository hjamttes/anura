"use strict";
class Taskbar {
    timeformat = new Intl.DateTimeFormat(navigator.language, {
        hour: "numeric",
        minute: "numeric",
        hour12: !anura.settings.get("sir-yes-sir"),
    });
    dateformat = new Intl.DateTimeFormat(navigator.language, {
        month: "short",
        day: "numeric",
    });
    state = $state({
        pinnedApps: [],
        activeApps: [],
        showBar: false,
        rounded: anura.platform.type === "mobile" || anura.platform.type === "tablet"
            ? false
            : true,
        time: "",
        date: "",
        bat_icon: "battery_0_bar",
        net_icon: navigator.onLine ? "signal_wifi_4_bar" : "signal_wifi_off",
    });
    rounded = css `
		border-top-left-radius: 25px;
		border-top-right-radius: 25px;
		width: calc(100% - 2px);
		border-left: 1px solid var(--theme-dark-border);
		border-right: 1px solid var(--theme-dark-border);
		background-color: color-mix(in srgb, var(--theme-dark-bg) 78%, transparent);
	`;
    maximizedWins = [];
    dragged = null;
    insidedrag = false;
    element = (h("div", null, "Not Initialized"));
    shortcut(app) {
        if (!app)
            return;
        return (this.tmp = (h("li", { class: "taskbar-button" },
            h("input", { type: "image", draggable: anura.platform.type === "desktop", src: app?.icon || "", title: app?.name || "App", "on:dragend": (e) => {
                    if (!this.insidedrag) {
                        for (const i of app.windows) {
                            i.close();
                        }
                        anura.settings.set("applist", anura.settings
                            .get("applist")
                            .filter((p) => p !== app.package));
                        this.updateTaskbar();
                    }
                    else {
                        const dropX = e.clientX;
                        const icons = document.querySelectorAll(".taskbar-button .showDialog");
                        let closestIndex = anura.settings.get("applist").length - 1;
                        const rects = [];
                        icons.forEach((icn) => {
                            const rect = icn.getBoundingClientRect();
                            rects.push(rect);
                        });
                        rects.forEach((rect, index) => {
                            if (dropX > rect.left &&
                                dropX < (rects[index + 1]?.left || 0)) {
                                closestIndex = index;
                            }
                        });
                        if (anura.settings.get("applist").includes(app.package)) {
                            anura.settings.set("applist", [
                                ...anura.settings
                                    .get("applist")
                                    .filter((p) => p !== app.package),
                            ]);
                        }
                        const order = [...anura.settings.get("applist")];
                        order.splice(closestIndex, 0, app.package);
                        anura.settings.set("applist", order);
                        this.updateTaskbar();
                    }
                    this.dragged = null;
                    this.insidedrag = false;
                }, "on:dragstart": () => {
                    // @ts-ignore
                    this.dragged = $el;
                }, "on:drag": (e) => {
                    // draw a line to show where the icon will be placed
                    const icons = document.querySelectorAll(".taskbar-button .showDialog");
                    const dropX = e.clientX;
                    const rects = [];
                    icons.forEach((icn) => {
                        const rect = icn.getBoundingClientRect();
                        rects.push(rect);
                    });
                    let closestIndex = anura.settings.get("applist").length - 1;
                    rects.forEach((rect, index) => {
                        if (dropX > rect.left && dropX < (rects[index + 1]?.left || 0)) {
                            closestIndex = index;
                        }
                    });
                    for (let i = 0; i < icons.length; i++) {
                        icons[i].style.borderRight = "none";
                    }
                    icons[closestIndex].style.borderRight =
                        "2px solid var(--theme-fg)";
                }, class: "showDialog", "on:click": (e) => {
                    if (app.windows.length === 1) {
                        app.windows[0].unminimize();
                        app.windows[0].focus();
                    }
                    else {
                        this.showcontext(app, e);
                    }
                }, "on:contextmenu": (e) => {
                    this.showcontext(app, e);
                } }),
            (this.lightbar = (h("div", { class: "lightbar", style: "position: relative; bottom: 0px; background-color:#FFF; width:30%; left:50%; transform:translateX(-50%)" +
                    (app.windows?.length === 0 ? ";visibility:hidden" : "") }))))));
    }
    #contextMenu = new ContextMenu(true); // This is going to be before anura is initialized, so we can't use anura.ContextMenu
    showcontext(app, e) {
        // If `app` has open windows, or if dock item was right clicked
        if (app.windows.length > 0 || e.button === 2) {
            this.#contextMenu.removeAllItems();
            this.#contextMenu.addItem("New Window", () => {
                const potentialFuture = app.open();
                if (typeof potentialFuture !== "undefined" &&
                    //@ts-ignore - In App.tsx, open() returns a void, but in nearly every other case it returns a Promise<WMWindow> | undefined
                    // Typescript doesn't like this, so we have to ignore it.
                    typeof potentialFuture.then === "function") {
                    // @ts-ignore - Same as above
                    potentialFuture.then((win) => {
                        if (typeof win === "undefined")
                            return;
                        this.updateRadius();
                    });
                }
            }, "new_window");
            let winEnumerator = 1;
            for (const win of app.windows) {
                const displayTitle = win.state.title || "Window " + winEnumerator;
                this.#contextMenu.addItem(displayTitle, () => {
                    win.focus();
                    win.unminimize();
                }, "ad"); // somehow fits
                winEnumerator++;
            }
            const pinned = anura.settings.get("applist").includes(app.package);
            this.#contextMenu.addItem(pinned ? "Unpin" : "Pin", () => {
                if (pinned) {
                    anura.settings.set("applist", anura.settings
                        .get("applist")
                        .filter((p) => p !== app.package));
                }
                else {
                    anura.settings.set("applist", [
                        ...anura.settings.get("applist"),
                        app.package,
                    ]);
                }
                this.updateTaskbar();
            }, pinned ? "keep_off" : "keep");
            this.#contextMenu.addItem("Close", () => {
                for (const win of app.windows) {
                    win.close();
                }
            }, "cancel");
            const c = this.#contextMenu.show(e.x, 0);
            // HACK HACK DUMB HACK
            c.style.top = "";
            c.style.bottom = "69px";
        }
        else {
            const potentialFuture = app.open();
            if (typeof potentialFuture !== "undefined" &&
                //@ts-ignore - In App.tsx, open() returns a void, but in nearly every other case it returns a Promise<WMWindow> | undefined
                // Typescript doesn't like this, so we have to ignore it.
                typeof potentialFuture.then === "function") {
                // @ts-ignore - Same as above
                potentialFuture.then((win) => {
                    if (typeof win === "undefined")
                        return;
                    this.updateRadius();
                });
            }
        }
    }
    // shortcuts: { [key: string]: Shortcut } = {};
    constructor() {
        setInterval(() => {
            const date = Date.now();
            this.state.date = this.dateformat.format(date);
            if (this.timeformat.resolvedOptions().hour12 === false) {
                this.state.time = this.timeformat.format(date);
            }
            else {
                this.state.time = this.timeformat.format(date).slice(0, -3);
            }
        }, 1000);
        addEventListener("online", () => {
            this.state.net_icon = "signal_wifi_4_bar";
        });
        addEventListener("offline", () => {
            this.state.net_icon = "signal_wifi_off";
        });
        document.addEventListener("anura-force-taskbar-update", () => {
            this.updateTaskbar();
        });
        // Battery Status API is deprecated, so Microsoft refuses to create type definitions. :(
        // @ts-ignore
        if (navigator.getBattery) {
            // @ts-ignore
            navigator.getBattery().then((battery) => {
                battery.onchargingchange = () => {
                    if (battery.charging) {
                        this.state.bat_icon = "battery_charging_full";
                        return;
                    }
                    else {
                        const bat_bars = Math.round(battery.level * 7) - 1;
                        this.state.bat_icon = `battery_${bat_bars}_bar`;
                        return;
                    }
                };
                battery.onlevelchange = () => {
                    if (battery.charging) {
                        this.state.bat_icon = "battery_charging_full";
                        return;
                    }
                    else {
                        const bat_bars = Math.round(battery.level * 7) - 1;
                        if (bat_bars === -1) {
                            this.state.bat_icon = `battery_alert`;
                            return;
                        }
                        this.state.bat_icon = `battery_${bat_bars}_bar`;
                        return;
                    }
                };
                // This literally just checks if the battery is charging and fully charged
                // which is a *close enough* approximation of whether it's a laptop or not.
                if (battery.charging && battery.chargingTime === 0) {
                    this.state.bat_icon = "";
                    return;
                }
                if (battery.charging) {
                    this.state.bat_icon = "battery_charging_full";
                    return;
                }
                const bat_bars = Math.round(battery.level * 7) - 1;
                if (bat_bars === -1) {
                    this.state.bat_icon = `battery_alert`;
                    return;
                }
                this.state.bat_icon = `battery_${bat_bars}_bar`;
            });
        }
    }
    async init() {
        this.element = (h("footer", { class: [use(this.state.rounded, (rounded) => rounded && this.rounded)] },
            h("div", { id: "launcher-button-container" },
                h("div", { id: "launcher-button", "on:click": () => {
                        quickSettings.close();
                        calendar.close();
                        launcher.toggleVisible();
                    } })),
            h("nav", { id: "taskbar-bar", "on:dragover": (e) => {
                    e.preventDefault();
                }, "on:drop": (e) => {
                    this.insidedrag = true;
                    e.preventDefault();
                } },
                h("ul", null, use(this.state.pinnedApps, (apps) => apps.map(this.shortcut.bind(this)))),
                $if(use(this.state.showBar), h("div", { class: "splitBar" })),
                h("ul", null, use(this.state.activeApps, (apps) => apps.map(this.shortcut.bind(this))))),
            h("div", { id: "taskbar-right" },
                h("span", { id: "date-container", "on:click": () => {
                        launcher.hide();
                        quickSettings.close();
                        calendar.toggle();
                    } },
                    h("span", null, use(this.state.date))),
                h("span", { id: "taskinfo-container", "on:click": () => {
                        launcher.hide();
                        calendar.close();
                        quickSettings.toggle();
                    } },
                    h("div", { class: "flex flexcenter", style: {
                            gap: "4px",
                        } },
                        h("span", null, use(this.state.time)),
                        h("span", { class: "material-symbols-outlined" },
                            use(this.state.net_icon),
                            use(this.state.bat_icon)),
                        h("span", { class: "systray" }),
                        h("span", null,
                            h("span", { class: [
                                    "notification-badge",
                                    use(anura.notifications.state.notifications.length, (i) => i > 0 ? "shown" : "hidden"),
                                ] }, use(anura.notifications.state.notifications.length))))))));
    }
    updateTaskbar() {
        const pinned = anura.settings
            .get("applist")
            .map((id) => anura.apps[id]);
        const activewindows = Object.values(anura.apps).filter((a) => a.windows && a.windows.length > 0);
        this.state.pinnedApps = pinned;
        this.state.activeApps = activewindows.filter((app) => !pinned.includes(app));
        this.state.showBar =
            this.state.pinnedApps.length > 0 && this.state.activeApps.length > 0;
    }
    updateRadius() {
        if (this.maximizedWins.length > 0 || snappedWindows.length > 0) {
            this.state.rounded = false;
        }
        else {
            if (anura.platform.type !== "mobile" && anura.platform.type !== "tablet")
                this.state.rounded = true;
        }
    }
}
//# sourceMappingURL=Taskbar.js.map