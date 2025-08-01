"use strict";
class AnuraUI {
    /**
     * This map contains all the built-in components that have been registered.
     */
    builtins = new Map();
    /**
     * This map contains all the components that have been registered from external libraries.
     */
    components = new Map();
    theme;
    /**
     * This function allows you to register a component to the built-in components registry.
     * @param component - The name of the component to register.
     * @param element - A function component that returns an HTMLElement.
     */
    async registerComponent(component, element) {
        this.builtins.set(component, element);
    }
    /**
     * This function allows you to register a component from an external library.
     * @param lib - The name of the library to import the component from.
     * @param component - The name of the component to register.
     * @param version - (Optional) The version of the library to import the component from.
     */
    async registerExternalComponent(lib, component, version) {
        if (version) {
            lib += "@" + version;
        }
        this.components.set(component, {
            lib,
            name: component,
        });
        anura.settings.set("anura.ui.components", Array.from(this.components.entries()));
    }
    /**
     * This function allows you to import a component, whether it is a built-in component or a component from a library.
     * @param name - The name of the component to import.
     * @returns A promise that resolves to a function component that returns an HTMLElement.
     */
    async get(name) {
        const comp = this.components.get(name);
        if (!comp) {
            if (this.builtins.has(name)) {
                return this.builtins.get(name);
            }
            throw new Error("Component not registered");
        }
        const [lib, scope_name] = [comp.lib, comp.name];
        const library = await anura.import(lib);
        return library[scope_name];
    }
    /**
     * This function allows you to check if a component is registered.
     * @param component - The name of the component to check.
     * @returns Whether the component is registered or not.
     */
    exists(component) {
        return this.components.has(component) || this.builtins.has(component);
    }
    /**
     * This function allows you to import multiple components at once.
     *
     * @param components - An array of component names to import, or a singular component. If you pass "*" it will import all components.
     * @returns A promise that resolves to an object containing the components.
     *
     * @example
     *
     * ```jsx
     * const { Button } = await anura.ui.use("Button");
     *
     * document.body.appendChild(<Button onclick={() => {
     *   alert("Hello, World!");
     * }} />);
     * ```
     *
     * @example <caption>Without jsx</caption>
     *
     * ```js
     * const { Button, } = await anura.ui.use(["Button", "Input"]);
     *
     * // Here we supply the props to the component by binding the props object to the component.
     * let boundButton = Button.bind({
     *            "onclick": () => {
     *              alert("Hello, World!");
     *            }
     * });
     *
     * document.body.appendChild(boundButton);
     * ```
     */
    async use(components = []) {
        const result = {};
        if (components === "*") {
            components = Array.from(this.components.keys()).concat(Array.from(this.builtins.keys()));
        }
        if (typeof components === "string") {
            components = [components];
        }
        for (const component of components) {
            result[component] = await this.get(component);
        }
        return result;
    }
    /**
     * Install internal components
     */
    init() {
        const components = anura.settings.get("anura.ui.components");
        if (components) {
            try {
                this.components = new Map(components);
            }
            catch (e) {
                this.components = new Map();
            }
        }
        const AnuraVersion = function () {
            this.product ||= "Anura";
            return (h("span", null,
                this.product,
                " version: ",
                anura.version.pretty));
        };
        const Panel = function () {
            this.style ||= {};
            this.class ||= [];
            if (typeof this.class === "string")
                this.class = [this.class];
            this.width ||= "100%";
            this.height ||= "100%";
            this.margin ||= "0";
            this.css = `
                display: flex;
                position: absolute;
                background: color-mix(
                    in srgb,
                    var(--theme-dark-bg) 77.5%,
                    transparent
                );
                border: 1px solid var(--theme-dark-border);
                box-shadow: inset 0 0 0 1px var(--theme-secondary-bg);
                border-radius: 1em;

                backdrop-filter: blur(30px);
                -webkit-backdrop-filter: blur(30px);

                flex-grow: ${this.grow ? 1 : 0};
                flex-direction: column;
            `;
            this.mount = () => {
                if (this.id)
                    this.root.id = this.id;
            };
            return (h("div", { style: {
                    width: use(this.width),
                    height: use(this.height),
                    margin: use(this.margin),
                    ...this.style,
                }, class: this.class }, this.children));
        };
        this.registerComponent("AnuraVersion", AnuraVersion);
        this.registerComponent("Panel", Panel);
    }
}
//# sourceMappingURL=UI.js.map