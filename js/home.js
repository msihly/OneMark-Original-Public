import * as Common from "./modules/common.js";

const eventListeners = [
    {
        "id": "create-bookmark",
        "eventType": "click",
        "function": (event) => {modalBookmark(event, "upload");}
    }, {
        "id": "sortmenu",
        "eventType": "click",
        "function": toggleMenu
    }, {
        "id": "sidemenu",
        "eventType": "click",
        "function": toggleMenu
    }, {
        "id": "account",
        "eventType": "click",
        "function": modalAccount
    }, {
        "id": "logout",
        "eventType": "click",
        "function": logout
    }, {
        "id": "searchbar",
        "eventType": "input",
        "function": searchBookmarks,
        "debounce": 100
    }, {
        "id": "tag-search",
        "eventType": "input",
        "function": searchTags,
        "debounce": 50
    }, {
        "id": "tag-btn",
        "eventType": "click",
        "function": updateTag
    }, {
        "id": "preview",
        "eventType": "click",
        "function": (event) => {openBookmark(event, true);}
    }, {
        "id": "image-upload",
        "eventType": "change",
        "function": fileUpload
    }, {
        "id": "remove-upload",
        "eventType": "click",
        "function": removeUpload
    }, {
        "id": "acc-pass-form",
        "eventType": "submit",
        "function": updatePassword
    }, {
        "class": "sortmenu-btn",
        "eventType": "click",
        "function": sortBookmarks
    }, {
        "dataListener": "modalClose",
        "eventType": "mousedown",
        "function": modalClose
    }, {
        "dataListener": "inputPreview",
        "eventType": "input",
        "function": inputPreview
    }, {
        "dataListener": "errorCheck",
        "eventType": "input",
        "function": Common.errorCheck
    }, {
        "dataListener": "acc-btn",
        "eventType": "click",
        "function": (event) => {
            Common.switchPanel(IdxGlobals.accCurPanel, event.target.dataset.panel);
            IdxGlobals.accCurPanel = event.target.dataset.panel;
            Common.switchTab(IdxGlobals.accCurTab, event.target.id);
            IdxGlobals.accCurTab = event.target.id;
        }
    }, {
        "domObject": document,
        "eventType": "click",
        "function": closeMenus
    }
];

var IdxGlobals = {
    container: "",
    sort: "",
    accCurTab: "acc-tab-info",
    accCurPanel: "acc-panel-info",
    bookmarks: [],
    activeBookmarks: [],
    tags: [],
    openMenus: []
}

var LazyObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.src = e.target.dataset.src;
            e.target.classList.remove("lazy");
            LazyObserver.unobserve(e.target);
        }
    });
});

window.addEventListener("DOMContentLoaded", async function() {
    IdxGlobals.bookmarks = await getBookmarks();
    IdxGlobals.activeBookmarks = [...IdxGlobals.bookmarks];
    Common.addListeners(eventListeners);
    IdxGlobals.container = document.getElementById("bookmark-container");
    if (!bookmarksEmpty(IdxGlobals.activeBookmarks)) { createBookmarks(IdxGlobals.container, IdxGlobals.activeBookmarks); }
});

