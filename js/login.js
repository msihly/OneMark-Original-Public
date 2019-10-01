var index = 1,
    themes = [{"panel": "../images/assets/panel-white-mountain.jpg", "wrapper": "../images/assets/purple-mountain.jpg", "color": "blue-light"},
              {"panel": "../images/assets/panel-orange-forest-light.jpg", "wrapper": "../images/assets/orange-forest.jpg", "color": "red"},
              {"panel": "../images/assets/panel-orange-forest-dark.jpg", "wrapper": "../images/assets/orange-lake.jpg", "color": "orange-light"},
              {"panel": "../images/assets/panel-green-mountain.jpg", "wrapper": "../images/assets/green-night.jpg", "color": "green"},
              ];

window.onload = async function() {
    let response = await fetch("/php/login.php");
    response = await response.json();
    if (response.Success) { console.log("Redirecting. Success: " + response.Success + ". Message: " + response.Message); window.location.href = "/main.html"; }
    else { console.log("Not redirecting. Success: " + response.Success + ". Message: " + response.Message); }

    document.getElementById("login-switch").addEventListener("click", function(event) {
        event.preventDefault();
        switchPanel("register-panel", "login-panel");
        randomizeTheme();
    });
    document.getElementById("register-switch").addEventListener("click", function(event) {
        event.preventDefault();
        switchPanel("login-panel", "register-panel");
        randomizeTheme();
    });

    document.getElementById("login-form").addEventListener("submit", login);
    document.getElementById("register-form").addEventListener("submit", register);
};

function randomizeTheme() {
    var tempIndex = index,
        root = document.documentElement;
    while (tempIndex == index) { tempIndex = Math.floor(Math.random() * themes.length); }
    index = tempIndex;

    root.style.setProperty("--theme-color", "var(--" + themes[index].color + ")");
    root.style.setProperty("--theme-image-wrapper", "url("+ themes[index].wrapper + ")");
    root.style.setProperty("--theme-image-panel", "url(" + themes[index].panel + ")");
}

function insertInlineMessage(position, parentNode, refNode, text, type) {
    var tempID = (parentNode + "-" + refNode + "-" + position).replace(/#/g, ""),
        parentNode = document.querySelector(parentNode),
        refNode = document.querySelector(refNode),
        prevNode = document.querySelector("#" + tempID),
        messageNode = document.createElement("div");

    messageNode.classList.add("inline-message");
    messageNode.innerHTML = text;
    messageNode.id = tempID;
    if (prevNode) { prevNode.remove(); }

    /* Previous node only removed when inserting at same location. Insert ID(s) into array
       and remove later when new messages are inserted.
    */
    switch (type) {
        case "success": messageNode.classList.add("bg-green");  break;
        case "error":   messageNode.classList.add("bg-red");    break;
        case "warning": messageNode.classList.add("bg-orange"); break;
    }

    switch (position) {
        case "before":  return parentNode.insertBefore(messageNode, refNode);
        case "after":   return parentNode.insertBefore(messageNode, refNode.nextSibling);
    }
}

async function login(event) {
    event.preventDefault();

    var formData = new FormData(this),
        response = await fetch("/php/login.php", {method: "POST", body: formData});
    response = await response.json();
    if (response.Success) {
        insertInlineMessage("after", "#login-form", "#login", response.Message, "success");
        setTimeout(function() { window.location.href = "/main.html"; }, 2000);
    } else {
        insertInlineMessage("after", "#login-form", "#login", response.Message, "error");
    }
}

async function register(event) {
    event.preventDefault();

    var formData = new FormData(this),
        response = await fetch("/php/register.php", {method: "POST", body: formData});
    response = await response.json();
    if (response.Success) {
        insertInlineMessage("after", "#register-form", "#register", response.Message, "success");
        setTimeout(function() { window.location.href = "/main.html"; }, 2000);
    } else {
        insertInlineMessage("after", "#register-form", "#register", response.Message, "error");
    }
}

function switchPanel(hiddenPanel, visiblePanel) {
    hiddenPanel = document.getElementById(hiddenPanel),
    visiblePanel = document.getElementById(visiblePanel);

    visiblePanel.classList.toggle("hidden-panel");
    setTimeout(function() {
        visiblePanel.classList.toggle("hidden");
        hiddenPanel.classList.toggle("hidden");
        hiddenPanel.classList.toggle("hidden-panel");
    }, 200);
}