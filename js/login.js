import * as Common from "./modules/common.js";

const eventListeners = [
    {
        "id": "login-form",
        "eventType": "submit",
        "function": login
    }, {
        "id": "register-form",
        "eventType": "submit",
        "function": register
    }, {
        "dataListener": "errorCheck",
        "eventType": "input",
        "function": Common.errorCheck
    }
];

const themes = [
    {
        "panel": "../images/panel-white-mountain.jpg",
        "wrapper": "../images/purple-mountain.jpg",
        "color": "blue-light"
    }, {
        "panel": "../images/panel-orange-forest-light.jpg",
        "wrapper": "../images/orange-forest.jpg",
        "color": "red"
    }, {
        "panel": "../images/panel-orange-forest-dark.jpg",
        "wrapper": "../images/orange-lake.jpg",
        "color": "orange-light"
    }, {
        "panel": "../images/panel-green-mountain.jpg",
        "wrapper": "../images/green-night.jpg",
        "color": "green"
    }
];

var LgGlobals = {
    index: 0
}

window.addEventListener("DOMContentLoaded", async function() {
    document.getElementById("login-switch").addEventListener("click", event => {
        event.preventDefault();
        Common.switchPanel("register-panel", "login-panel");
        randomizeTheme();
    });
    document.getElementById("register-switch").addEventListener("click", event => {
        event.preventDefault();
        Common.switchPanel("login-panel", "register-panel");
        randomizeTheme();
    });

    Common.addListeners(eventListeners);
});

function randomizeTheme() {
    LgGlobals.index = Common.getRandomInt(0, themes.length - 1, LgGlobals.index);

    var root = document.documentElement;
    root.style.setProperty("--theme-color", `var(--${themes[LgGlobals.index].color})`);
    root.style.setProperty("--theme-image-wrapper", `url(${themes[LgGlobals.index].wrapper})`);
    root.style.setProperty("--theme-image-panel", `url(${themes[LgGlobals.index].panel})`);
}

async function login(event) {
    event.preventDefault();
    if (!Common.checkErrors([...this.elements])) { return Common.toast("Errors in form fields", "error"); }

    var formData = new FormData(this),
        response = await (await fetch("/php/login.php", {method: "POST", body: formData})).json();
    if (response.Success) {
        Common.insertInlineMessage("after", "login", response.Message, {type: "success"});
        setTimeout(() => window.location.href = "/index.php", 1000);
    } else {
        Common.insertInlineMessage("after", "login", response.Message, {type: "error"});
    }
}

async function register(event) {
    event.preventDefault();
    if (!Common.checkErrors([...this.elements])) { return Common.toast("Errors in form fields", "error"); }

    var formData = new FormData(this),
        response = await (await fetch("/php/register.php", {method: "POST", body: formData})).json();
    if (response.Success) {
        Common.insertInlineMessage("after", "register", response.Message, {type: "success"});
        setTimeout(() => window.location.href = "/index.php", 1000);
    } else {
        Common.insertInlineMessage("after", "register", response.Message, {type: "error"});
    }
}