/******************************* GENERAL *******************************/
function regexEscape(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function formatBytes(bytes) {
    if (bytes < 1) { return "0 B"; }
    let power = Math.floor(Math.log2(bytes) / 10);
    return `${(bytes / (1024 ** power)).toFixed(2)} ${("KMGTPEZY"[power - 1] || "")}B`;
}

function closeMenus() {
    if (IdxGlobals.openMenus.length > 0) {
        IdxGlobals.openMenus.forEach(e => {
            e.classList.toggle("hidden");
            IdxGlobals.openMenus.shift();
        });
    }
}

function toggleMenu() {
    event.stopPropagation();
    var menu = document.getElementById(this.dataset.menu);
    if (!IdxGlobals.openMenus.includes(menu)) {
        closeMenus();
        menu.classList.toggle("hidden");
        IdxGlobals.openMenus.push(menu);
    } else { closeMenus(); }
}

/******************************* ACCOUNT *******************************/
async function logout(event) {
    event.preventDefault();
    var response = await fetch("/php/logout.php");
    response = await response.json();
    if (response.Success) {
        Common.toast(response.Message, "success");
        setTimeout(function() { window.location.href = "/login.php"; }, 1000);
    } else {
        Common.toast(response.Message, "error");
    }
}

async function updatePassword(event) {
    event.preventDefault();
    if (!Common.checkErrors([...this.elements])) { return Common.toast("Errors in form fields", "error"); }

    var formData = new FormData(this),
        response = await fetch("/php/update-pass.php", {method: "POST", body: formData});

    response = await response.json();
    response.Success ? Common.toast(response.Message, "success") : Common.toast(response.Message, "error");
}

/******************************* MODAL *******************************/
async function modalAccount() {
    var [modal, username, email, dateCreated, accType] = document.querySelectorAll("#acc-modal, #acc-username, #acc-email, #acc-created, #acc-type");
    let response = await fetch("/php/account-info.php");
    response = await response.json();

    if (!response.Success) { return Common.toast(response.Message, "error"); }
    username.innerHTML = response.Info.Username;
    email.innerHTML = response.Info.Email;
    dateCreated.innerHTML = response.Info.DateCreated;
    accType.innerHTML = response.Info.AccessLevel;

    closeMenus();
	modal.classList.remove("hidden");
}

function modalBookmark(event, formType) {
    event.preventDefault();
	event.stopPropagation();
    var [modal, previewURL, previewTitle, previewImage, form, formURL, formTitle, tagSearch, tagBtn, tagsCtn] =
            document.querySelectorAll("#bk-modal, #preview, #preview-title, #preview-image, #bk-f, #bk-f-url, #bk-f-title, #tag-search, #tag-btn, #tags");

    if (formType == "upload") {
        previewURL.dataset.href = "";
        previewTitle.innerHTML = "No Title";
        previewImage.src = "images/No-Image.jpg";

        formURL.value = "";
        formTitle.value = "";

        tagSearch.value = "";
        tagBtn.classList.remove("add", "del");
        IdxGlobals.tags = [];
        while (tagsCtn.firstChild) { tagsCtn.removeChild(tagsCtn.firstChild); }

        form.removeEventListener("submit", editBookmark);
        form.addEventListener("submit", uploadBookmark);
    } else if (formType == "edit") {
        var	bkInfo = IdxGlobals.bookmarks[IdxGlobals.bookmarks.findIndex(({BookmarkID}) => BookmarkID == event.target.dataset.parent.substring(1))];
        form.dataset.bkTarget = event.target.dataset.parent;

        previewURL.dataset.href = bkInfo.PageURL;
        previewTitle.innerHTML = bkInfo.Title;
        previewImage.src = bkInfo.ImagePath;

        formURL.value = bkInfo.PageURL;
        formTitle.value = bkInfo.Title;

        tagSearch.value = "";
        tagBtn.classList.remove("add", "del");
        IdxGlobals.tags = [...bkInfo.Tags];
        while (tagsCtn.firstChild) { tagsCtn.removeChild(tagsCtn.firstChild); }
        createTags(IdxGlobals.tags, tagsCtn);

        Common.errorCheck.call(formURL);
        Common.errorCheck.call(formTitle);

        form.removeEventListener("submit", uploadBookmark);
        form.addEventListener("submit", editBookmark);
    }

    closeMenus();
	modal.classList.remove("hidden");
}

function modalClose(event, del = false) {
	var modal = document.getElementById(this.dataset.modal);
	if (event.target == modal|| this.classList.contains("close")) { del ? modal.remove() : modal.classList.add("hidden"); }
}

/******************************* ALERTS *******************************/
function createAlert({text = "", buttons = [{"btnText": "Close", "fn": (event) => {modalClose(event, true)}, "class": "close"}]} = {}) {
    event.stopPropagation();
    var htmlButtons = "",
        randID = Math.floor(Math.random() * 100);
    buttons.forEach(e => htmlButtons += `<button class="${e.class || ""}" data-modal="al-${randID}">${e.btnText}</button>`);
    var htmlModal = `<div class="modal-container" id="al-${randID}" data-modal="al-${randID}">
                        <div class="modal-content pad-ctn-1">
                            <p class="al-text">${text}</p>
                            ${htmlButtons}
                        </div>
                    </div>`;
    var frag = document.createRange().createContextualFragment(htmlModal);
    frag.querySelectorAll("button").forEach((e, i) => e.addEventListener("click", buttons[i].fn));
    frag.getElementById(`al-${randID}`).addEventListener("click", (event) => {modalClose(event, true)});

    closeMenus();
    return frag;
}

/******************************* FORM *******************************/
function inputPreview() {
    var preview = document.getElementById(this.dataset.preview);
    if (this.dataset.attr == "innerHTML") { preview.innerHTML = Common.isValid(this).Valid ? this.value : this.dataset.invalidValue; }
    else { preview.setAttribute(this.dataset.attr, Common.isValid(this).Valid ? this.value : this.dataset.invalidValue); }
}

function fileUpload() {
	var fileName = this.value.split("\\").pop(),
		label = document.getElementById("bk-image-name"),
        imagePreview = document.getElementById("preview-image");

    document.getElementById("bk-f-remove").value = "false";
	label.classList.toggle("hidden", !fileName);
	label.innerHTML = fileName;

	if (this.files.length != 0) {
		var reader = new FileReader();
		reader.onload = function(e) {imagePreview.src = e.target.result;}
		reader.readAsDataURL(this.files[0]);
	} else {
		imagePreview.src = "/images/No-Image.jpg";
    }
}

function removeUpload() {
    var label = document.getElementById("bk-image-name");
    document.getElementById("image-upload").value = "";
    document.getElementById("bk-f-remove").value = "true";
    document.getElementById("preview-image").src = "/images/No-Image.jpg";
    label.innerHTML = "";
    label.classList.add("hidden");
}

/******************************* BOOKMARKS *******************************/
function createBookmark(bkInfo) {
    var html = `<div class="bookmark" id="b${bkInfo.BookmarkID}" data-href="${bkInfo.PageURL}">
                    <div class="title" id="t${bkInfo.BookmarkID}">${bkInfo.Title}</div>
                    <img class="image lazy" id="i${bkInfo.BookmarkID}" src="/images/Lazy-Load.jpg" data-src="${bkInfo.ImagePath}">
                    <div class="menu">
                        <div class="menu-content hidden" id="m${bkInfo.BookmarkID}">
                            <div id="mc-i${bkInfo.BookmarkID}" data-parent="b${bkInfo.BookmarkID}">Info</div>
                            <div id="mc-e${bkInfo.BookmarkID}" data-parent="b${bkInfo.BookmarkID}">Edit</div>
                            <div id="mc-d${bkInfo.BookmarkID}" data-parent="b${bkInfo.BookmarkID}">Delete</div>
                        </div>
                        <div class="menu-toggle" id="m-t${bkInfo.BookmarkID}" data-menu="m${bkInfo.BookmarkID}"></div>
                    </div>
                </div>`;
    var infoText = `<b>Date Created</b>
                     ${bkInfo.DateCreated}
                     <b>Date Modified</b>
                     ${bkInfo.DateModified}
                     <b>Image Size</b>
                     ${formatBytes(bkInfo.ImageSize)}
                     <b>View Count</b>
                     ${bkInfo.Views}`;
    var frag = document.createRange().createContextualFragment(html);
    frag.querySelector(`#b${bkInfo.BookmarkID}`).addEventListener("click", openBookmark);
    frag.querySelector(`#m-t${bkInfo.BookmarkID}`).addEventListener("click", toggleMenu);
    frag.querySelector(`#mc-i${bkInfo.BookmarkID}`).addEventListener("click", () => document.body.appendChild(createAlert({"text": infoText})));
    frag.querySelector(`#mc-e${bkInfo.BookmarkID}`).addEventListener("click", function(event) { modalBookmark(event, "edit"); });
    frag.querySelector(`#mc-d${bkInfo.BookmarkID}`).addEventListener("click", deleteBookmark);
    LazyObserver.observe(frag.querySelector(`#i${bkInfo.BookmarkID}`));

	return frag;
}

function createBookmarks(ctnr, arr) {
    var	docFrag = document.createDocumentFragment();
    arr.forEach(bkInfo => docFrag.appendChild(createBookmark(bkInfo)));
    ctnr.appendChild(docFrag);
}

function openBookmark(event, preview = false) {
    var href = this.dataset.href;
    if (href && href != "#") { window.open(href); }
    if (!preview) {
        var bookmarkID = this.id.substring(1),
            formData = new FormData();
        formData.append("bookmarkID", bookmarkID);
        fetch("/php/add-view.php", {method: "POST", body: formData});
        let bk = IdxGlobals.bookmarks[IdxGlobals.bookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)];
        bk.Views = parseInt(bk.Views) + 1;
    }
}

