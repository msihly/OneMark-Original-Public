var activeTab,
    activeContent;

window.onload = async function() {
    let response = await fetch("/php/login.php");
    response = await response.json();
    if (response.Success) { console.log("redirecting. Success: " + response.Success + ". Message: " + response.Message); window.location.href = "/main.html"; }
    else { console.log("not redirecting. Success: " + response.Success + ". Message: " + response.Message); }

    activeTab = document.getElementsByClassName("tab active")[0];
    activeContent = document.getElementsByClassName("tab-content active")[0];

    var tabList = document.getElementsByClassName("tab");
    for (let i = 0; i < tabList.length; i++) {tabList[i].addEventListener("click", changeTab);}

    document.getElementById("login-form").addEventListener("submit", login);
    document.getElementById("register-form").addEventListener("submit", register);
};

function changeTab() {
    activeTab.classList.remove("active");
    activeContent.classList.remove("active");
    activeTab = this;
    activeContent = document.getElementById(this.dataset.content);
    activeTab.classList.add("active");
    activeContent.classList.add("active");
}

function insertInlineMessage(parentNode, refNode, text, type) {
    var parentNode = document.getElementById(parentNode),
        refNode = document.getElementById(refNode),
        messageNode = document.createElement("div"),
        tempID = parentNode + "-" + refNode,
        prevNode = document.getElementById(tempID);

    messageNode.classList.add("inline-message");
    messageNode.innerHTML = text;
    if (prevNode) {prevNode.remove();}
    messageNode.id = tempID;
    /*This works, but if a message was added somewhere else after, the previous one would remain. The ID(s) for each insert transaction
      need to be inserted into an array and then removed when a new transaction is initiated. Need a way to track transactions and possibly a separate remove function.
    */
    switch (type) {
        case "success": messageNode.classList.add("bg-green");  break;
        case "error":   messageNode.classList.add("bg-red");    break;
        case "warning": messageNode.classList.add("bg-yellow"); break;
    }

    return parentNode.insertBefore(messageNode, refNode);
}

async function login(event) {
    event.preventDefault();

    var formData = new FormData(this),
        response = await fetch("/php/login.php", {method: "POST", body: formData});
    response = await response.json();
    if (response.Success) {
        insertInlineMessage("login-form", "login", response.Message, "success");
        setTimeout(function() { window.location.href = "/main.html"; }, 2000);
    } else {
        insertInlineMessage("login-form", "login", response.Message, "error");
    }
}

async function register(event) {
    event.preventDefault();

    var formData = new FormData(this),
        response = await fetch("/php/register.php", {method: "POST", body: formData});
    response = await response.json();
    if (response.Success) {
        insertInlineMessage("register-form", "register", response.Message, "success");
        setTimeout(function() { window.location.href = "/main.html"; }, 2000);
    } else {
        insertInlineMessage("register-form", "register", response.Message, "error");
    }
}