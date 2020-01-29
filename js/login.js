import * as Common from "./modules/common.js";

const eventListeners = [
    {
        "eleID": "login-form",
        "eventType": "submit",
        "function": login
    }, {
        "eleID": "register-form",
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

var index = 0;

window.addEventListener("DOMContentLoaded", async function() {
    document.getElementById("login-switch").addEventListener("click", event => {
        event.preventDefault();
        switchPanel("register-panel", "login-panel");
        randomizeTheme();
    });
    document.getElementById("register-switch").addEventListener("click", event => {
        event.preventDefault();
        switchPanel("login-panel", "register-panel");
        randomizeTheme();
    });

    Common.addListeners(eventListeners);
});

function randomizeTheme() {
    var root = document.documentElement,
        tempIndex = index;
    while (tempIndex == index) { tempIndex = Math.floor(Math.random() * themes.length); }
    index = tempIndex;

    root.style.setProperty("--theme-color", `var(--${themes[index].color})`);
    root.style.setProperty("--theme-image-wrapper", `url(${themes[index].wrapper})`);
    root.style.setProperty("--theme-image-panel", `url(${themes[index].panel})`);
}

async function login(event) {
    event.preventDefault();
    if (!Common.checkErrors([...this.elements])) { return Common.toast("Errors in form fields", "error"); }

    var formData = new FormData(this),
        response = await fetch("/php/login.php", {method: "POST", body: formData});
    response = await response.json();
    if (response.Success) {
        Common.insertInlineMessage("after", "#login-form", "#login", response.Message, "success");
        setTimeout(() => window.location.href = "/main.php", 1000);
    } else {
        Common.insertInlineMessage("after", "#login-form", "#login", response.Message, "error");
    }
}

async function register(event) {
    event.preventDefault();
    if (!Common.checkErrors([...this.elements])) { return Common.toast("Errors in form fields", "error"); }

    var formData = new FormData(this),
        response = await fetch("/php/register.php", {method: "POST", body: formData});
    response = await response.json();
    if (response.Success) {
        Common.insertInlineMessage("after", "#register-form", "#register", response.Message, "success");
        setTimeout(() => window.location.href = "/main.php", 1000);
    } else {
        Common.insertInlineMessage("after", "#register-form", "#register", response.Message, "error");
    }
}

function switchPanel(hiddenPanel, visiblePanel) {
    hiddenPanel = document.getElementById(hiddenPanel),
    visiblePanel = document.getElementById(visiblePanel);

    visiblePanel.classList.toggle("hidden-panel");
    setTimeout(() => {
        visiblePanel.classList.toggle("hidden");
        hiddenPanel.classList.toggle("hidden");
        hiddenPanel.classList.toggle("hidden-panel");
    }, 200);
}