async function getBookmarks() {
    let response = await fetch("/php/get-bookmarks.php");
    response = await response.json();
    if (!response.Success) { Common.toast("Error getting bookmarks", "error"); }
    return response.Bookmarks;
}

async function uploadBookmark(event) {
    event.preventDefault();
    if (!Common.checkErrors([...this.elements])) { return Common.toast("Errors in form fields", "error"); }

    var formData = new FormData(this);

    if (IdxGlobals.bookmarks.some(e => e.PageURL == formData.get("pageURL"))) {
		Common.toast("Bookmark already exists with this URL", "error");
	} else {
        formData.append("tags", JSON.stringify(IdxGlobals.tags));
        var response = await fetch("/php/add-bookmark.php", {method: "POST", body: formData});
        response = await response.json();
        if (response.Success) {
            if (IdxGlobals.activeBookmarks.length < 1) { IdxGlobals.container.classList.remove("empty"); }
            IdxGlobals.activeBookmarks.push(response.BookmarkInfo);
            IdxGlobals.bookmarks.push(response.BookmarkInfo);
            IdxGlobals.container.appendChild(createBookmark(response.BookmarkInfo));
            Common.toast("Bookmark created", "success");
        } else {
            Common.toast(response.Message, "error");
        }
	}
}

async function editBookmark(event) {
    event.preventDefault();
    if (!Common.checkErrors([...this.elements])) { return Common.toast("Errors in form fields", "error"); }

	var formData = new FormData(this),
        bookmarkID = (this.dataset.bkTarget).substring(1);

	if (IdxGlobals.bookmarks.some(e => e.PageURL == formData.get("pageURL") && e.BookmarkID != bookmarkID)) {
		Common.toast("Bookmark already exists with this URL", "error");
	} else {
        formData.append("bookmarkID", bookmarkID);
        formData.append("tags", JSON.stringify(IdxGlobals.tags));
        var response = await fetch("/php/edit-bookmark.php", {method: "POST", body: formData});
        response = await response.json();
        if (response.Success) {
            IdxGlobals.bookmarks[IdxGlobals.bookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)] = response.BookmarkInfo;
            document.getElementById(`b${response.BookmarkInfo.BookmarkID}`).dataset.href = response.BookmarkInfo.PageURL;
            document.getElementById(`i${response.BookmarkInfo.BookmarkID}`).src = response.BookmarkInfo.ImagePath;
            document.getElementById(`t${response.BookmarkInfo.BookmarkID}`).innerHTML = response.BookmarkInfo.Title;

            Common.toast("Bookmark updated", "success");
        } else {
            Common.toast(response.Message, "error")
        }
    }
}

