var CmnGlobals = {
    toasts: []
}

/******************************* GENERAL *******************************/
/* export function cursorLoad(loading, type) {
    var modal = document.getElementById("loading-modal"),
        body = document.body;
    if (!loading) {
        body.style = "";
        modal.classList.remove("block-click", "wait", "progress");
    } else {
        switch (type) {
            case "w": case "wait":
                body.style = "cursor: wait;";
                modal.classList.remove("progress");
                modal.classList.add("block-click", "wait");
                break;
            case "p": case "progress":
            default:
                body.style = "cursor:progress;";
                modal.classList.remove("block-click", "wait");
                modal.classList.add("progress");
        }
    }
} */

export function getRandomInt(min, max, cur) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return (num === cur) ? getRandomInt(min, max, cur) : num;
}

export function debounce(fn, delay) {
    var timeout;
    return function(...args) {
        if (timeout) { clearTimeout(timeout); }
        timeout = setTimeout(() => {
            fn(...args);
            timeout = null;
        }, delay);
    }
}

export function addListeners(data) {
	var errors = [];
    data.forEach(d => {
        let elements, errMsg;
        if (d.id) {
            elements = [document.getElementById(d.id)];
            errMsg = `Could not find element with ID: ${d.id}`;
        } else if (d.class) {
            elements = [...document.getElementsByClassName(d.class)];
            errMsg = `Could not find any elements with class: ${d.class}`;
        } else if (d.dataListener) {
            elements = document.querySelectorAll(`[data-listener~='${d.dataListener}']`);
            errMsg = `Could not find any elements with data-listener attribute: ${d.dataListener}`;
        } else if (d.domObject) {
            elements = [d.domObject];
        }
        if (elements.length > 0) { elements.forEach(e => e.addEventListener(d.eventType, !d.debounce ? d.function : debounce(d.function.bind(e), d.debounce))); }
        else { errors.push(errMsg); }
    });
	if (errors.length > 0) { console.log(errors); }
}

export function toast(message, type) {
	var toast = document.createElement("div");
	toast.classList.add("toast", "fade-in-out");
    toast.innerHTML = message;

    switch (type) {
        case "success": toast.classList.add("bg-blue"); break;
        case "error": toast.classList.add("bg-red"); break;
        case "warning": toast.classList.add("bg-orange"); break;
    }

	CmnGlobals.toasts.forEach(t => t.style.bottom = (parseFloat(t.style.bottom) || 0) + t.clientHeight + 8 + 'px');
	CmnGlobals.toasts.push(toast);
	document.body.appendChild(toast);

	setTimeout(function() {
		toast.remove();
		CmnGlobals.toasts.shift();
    }, 5000);
}

export function insertInlineMessage(position, parentNode, refNode, text, type) {
    var tempID = (`${parentNode}-${refNode}`).replace(/[#.]/g, ""),
        [parentNode, refNode, prevNode] = document.querySelectorAll(`${parentNode}, ${refNode}, #${tempID}`),
        msgNode = document.createElement("div");

    msgNode.classList.add("inline-message");
    msgNode.innerHTML = text;
    msgNode.id = tempID;
    if (prevNode) { prevNode.remove(); }
    switch (type) {
        case "success": msgNode.classList.add("bg-green"); break;
        case "error": msgNode.classList.add("bg-red"); break;
        case "warning": msgNode.classList.add("bg-orange"); break;
    }

    switch (position) {
        case "before": return parentNode.insertBefore(msgNode, refNode);
        case "after": return parentNode.insertBefore(msgNode, refNode.nextSibling);
    }
}

/******************************* FORM *******************************/
export function isValid(element) {
    var validity = {"Valid": false, "Message": ""};
    switch (element.name) {
        case "title": case "pageURL": case "email": case "username": case "password": case "password-confirm":
            if (!element.value) { validity.Message = "Field is required"; return validity; }
    }
    switch (element.name) {
        case "title":
            if (element.value.length > 100) { validity.Message = "Title cannot be more than 100 characters"; return validity; }
            break;
        case "pageURL":
            var re = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
            if (element.value.length > 255) { validity.Message = "Page URL cannot be more than 255 characters"; return validity; }
            else if (!re.test(element.value)) { validity.Message = "Invalid URL"; return validity; }
            break;
        case "email":
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (element.value.length > 255) { validity.Message = "Email cannot be more than 255 characters"; return validity; }
            else if (!re.test(element.value)) { validity.Message = "Invalid email"; return validity; }
            break;
        case "username":
            if (element.value.length > 40) { validity.Message = "Username cannot be more than 40 characters"; return validity; }
            break;
        case "password":
        case "password-new":
            if (element.value.length < 8) { validity.Message = "Password must be a minimum of 8 characters"; return validity; }
            var passConf = document.getElementById(`${element.id}-confirm`);
            if (passConf) { errorCheck.call(passConf); }
            if (element.id == "pass-new") {
                var passCur = document.getElementById("pass-cur");
                if (element.value === passCur.value) { validity.Message = "New password cannot match current password"; return validity; }
            }
            break;
        case "password-confirm":
            var pass = document.getElementById(element.id.substring(0, element.id.indexOf("-confirm")));
            if (element.value !== pass.value) { validity.Message = "Passwords do not match"; return validity; }
            break;
    }
    return {"Valid": true, "Message": "Field is valid"};
}

export function errorCheck() {
    var label = document.getElementById(`${this.id}-error`),
        validity = isValid(this);

    if(label === null) { return; }
    if (!validity.Valid) {
        this.classList.add("invalid");
        label.innerHTML = validity.Message;
        label.classList.remove("invisible");
    } else {
        label.classList.add("invisible");
        label.innerHTML = "Valid";
        this.classList.remove("invalid");
    }

    return validity.Valid;
}

export function checkErrors(elements) {
    var errors = [];
    elements.forEach(e => {
        if (e.type != "submit") { errors.push(errorCheck.call(e)); }
    });
    if (errors.includes(false)) { return false; }
    else { return true; }
}

/******************************* MODAL *******************************/
export function switchPanel(hiddenPanel, visiblePanel) {
    hiddenPanel = document.getElementById(hiddenPanel),
    visiblePanel = document.getElementById(visiblePanel);

    visiblePanel.classList.toggle("hidden-panel");
    setTimeout(() => {
        visiblePanel.classList.toggle("hidden");
        hiddenPanel.classList.toggle("hidden");
        hiddenPanel.classList.toggle("hidden-panel");
    }, 150);
}

export function switchTab(curTab, newTab) {
    curTab = document.getElementById(curTab),
    newTab = document.getElementById(newTab);

    curTab.classList.remove("active");
    newTab.classList.add("active");
}