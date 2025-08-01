"use strict";
class ContextMenu {
    large = false;
    #element = (h("div", { class: `custom-menu${this.large ? " large" : ""}`, style: "" }));
    item(text, callback, icon) {
        return (h("div", { class: "custom-menu-item", "on:click": callback.bind(this) },
            $if(icon, h("span", { class: "material-symbols-outlined" }, icon)),
            h("span", null, text)));
    }
    #isShown = false;
    constructor(large = false) {
        this.large = large;
        if (this.large) {
            this.#element.classList.add("large"); // why
        }
        setTimeout(() => document.addEventListener("click", (event) => {
            const withinBoundaries = event.composedPath().includes(this.#element);
            if (!withinBoundaries) {
                this.#element.remove();
            }
        }), 100);
    }
    removeAllItems() {
        this.#element.innerHTML = "";
    }
    addItem(text, callback, icon) {
        this.#element.appendChild(this.item(text, function () {
            this.hide();
            callback();
        }, icon));
    }
    show(x, y) {
        // remove any existing context menus. i will admit this is a bit of a quick n dirty hack
        if (document.querySelector(".custom-menu")) {
            console.warn("FORCE REMOVING OTHER CONTEXT MENUS, THE APP SHOULD TAKE CARE OF ONLY ALLOWING ONE CONTEXT MENU AT A TIME.");
            document.querySelectorAll(".custom-menu").forEach((el) => {
                el.remove();
            });
        }
        // Reset out of bound fixes
        this.#element.style.bottom = "";
        this.#element.style.right = "";
        this.#element.style.top = y.toString() + "px";
        this.#element.style.left = x.toString() + "px";
        document.body.appendChild(this.#element);
        this.#isShown = true;
        this.#element.focus();
        if (this.#element.getBoundingClientRect().bottom >=
            document.body.getBoundingClientRect().bottom) {
            this.#element.style.top = "";
            this.#element.style.bottom = "0px";
        }
        if (this.#element.getBoundingClientRect().right >=
            document.body.getBoundingClientRect().right) {
            this.#element.style.left = "";
            this.#element.style.right = "0px";
        }
        return this.#element;
    }
    hide() {
        if (this.#isShown) {
            document.body.removeChild(this.#element);
            this.#isShown = false;
        }
    }
}
//# sourceMappingURL=ContextMenu.js.map