function removeBookmarks(arr) {
    arr.forEach(ele => document.getElementById(`b${ele["BookmarkID"]}`).remove());
}

function removeAllBookmarks(ctnr) {
    while (ctnr.firstChild) { ctnr.removeChild(ctnr.firstChild); }
}

function spliceBookmark(arr, bookmarkID) {
    arr.splice(arr.findIndex(({BookmarkID}) => BookmarkID == bookmarkID), 1);
}

function bookmarksEmpty(arr) {
    if (arr.length < 1) {
        IdxGlobals.container.classList.add("empty");
        return true;
    } else {
        IdxGlobals.container.classList.remove("empty");
        return false;
    }
}

async function deleteBookmark(event) {
	event.stopPropagation();
	var formData = new FormData(),
		bookmark = document.getElementById(this.dataset.parent),
		bookmarkID = bookmark.id.substring(1);

	formData.append("bookmarkID", bookmarkID);

    var response = await fetch("/php/delete-bookmark.php", {method: "POST", body: formData});
    response = await response.json();
    if (response.Success) {
        bookmark.remove();
        spliceBookmark(IdxGlobals.bookmarks, bookmarkID);
        spliceBookmark(IdxGlobals.activeBookmarks, bookmarkID);
        bookmarksEmpty(IdxGlobals.activeBookmarks);
        Common.toast("Bookmark deleted", "success");
    } else {
        Common.toast(response.Message, "error");
    }
}

