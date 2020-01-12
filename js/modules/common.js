var toasts = [];
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

/******************************* GENERAL *******************************/
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
    data.forEach(function(ele) {
		if (ele.eleID) {
            let element = document.getElementById(ele.eleID);
            if (element) {
                element.addEventListener(ele.eventType, !ele.debounce ? ele.function : debounce(ele.function.bind(element), ele.debounce));
             } else {
                errors.push("Could not find element with ID: " + ele.eleID);
             }
		} else if (ele.dataListener) {
            let elements = document.querySelectorAll("[data-listener~='" + ele.dataListener + "']");
            if (elements.length > 0) {
                elements.forEach(e => {
                    e.addEventListener(ele.eventType, !ele.debounce ? ele.function : debounce(ele.function.bind(e), ele.debounce));
                });
            } else {
                errors.push("Could not find any elements with data-listener attribute: " + ele.dataListener);
            }
        } else if (ele.domObject) {
            ele.domObject.addEventListener(ele.eventType, !ele.debounce ? ele.function : debounce(ele.function.bind(ele.domObject), ele.debounce));
        }
    });
	if (errors.length > 0) { console.log(errors); }
}

export function toast(message, type) {
	var toast = document.createElement("div");
	toast.classList.add("toast", "fade-in-out");
    toast.innerHTML = message;

    switch (type) {
        case "success": toast.classList.add("bg-blue");   break;
        case "error":   toast.classList.add("bg-red");    break;
        case "warning": toast.classList.add("bg-orange"); break;
    }

	toasts.forEach(t => t.style.bottom = (parseFloat(t.style.bottom) || 0) + t.clientHeight + 8 + 'px');
	toasts.push(toast);
	document.body.appendChild(toast);

	setTimeout(function() {
		toast.remove();
		toasts.shift();
    }, 5000);
}

export function insertInlineMessage(position, parentNode, refNode, text, type) {
    var tempID = (parentNode + "-" + refNode).replace(/[#.]/g, ""),
        [parentNode, refNode, prevNode] = document.querySelectorAll(parentNode + ", " + refNode + ", #" + tempID),
        msgNode = document.createElement("div");

    msgNode.classList.add("inline-message");
    msgNode.innerHTML = text;
    msgNode.id = tempID;
    if (prevNode) { prevNode.remove(); }
    //Previous node only removed when inserting at same location. Insert ID(s) into array and remove later when new messages are inserted
    switch (type) {
        case "success": msgNode.classList.add("bg-green");  break;
        case "error":   msgNode.classList.add("bg-red");    break;
        case "warning": msgNode.classList.add("bg-orange"); break;
    }

    switch (position) {
        case "before":  return parentNode.insertBefore(msgNode, refNode);
        case "after":   return parentNode.insertBefore(msgNode, refNode.nextSibling);
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
            if (element.value.length < 8) { validity.Message = "Password must be a minimum of 8 characters"; return validity; }
            var passConf = document.getElementById(element.id + "-confirm");
            if (passConf) { errorCheck.call(passConf); }
            break;
        case "password-confirm":
            var pass = document.getElementById(element.id.substring(0, element.id.indexOf("-confirm")));
            if (element.value !== pass.value) { validity.Message = "Passwords do not match"; return validity; }
            break;
    }
    return {"Valid": true, "Message": "Field is valid"};
}

export function errorCheck() {
    var label = document.getElementById(this.id + "-error"),
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