const CmnG = {
    months: ["", "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
    openMenus: [],
    toasts: []
}

/******************************* GENERAL *******************************/
export function addListeners(data) {
	let errors = [];
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
        if (elements.length > 0 && elements[0] !== null) {elements.forEach(e => e.addEventListener(d.eventType, !d.debounce ? d.function : debounce(d.function.bind(e), d.debounce))); }
        else { errors.push(errMsg); }
    });
	if (errors.length > 0) { console.log(errors); }
}

export function capitalize(string) {
    return string[0].toUpperCase() + string.substring(1);
}

export function checkEmpty(arr) {
    if (arr == undefined) { return console.error("Undefined reference passed to 'checkEmpty(arr)' function"); }
    return arr.length < 1 ? true : false;
}

export function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        if (timeout) { clearTimeout(timeout); }
        timeout = setTimeout(() => {
            fn(...args);
            timeout = null;
        }, delay);
    }
}

export function formatBytes(bytes) {
    if (bytes < 1) { return "0 B"; }
    let power = Math.floor(Math.log2(bytes) / 10);
    return `${(bytes / (1024 ** power)).toFixed(2)} ${("KMGTPEZY"[power - 1] || "")}B`;
}

export function getRandomInt(min, max, cur = null) {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    return (num === cur) ? getRandomInt(min, max, cur) : num;
}

export function leadZeros(num, places) {
    return String(num).padStart(places, "0");
}

export function printDate(dateTime, type = "date") {
    let [year, month, day, time] = [dateTime.substring(0, 4), dateTime.substring(5, 7), dateTime.substring(8, 10), dateTime.substring(11)];
    switch (type) {
        case "date": return `${CmnG.months[+month]} ${day}, ${year}`;
        case "dateTime": return `${CmnG.months[+month]} ${day}, ${year} | ${new Date(`1970-01-01T${time}`).toLocaleTimeString({}, {hour: "numeric", minute: "numeric"})}`;
        case "time": return new Date(`1970-01-01T${time}`).toLocaleTimeString({}, {hour: "numeric", minute: "numeric"});
    }
}

