"use strict";
function hasChildren(entry) {
    return (Object.entries(entry[1]).filter((setting) => {
        return setting[1] instanceof Object && !(setting[1] instanceof Array);
    }).length > 0);
}
const DisclosureGroup = function () {
    if (!this.level)
        this.level = 1;
    this.css = `
        padding-left: ${0.8 * this.level}em;
		// height: 1.75em;
		border-radius: 0.2em;

		transition: background-color 0.05s;

		&:hover {
			background-color: color-mix(in srgb, var(--theme-secondary-bg), transparent 90%);
		}

		&.selected {
            background-color: var(--theme-secondary-bg);
        }

        &.selected details {
            background-color: var(--theme-bg);
        }
    `;
    return (h("div", { "class:selected": use(this.sel, (sel) => sel === this.entry[1]), class: this.css }, hasChildren(this.entry) ? (h("details", null,
        h("summary", { "class:selected": use(this.sel, (sel) => sel === this.entry[1]) },
            h("span", { "on:click": (e) => {
                    e.preventDefault();
                    this.sel = this.entry[1];
                } }, this.entry[0])),
        Object.entries(this.entry[1])
            .filter((setting) => {
            return (setting[1] instanceof Object && !(setting[1] instanceof Array));
        })
            .map((item) => (h(DisclosureGroup, { entry: item, "bind:sel": use(this.sel), level: this.level + 1 }))))) : (h("span", { "on:click": () => {
            this.sel = this.entry[1];
        }, "class:selected": use(this.sel, (sel) => sel === this.entry[1]) }, this.entry[0]))));
};
class RegEdit extends App {
    name = "Registry Editor";
    package = "anura.regedit";
    icon = "/assets/icons/regedit.svg";
    css = css `
		display: flex;
		border-top: 1px solid var(--theme-border);

		#pane-left {
			width: max(10%, 200px);
			border-right: 1px solid var(--theme-border);
			overflow: scroll;
			text-overflow: nowrap;
			white-space: nowrap;
			padding-left: 0.5em;
		}

		#pane-right {
			width: calc(100% - max(10%, 200px));
			min-width: 400px;
			padding-inline: 0.5em;
			overflow: scroll;
		}

		#detail {
			width: 100%;
			height: 100%;
		}

		table {
			width: 100%;
			margin: 0;
		}

		summary {
			// height: 2em;
			cursor: pointer;
		}

		.value {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			width: 100%;
			background-color: var(--theme-bg);
			outline: none;
		}

		.name {
			max-width: 8em;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		td {
			padding-inline: 0.5em;
		}

		tr {
			height: 4rem;
			margin: 0;
			// border-bottom: 1px solid var(--theme-border);
		}

		label {
			width: 100%;
		}

		table {
			border-color: var(--theme-border);
			// border-collapse: collapse;
		}

		// tr:last-child {
		//     border-bottom: none;
		// }

		// td:not(:last-child) {
		//     border-right: 1px solid var(--theme-border);
		// }
	`;
    constructor() {
        super();
    }
    state = $state({
        selected: anura.settings.cache,
    });
    page = async () => (h("div", { style: {
            height: "100%",
            width: "100%",
            position: "absolute",
            color: use(anura.ui.theme.state.foreground),
            background: use(anura.ui.theme.state.background),
        }, class: `background ${this.css}` },
        h("div", { id: "pane-left" },
            h("div", { id: "detail" },
                h("details", { open: true },
                    h("summary", { "class:selected": use(this.state.selected, (sel) => sel === anura.settings.cache) },
                        h("span", { "on:click": (e) => {
                                e.preventDefault();
                                this.state.selected = anura.settings.cache;
                            } }, "Root")),
                    Object.entries(anura.settings.cache)
                        .filter((setting) => {
                        return (setting[1] instanceof Object && !(setting[1] instanceof Array));
                    })
                        .map((item) => (h(DisclosureGroup, { entry: item, "bind:sel": use(this.state.selected) })))))),
        h("div", { id: "pane-right" },
            h("table", null,
                h("tr", null,
                    h("th", null, "Name"),
                    h("th", null, "Type"),
                    h("th", null, "Value")),
                use(this.state.selected, (sel) => Object.entries(sel)
                    .filter((setting) => {
                    return (!(setting[1] instanceof Object) || setting[1] instanceof Array);
                })
                    .map((item) => (h("tr", null,
                    h("td", { class: "name", title: item[0] }, item[0]),
                    h("td", { class: "type" }, typeof item[1]),
                    h("td", { class: "value" }, typeof item[1] === "boolean" ? (h("label", { class: "value matter-switch" },
                        h("input", { type: "checkbox", checked: item[1], "on:change": function (e) {
                                console.log(item[0], e.srcElement.srcchecked);
                                sel[item[0]] = e.srcElement.checked;
                                anura.settings.save();
                            } }),
                        h("span", null))) : (h("label", { class: "matter-textfield-filled" },
                        h("input", { placeholder: " ", "on:blur": function (event) {
                                const elements = event.srcElement.parentElement.children;
                                console.log(item[0], event.srcElement.value);
                                try {
                                    const parsed = JSON.parse(event.srcElement.value);
                                    sel[item[0]] = parsed;
                                    anura.settings.save();
                                }
                                catch (e) {
                                    elements[2].value = anura.settings.get(item[0]);
                                    anura.notifications.add({
                                        title: "RegEdit Error",
                                        description: `Failed to set value for ${elements[0].innerText}, invalid input`,
                                        timeout: 50000,
                                    });
                                }
                                // console.log(JSON.parse(event.srcElement.value));
                                console.log("blur", event);
                            }, value: JSON.stringify(item[1]) }),
                        h("span", null, "Value"))))))))))));
    async open() {
        if (!anura.settings.get("disable-regedit-warning") &&
            !(await anura.dialog.confirm("Are you sure you want to continue?", "Editing the registry can cause irreparable damage to your system!"))) {
            return;
        }
        anura.settings.set("disable-regedit-warning", true);
        const win = anura.wm.create(this, {
            title: "Registry Editor",
            width: "910px",
            height: `${(720 * window.innerHeight) / 1080}px`,
            resizable: true,
        });
        win.content.appendChild(await this.page());
        return win;
    }
}
//# sourceMappingURL=RegEdit.js.map