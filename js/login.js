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
        "panel": "../images/assets/panel-white-mountain.jpg",
        "wrapper": "../images/assets/purple-mountain.jpg",
        "color": "blue-light"
    }, {
        "panel": "../images/assets/panel-orange-forest-light.jpg",
        "wrapper": "../images/assets/orange-forest.jpg",
        "color": "red"
    }, {
        "panel": "../images/assets/panel-orange-forest-dark.jpg",
        "wrapper": "../images/assets/orange-lake.jpg",
        "color": "orange-light"
    }, {
        "panel": "../images/assets/panel-green-mountain.jpg",
        "wrapper": "../images/assets/green-night.jpg",
        "color": "green"
    }
];

var index = 1;

window.onload = async function() {
    let response = await fetch("/php/login.php");
    response = await response.json();
    if (response.Success) { return window.location.href = "/main.html"; }

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
};

function randomizeTheme() {
    var tempIndex = index,
        root = document.documentElement;
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
        setTimeout(() => window.location.href = "/main.html", 1000);
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
        setTimeout(() => window.location.href = "/main.html", 1000);
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