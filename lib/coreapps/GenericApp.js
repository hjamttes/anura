"use strict";
class GenericApp extends App {
    name = "Generic App";
    package = "anura.generic";
    icon = "/assets/icons/generic.svg";
    hidden = true;
    constructor() {
        super();
    }
    async open(args = []) {
        anura.dialog.alert("This app is not supposed to be opened as it is a placeholder for other apps.");
        return;
    }
}
//# sourceMappingURL=GenericApp.js.map