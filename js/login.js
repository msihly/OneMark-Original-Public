import * as Cmn from "./modules/common.js";

const LoginG = {
    eventListeners: [{
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
            "function": Cmn.errorCheck
        }, {
            "dataListener": "loginSwitch",
            "eventType": "click",
            "function": e => {
                Cmn.switchPanel(e.target.dataset.altPanel, e.target.dataset.panel);
                randomizeTheme();
            }
        }],
    themeIdx: -1,
    themes: [{
            "panel": "../images/panel-white-mountain.jpg",
            "wrapper": "../images/purple-mountain.jpg",
            "color": "blue-light"
        }, {
            "panel": "../images/panel-orange-forest-light.jpg",
            "wrapper": "../images/orange-forest.jpg",
            "color": "red-med-2"
        }, {
            "panel": "../images/panel-orange-forest-dark.jpg",
            "wrapper": "../images/orange-lake.jpg",
            "color": "orange-light"
        }, {
            "panel": "../images/panel-green-mountain.jpg",
            "wrapper": "../images/green-night.jpg",
            "color": "green-med"
        }]
}

window.addEventListener("DOMContentLoaded", async function() {
    Cmn.addListeners(LoginG.eventListeners);
    randomizeTheme();
});

function randomizeTheme() {
    let i = LoginG.themeIdx = Cmn.getRandomInt(0, LoginG.themes.length - 1, LoginG.themeIdx),
        theme = LoginG.themes[i],
        root = document.documentElement;
    root.style.setProperty("--theme-color", `var(--${theme.color})`);
    root.style.setProperty("--theme-image-wrapper", `url(${theme.wrapper})`);
    root.style.setProperty("--theme-image-panel", `url(${theme.panel})`);
}

async function login(event) {
    event.preventDefault();
    if (!Cmn.checkErrors([...this.elements])) { return Cmn.toast("Errors in form fields", "error"); }

    let formData = new FormData(this),
        res = await (await fetch("/php/login.php", {method: "POST", body: formData})).json();
    if (res.Success) {
        Cmn.inlineMessage("after", "login", res.Message, {type: "success"});
        setTimeout(() => window.location.href = "/", 1000);
    } else {
        Cmn.inlineMessage("after", "login", res.Message, {type: "error"});
    }
}

async function register(event) {
    event.preventDefault();
    if (!Cmn.checkErrors([...this.elements])) { return Cmn.toast("Errors in form fields", "error"); }

    let formData = new FormData(this),
        res = await (await fetch("/php/register.php", {method: "POST", body: formData})).json();
    if (res.Success) {
        Cmn.inlineMessage("after", "register", res.Message, {type: "success"});
        setTimeout(() => window.location.href = "/", 1000);
    } else {
        Cmn.inlineMessage("after", "register", res.Message, {type: "error"});
    }
}