/******************************* SEARCH *******************************/
function hideBookmarks(arr) {
    arr.forEach(function(e) { document.getElementById(`b${e["BookmarkID"]}`).classList.add("hidden"); });
}

function showBookmarks(arr) {
    arr.forEach(function(e) { document.getElementById(`b${e["BookmarkID"]}`).classList.remove("hidden"); });
}

function searchBookmarks() {
    if (this.value.length > 0) {
        var terms = regexEscape(this.value.trim()).split(" "),
            titles = terms.filter(term => term.match(/(?<=(title|caption|label):)[^\s]*/gi)) || [],
            urls = terms.filter(term => term.match(/(?<=(url|site|link):)[^\s]*/gi)) || [],
            tags = terms.filter(term => term.match(/(?<=tag:)[^\s]*/gi)) || [],
            prefixes = titles.concat(urls, tags),
            unstrict = terms.filter(term => !prefixes.includes(term));

        if (!this.dataset.and) {
            [titles, urls, tags, unstrict] = [titles, urls, tags, unstrict].map(arr => arr.length > 0 ? arr.join("|").replace(/(title|url|tag):/gi, "") : arr = "^ $");
        } else {
            [titles, urls, tags, unstrict] = [titles, urls, tags, unstrict].map(arr => arr.length > 0 ? arr = `(?=.*${arr.join(")(?=.*").replace(/(title|url|tag):/gi, "")}` : arr = "^ $");
        }

        var reTitle = new RegExp(!this.dataset.fullWord ? titles : `^${titles}$`, "i"),
            reURL = new RegExp(!this.dataset.fullWord ? urls : `^${urls}$`, "i"),
            reTag = new RegExp(!this.dataset.fullWord ? tags : `^${tags}$`, "i"),
            reUnstrict = new RegExp(!this.dataset.fullWord ? unstrict : `^${unstrict}$`, "i");

        filteredBookmarks = IdxGlobals.bookmarks.filter(bk => {
            return reTitle.test(bk["Title"]) || reURL.test(bk["PageURL"]) || reTag.test(bk["Tags"]) ||
                reUnstrict.test(bk["Title"]) || reUnstrict.test(bk["PageURL"]) || reUnstrict.test(bk["Tags"]);
        });

        hideBookmarks(IdxGlobals.activeBookmarks);
        showBookmarks(filteredBookmarks);
        bookmarksEmpty(filteredBookmarks);
    } else {
        bookmarksEmpty(filteredBookmarks);
        hideBookmarks(filteredBookmarks);
        showBookmarks(IdxGlobals.activeBookmarks);
    }
}