export function regexEscape(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/******************************* FORM *******************************/
export function checkErrors(elements) {
    let errors = [];
    elements.forEach(e => {
        if (e.type != "submit") { errors.push(errorCheck.call(e)); }
    });
    return !errors.includes(false);
}

export function errorCheck() {
    let label = document.getElementById(`${this.id}-error`),
        validity = isValid(this);

    if (label === null) { return; }
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

export function isValid(element) {
    let re,
        validity = {"Valid": false, "Message": ""};
    switch (element.name) {
        case "title": case "pageURL": case "email": case "username": case "password": case "password-confirm":
            if (!element.value) { validity.Message = "Field is required"; return validity; }
    }
    switch (element.name) {
        case "title":
            if (element.value.length > 255) { validity.Message = "Title cannot be more than 255 characters"; return validity; }
            break;
        case "pageURL":
            re = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;
            if (element.value.length > 2083) { validity.Message = "Page URL cannot be more than 2083 characters"; return validity; }
            else if (!re.test(element.value)) { validity.Message = "Invalid URL"; return validity; }
            break;
        case "email":
            re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (element.value.length > 255) { validity.Message = "Email cannot be more than 255 characters"; return validity; }
            else if (!re.test(element.value)) { validity.Message = "Invalid email"; return validity; }
            break;
        case "username":
            if (element.value.length > 40) { validity.Message = "Username cannot be more than 40 characters"; return validity; }
            break;
        case "password":
        case "password-new":
            if (element.value.length < 8) { validity.Message = "Password must be a minimum of 8 characters"; return validity; }
            let passConf = document.getElementById(`${element.id}-confirm`);
            if (passConf) { errorCheck.call(passConf); }
            if (element.id == "pass-new") {
                let passCur = document.getElementById("pass-cur");
                if (element.value === passCur.value) { validity.Message = "New password cannot match current password"; return validity; }
            }
            break;
        case "password-confirm":
            let pass = document.getElementById(element.id.substring(0, element.id.indexOf("-confirm")));
            if (element.value !== pass.value) { validity.Message = "Passwords do not match"; return validity; }
            break;
    }
    return {"Valid": true, "Message": "Field is valid"};
}

/******************************* MENUS *******************************/
export function closeMenus() {
    if (CmnG.openMenus.length > 0) {
        CmnG.openMenus.forEach(e => {
            e.classList.toggle("hidden");
            CmnG.openMenus.shift();
        });
    }
}

export function toggleMenu() {
    event.stopPropagation();
    let ele = this || event.target,
        menu = document.getElementById(ele.dataset.menu);
    if (!CmnG.openMenus.includes(menu)) {
        closeMenus();
        menu.classList.toggle("hidden");
        CmnG.openMenus.push(menu);
    } else { closeMenus(); }
}

/******************************* MODAL *******************************/
export function modalClose(del = false, modalID = null) {
    event.stopPropagation();
    let modal = document.getElementById(modalID || event.target.dataset.modal);
	if ((modalID && modal) || event.target == modal || event.target.classList.contains("close")) { del ? modal.remove() : modal.classList.add("hidden"); }
}

export function switchPanel(hiddenPanel, visiblePanel) {
    hiddenPanel = document.getElementById(hiddenPanel),
    visiblePanel = document.getElementById(visiblePanel);

    visiblePanel.classList.toggle("hidden-panel");
    setTimeout(() => {
        visiblePanel.classList.toggle("hidden");
        hiddenPanel.classList.toggle("hidden");
        hiddenPanel.classList.toggle("hidden-panel");
    }, 200);
}

export function switchTab(curTab, newTab) {
    curTab = document.getElementById(curTab),
    newTab = document.getElementById(newTab);

    curTab.classList.remove("active");
    newTab.classList.add("active");
}

/******************************* NOTIFICATIONS *******************************/
export function inlineMessage(position, refNode, text, options = [{"type": "", "duration": 0}]) {
    refNode = document.getElementById(refNode);
    let parentNode = refNode.parentElement,
        tempID = (`${parentNode.id}-${refNode.id}`).replace(/[#.]/g, ""),
        prevNode = document.getElementById(tempID),
        msgNode = document.createElement("div");

    msgNode.classList.add("inline-message");
    msgNode.innerHTML = text;
    msgNode.id = tempID;

    if (prevNode) { prevNode.remove(); }

    switch (options.type) {
        case "info": case "blue": msgNode.classList.add("bg-blue"); break;
        case "success": case "green": msgNode.classList.add("bg-green"); break;
        case "error": case "red": msgNode.classList.add("bg-red"); break;
        case "warning": case "orange": msgNode.classList.add("bg-orange"); break;
    }

    switch (position) {
        case "before": parentNode.insertBefore(msgNode, refNode); break;
        case "after": parentNode.insertBefore(msgNode, refNode.nextSibling); break;
    }

    if (options.duration > 0) {
        setTimeout(() => msgNode.remove(), options.duration);
    }
}

export function toast(message, type) {
	let toast = document.createElement("div");
	toast.classList.add("toast", "fade-in-out");
    toast.innerHTML = message;

    switch (type) {
        case "success": case "blue": toast.classList.add("bg-blue"); break;
        case "error": case "red": toast.classList.add("bg-red"); break;
        case "warning": case "yellow": case "orange": toast.classList.add("bg-orange"); break;
    }

	CmnG.toasts.forEach(t => t.style.bottom = (parseFloat(t.style.bottom) || 0) + t.clientHeight + 8 + 'px');
	CmnG.toasts.push(toast);
	document.body.appendChild(toast);

	setTimeout(function() {
		toast.remove();
		CmnG.toasts.shift();
    }, 4900);
}

/******************************* ALERTS *******************************/
export function createAlert({text = "", buttons = [{"btnText": "Close", "fn": () => modalClose(true), "class": "close"}]} = {}) {
    event.stopPropagation();
    let htmlButtons = "",
        randID = Math.floor(Math.random() * 100);
    buttons.forEach(e => htmlButtons += `<button class="${e.class || ""}" data-modal="al-${randID}">${e.btnText}</button>`);
    let htmlModal = `<div class="modal-container" id="al-${randID}" data-modal="al-${randID}">
                        <div class="modal-content pad-ctn-1">
                            <p class="al-text">${text}</p>
                            <div class="row">${htmlButtons}</div>
                        </div>
                    </div>`;
    let frag = document.createRange().createContextualFragment(htmlModal);
    frag.querySelectorAll("button").forEach((e, i) => e.addEventListener("click", buttons[i].fn));
    frag.getElementById(`al-${randID}`).addEventListener("click", () => modalClose(true));

    closeMenus();
    return frag;
}