/******************************* TAGS *******************************/
function createTag(tagText, tagsCtn) {
    var tag = `<div class="tag" id="tag-${tagText}">
                    <div class="tag-text">${tagText}</div>
                    <span id="tagx-${tagText}" class="tag-x" data-form="${tagsCtn.id.substring(0, tagsCtn.id.indexOf("-"))}">×</span>
                </div>`;
    tagsCtn.insertAdjacentHTML("afterbegin", tag);

    var tagX = document.getElementById(`tagx-${tagText}`);
    tagX.addEventListener("click", function() {
        let tagBtn = document.getElementById("tag-btn");
        tagBtn.classList.remove("del");
        tagBtn.classList.add("add");
        removeTag(tagText);
    });

}

function createTags(arr, tagsCtn) {
    arr.forEach(tagText => { createTag(tagText, tagsCtn); });
}

function removeTag(tagText) {
    var tag = document.getElementById(`tag-${tagText}`);
    tag.remove();
    IdxGlobals.tags = IdxGlobals.tags.filter(e => e !== tagText);
}

function hideTags(arr) {
    arr.forEach(function(e) { document.getElementById(`tag-${e}`).classList.add("hidden"); });
}

function showTags(arr) {
    arr.forEach(function(e) { document.getElementById(`tag-${e}`).classList.remove("hidden"); });
}

function searchTags() {
    var tagBtn = document.getElementById("tag-btn");
    if (this.value.length > 0) {
        var reTag = new RegExp(regexEscape(this.value), "i"),
            tagsActive = IdxGlobals.tags.filter(e => { return reTag.test(e); });
        hideTags(IdxGlobals.tags);
        showTags(tagsActive);
        if (IdxGlobals.tags.includes(this.value)) {
            tagBtn.classList.remove("add");
            tagBtn.classList.add("del");
        } else {
            tagBtn.classList.remove("del");
            tagBtn.classList.add("add");
        }
    } else {
        showTags(IdxGlobals.tags);
        tagBtn.classList.remove("del", "add");
    }
}

function updateTag() {
    var tagText = document.getElementById("tag-search").value,
        tagsCtn = document.getElementById("tags");
    if (this.classList.contains("add")) {
        IdxGlobals.tags.push(tagText);
        createTag(tagText, tagsCtn);
        this.classList.remove("add");
        this.classList.add("del");
    } else if (this.classList.contains("del")) {
        removeTag(tagText);
        this.classList.remove("del");
        this.classList.add("add");
    }
}

/******************************* SORT *******************************/
function sortBookmarks() {
    let sorted = [...IdxGlobals.bookmarks];
    switch (this.id) {
        case IdxGlobals.sort: return;
        case "title-asc": sorted.sort((a,b) => a.Title.localeCompare(b.Title)); break;
        case "title-desc": sorted.sort((a,b) => b.Title.localeCompare(a.Title)); break;
        case "views-asc": sorted.sort((a,b) => a.Views.localeCompare(b.Views)); break;
        case "views-desc": sorted.sort((a,b) => b.Views.localeCompare(a.Views)); break;
        case "size-asc": sorted.sort((a,b) => a.ImageSize - b.ImageSize); break;
        case "size-desc": sorted.sort((a,b) => b.ImageSize - a.ImageSize); break;
        case "created-asc": sorted.sort((a,b) => a.DateCreated.localeCompare(b.DateCreated)); break;
        case "created-desc": sorted.sort((a,b) => b.DateCreated.localeCompare(a.DateCreated)); break;
        case "modified-asc": sorted.sort((a,b) => a.DateModified.localeCompare(b.DateModified)); break;
        case "modified-desc": sorted.sort((a,b) => b.DateModified.localeCompare(a.DateModified)); break;
    }
    sorted.forEach((e, i) => document.getElementById(`b${e.BookmarkID}`).style.order = (i + 1) * 20);
    IdxGlobals.sort = this.id;
}