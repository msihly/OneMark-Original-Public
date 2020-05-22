import * as Cmn from "./modules/common.js";

const HomeG = {
    accCurTab: "acc-tab-info",
    accCurPanel: "acc-panel-info",
    bookmarks: [],
    container: "",
    eventListeners: [{
            "id": "account",
            "eventType": "click",
            "function": modalAccount
        }, {
            "id": "acc-pass-form",
            "eventType": "submit",
            "function": () => updatePassword()
        }, {
            "id": "create-bookmark",
            "eventType": "click",
            "function": () => modalBookmark("upload")
        }, {
            "id": "image-upload",
            "eventType": "change",
            "function": fileUpload
        }, {
            "id": "logout",
            "eventType": "click",
            "function": () => logout()
        }, {
            "id": "preview",
            "eventType": "click",
            "function": () => openBookmark(true)
        }, {
            "id": "searchbar",
            "eventType": "input",
            "function": searchBookmarks,
            "debounce": 100
        }, {
            "id": "remove-upload",
            "eventType": "click",
            "function": removeUpload
        }, {
            "class": "sortmenu-btn",
            "eventType": "click",
            "function": sortBookmarks
        }, {
            "id": "tag-btn",
            "eventType": "click",
            "function": updateTag
        }, {
            "id": "tag-search",
            "eventType": "input",
            "function": searchTags,
            "debounce": 50
        }, {
            "dataListener": "acc-btn",
            "eventType": "click",
            "function": function(event) {
                Cmn.switchPanel(HomeG.accCurPanel, event.target.dataset.panel);
                HomeG.accCurPanel = event.target.dataset.panel;
                Cmn.switchTab(HomeG.accCurTab, event.target.id);
                HomeG.accCurTab = event.target.id;
            }
        }, {
            "dataListener": "errorCheck",
            "eventType": "input",
            "function": Cmn.errorCheck
        }, {
            "dataListener": "inputPreview",
            "eventType": "input",
            "function": inputPreview
        }, {
            "dataListener": "menu",
            "eventType": "click",
            "function": Cmn.toggleMenu
        }, {
            "dataListener": "modalClose",
            "eventType": "mousedown",
            "function": () => Cmn.modalClose()
        }, {
            "domObject": document,
            "eventType": "click",
            "function": Cmn.closeMenus
        }],
    tags: [],
    tagsCtn: "",
    tagSearch: ""
}

const LazyObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.src = e.target.dataset.src;
            e.target.classList.remove("lazy");
            LazyObserver.unobserve(e.target);
        }
    });
});

window.addEventListener("DOMContentLoaded", async function() {
    HomeG.container = document.getElementById("bookmark-container");
    HomeG.tagSearch = document.getElementById("tag-search");
    HomeG.tagsCtn = document.getElementById("tags");

    Cmn.addListeners(HomeG.eventListeners);

    HomeG.bookmarks = await getBookmarks();
    if (!localStorage.getItem("sort")) { localStorage.setItem("sort", "modified-desc"); }

    if (!bookmarksEmpty(HomeG.bookmarks)) {
        createBookmarks(HomeG.container, HomeG.bookmarks);
        sortBookmarks({method: localStorage.getItem("sort")});
    }
});

/******************************* ACCOUNT *******************************/
async function logout() {
    event.preventDefault();
    let res = await (await fetch("/php/logout.php")).json();
    if (res.Success) {
        Cmn.toast(res.Message, "success");
        setTimeout(() => window.location.href = "/login.php", 1000);
    } else {
        Cmn.toast(res.Message, "error");
    }
}

async function updatePassword() {
    event.preventDefault();
    if (!Cmn.checkErrors([...this.elements])) { return Cmn.toast("Errors in form fields", "error"); }

    let formData = new FormData(this),
        res = await (await fetch("/php/update-pass.php", {method: "POST", body: formData})).json();

    res.Success ? Cmn.toast(res.Message, "success") : Cmn.toast(res.Message, "error");
}

/******************************* MODAL *******************************/
async function modalAccount() {
    let [modal, username, email, dateCreated, accType] = document.querySelectorAll("#acc-modal, #acc-username, #acc-email, #acc-created, #acc-type"),
        res = await (await fetch("/php/account-info.php")).json();

    if (!res.Success) { return Cmn.toast(res.Message, "error"); }
    username.innerHTML = res.Info.Username;
    email.innerHTML = res.Info.Email;
    dateCreated.innerHTML = res.Info.DateCreated;
    accType.innerHTML = res.Info.AccessLevel;

    Cmn.closeMenus();
	modal.classList.remove("hidden");
}

function modalBookmark(formType) {
    event.preventDefault();
    let [modal, previewURL, previewTitle, previewImage, form, formURL, formTitle, tagSearch, tagBtn, tagsCtn] =
            document.querySelectorAll("#bk-modal, #preview, #preview-title, #preview-image, #bk-f, #bk-f-url, #bk-f-title, #tag-search, #tag-btn, #tags");

    if (formType == "upload") {
        previewURL.dataset.href = "";
        previewTitle.innerHTML = "No Title";
        previewImage.src = "images/No-Image.jpg";

        formURL.value = "";
        formTitle.value = "";

        tagSearch.value = "";
        tagBtn.classList.remove("add", "del");
        HomeG.tags = [];
        while (tagsCtn.firstChild) { tagsCtn.removeChild(tagsCtn.firstChild); }

        form.removeEventListener("submit", editBookmark);
        form.addEventListener("submit", () => uploadBookmark());
    } else if (formType == "edit") {
        let	bkInfo = HomeG.bookmarks[HomeG.bookmarks.findIndex(({BookmarkID}) => BookmarkID == event.target.dataset.parent.substring(1))];
        form.dataset.bkTarget = event.target.dataset.parent;

        previewURL.dataset.href = bkInfo.PageURL;
        previewTitle.innerHTML = bkInfo.Title;
        previewImage.src = bkInfo.ImagePath;

        formURL.value = bkInfo.PageURL;
        formTitle.value = bkInfo.Title;

        tagSearch.value = "";
        tagBtn.classList.remove("add", "del");
        HomeG.tags = [...bkInfo.Tags];
        while (tagsCtn.firstChild) { tagsCtn.removeChild(tagsCtn.firstChild); }
        createTags(HomeG.tags, tagsCtn);

        Cmn.errorCheck.call(formURL);
        Cmn.errorCheck.call(formTitle);

        form.removeEventListener("submit", uploadBookmark);
        form.addEventListener("submit", () => editBookmark());
    }

    Cmn.closeMenus();
	modal.classList.remove("hidden");
}

/******************************* FORM *******************************/
function inputPreview() {
    let preview = document.getElementById(this.dataset.preview);
    if (this.dataset.attr == "innerHTML") { preview.innerHTML = Cmn.isValid(this).Valid ? this.value : this.dataset.invalidValue; }
    else { preview.setAttribute(this.dataset.attr, Cmn.isValid(this).Valid ? this.value : this.dataset.invalidValue); }
}

function fileUpload() {
	let fileName = this.value.split("\\").pop(),
		label = document.getElementById("bk-image-name"),
        imagePreview = document.getElementById("preview-image");

    document.getElementById("bk-f-remove").value = "false";
	label.classList.toggle("hidden", !fileName);
	label.innerHTML = fileName;

	if (this.files.length != 0) {
		let reader = new FileReader();
		reader.onload = function(e) {imagePreview.src = e.target.result;}
		reader.readAsDataURL(this.files[0]);
	} else {
		imagePreview.src = "/images/No-Image.jpg";
    }
}

function removeUpload() {
    let label = document.getElementById("bk-image-name");
    document.getElementById("image-upload").value = "";
    document.getElementById("bk-f-remove").value = "true";
    document.getElementById("preview-image").src = "/images/No-Image.jpg";
    label.innerHTML = "";
    label.classList.add("hidden");
}

/******************************* BOOKMARKS *******************************/
function bookmarksEmpty(arr) {
    arr.length < 1 ? HomeG.container.classList.add("empty") : HomeG.container.classList.remove("empty");
    return Cmn.checkEmpty(arr);
}

function createBookmark(bkInfo) {
    let html = `<div class="bookmark" id="b${bkInfo.BookmarkID}" data-href="${bkInfo.PageURL}">
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

    let frag = document.createRange().createContextualFragment(html),
        outer = frag.querySelector(`#b${bkInfo.BookmarkID}`);
    outer.addEventListener("click", () => openBookmark());
    outer.addEventListener("mousedown", () => { if (event.button == 1) {openBookmark();} });
    frag.querySelector(`#m-t${bkInfo.BookmarkID}`).addEventListener("click", Cmn.toggleMenu);
    frag.querySelector(`#mc-i${bkInfo.BookmarkID}`).addEventListener("click", () => document.body.appendChild(Cmn.createAlert({"text": getBookmarkInfo(bkInfo.BookmarkID)})));
    frag.querySelector(`#mc-e${bkInfo.BookmarkID}`).addEventListener("click", () => modalBookmark("edit"));
    frag.querySelector(`#mc-d${bkInfo.BookmarkID}`).addEventListener("click", () => deleteBookmark());
    LazyObserver.observe(frag.querySelector(`#i${bkInfo.BookmarkID}`));

	return frag;
}

function createBookmarks(ctnr, arr, sort = null) {
    let	docFrag = document.createDocumentFragment();
    arr.forEach(bkInfo => docFrag.appendChild(createBookmark(bkInfo)));
    ctnr.appendChild(docFrag);
    if (sort !== null) { sortBookmarks({method: sort}); }
}

async function deleteBookmark(bookmarkID = null) {
    event.stopPropagation();

    bookmarkID = bookmarkID === null ? (this || event.target).dataset.parent.substring(1) : bookmarkID;
    let bookmark = document.getElementById(`b${bookmarkID}`),
        formData = new FormData();

	formData.append("bookmarkID", bookmarkID);

    let res = await (await fetch("/php/delete-bookmark.php", {method: "POST", body: formData})).json();
    if (res.Success) {
        bookmark.remove();
        spliceBookmark(HomeG.bookmarks, bookmarkID);
        bookmarksEmpty(HomeG.bookmarks);
        Cmn.toast("Bookmark deleted", "success");
    } else {
        Cmn.toast(res.Message, "error");
    }
}

async function editBookmark() {
    event.preventDefault();
    if (!Cmn.checkErrors([...this.elements])) { return Cmn.toast("Errors in form fields", "error"); }

	let formData = new FormData(this),
        bookmarkID = (this.dataset.bkTarget).substring(1);

	if (HomeG.bookmarks.some(e => e.PageURL == formData.get("pageURL") && e.BookmarkID != bookmarkID)) {
		Cmn.toast("Bookmark already exists with this URL", "error");
	} else {
        formData.append("bookmarkID", bookmarkID);
        formData.append("tags", JSON.stringify(HomeG.tags));
        let res = await (await fetch("/php/edit-bookmark.php", {method: "POST", body: formData})).json();
        if (res.Success) {
            HomeG.bookmarks[HomeG.bookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)] = res.BookmarkInfo;
            document.getElementById(`b${res.BookmarkInfo.BookmarkID}`).dataset.href = res.BookmarkInfo.PageURL;
            document.getElementById(`i${res.BookmarkInfo.BookmarkID}`).src = res.BookmarkInfo.ImagePath;
            document.getElementById(`t${res.BookmarkInfo.BookmarkID}`).innerHTML = res.BookmarkInfo.Title;

            Cmn.toast("Bookmark updated", "success");
        } else {
            Cmn.toast(res.Message, "error")
        }
    }
}

function getBookmarkInfo(bookmarkID) {
    let bk = HomeG.bookmarks[HomeG.bookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)];
    return `<b>Date Created</b>
            ${bk.DateCreated}
            <b>Date Modified</b>
            ${bk.DateModified}
            <b>Image Size</b>
            ${Cmn.formatBytes(bk.ImageSize)}
            <b>View Count</b>
            ${bk.Views}`;
}

async function getBookmarks() {
    let res = await (await fetch("/php/get-bookmarks.php")).json();
    if (!res.Success) { Cmn.toast("Error getting bookmarks", "error"); }
    return res.Bookmarks;
}

function openBookmark(preview = false) {
    event.preventDefault();
    let ele = this || event.path[1],
        href = ele.dataset.href;
    if (href && href != "#") { window.open(href); }
    if (!preview) {
        let bookmarkID = ele.id.substring(1),
            formData = new FormData();
        formData.append("bookmarkID", bookmarkID);
        fetch("/php/add-view.php", {method: "POST", body: formData});
        let bk = HomeG.bookmarks[HomeG.bookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)];
        bk.Views = parseInt(bk.Views) + 1;
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

async function uploadBookmark() {
    event.preventDefault();
    if (!Cmn.checkErrors([...this.elements])) { return Cmn.toast("Errors in form fields", "error"); }

    let formData = new FormData(this);

    if (HomeG.bookmarks.some(e => e.PageURL == formData.get("pageURL"))) {
		Cmn.toast("Bookmark already exists with this URL", "error");
	} else {
        formData.append("tags", JSON.stringify(HomeG.tags));
        let res = await (await fetch("/php/add-bookmark.php", {method: "POST", body: formData})).json();
        if (res.Success) {
            if (HomeG.bookmarks.length < 1) { HomeG.container.classList.remove("empty"); }
            HomeG.bookmarks.push(res.BookmarkInfo);
            HomeG.container.appendChild(createBookmark(res.BookmarkInfo));
            Cmn.toast("Bookmark created", "success");
        } else {
            Cmn.toast(res.Message, "error");
        }
	}
}

/******************************* SEARCH *******************************/
function hideBookmarks(arr) {
    arr.forEach(e => document.getElementById(`b${e["BookmarkID"]}`).classList.add("hidden"));
}

function showBookmarks(arr) {
    arr.forEach(e => document.getElementById(`b${e["BookmarkID"]}`).classList.remove("hidden"));
}

function searchBookmarks() {
    let filteredBookmarks = [];
    if (this.value.length > 0) {
        let terms = Cmn.regexEscape(this.value.trim()).split(" "),
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

        let reTitle = new RegExp(!this.dataset.fullWord ? titles : `^${titles}$`, "i"),
            reURL = new RegExp(!this.dataset.fullWord ? urls : `^${urls}$`, "i"),
            reTag = new RegExp(!this.dataset.fullWord ? tags : `^${tags}$`, "i"),
            reUnstrict = new RegExp(!this.dataset.fullWord ? unstrict : `^${unstrict}$`, "i");

        filteredBookmarks = HomeG.bookmarks.filter(bk => {
            return reTitle.test(bk["Title"]) || reURL.test(bk["PageURL"]) || reTag.test(bk["Tags"]) ||
                reUnstrict.test(bk["Title"]) || reUnstrict.test(bk["PageURL"]) || reUnstrict.test(bk["Tags"]);
        });

        hideBookmarks(HomeG.bookmarks);
        showBookmarks(filteredBookmarks);
        bookmarksEmpty(filteredBookmarks);
    } else {
        hideBookmarks(filteredBookmarks);
        bookmarksEmpty(HomeG.bookmarks);
        showBookmarks(HomeG.bookmarks);
    }
}

/******************************* TAGS *******************************/
function createTag(tagText, tagsCtn) {
    let tag = `<div class="tag" id="tag-${tagText}">
                    <div class="tag-text">${tagText}</div>
                    <span id="tagx-${tagText}" class="tag-x" data-form="${tagsCtn.id.substring(0, tagsCtn.id.indexOf("-"))}">\u00D7</span>
                </div>`;
    tagsCtn.insertAdjacentHTML("afterbegin", tag);

    let tagX = document.getElementById(`tagx-${tagText}`);
    tagX.addEventListener("click", () => {
        let tagBtn = document.getElementById("tag-btn");
        tagBtn.classList.remove("del");
        tagBtn.classList.add("add");
        removeTag(tagText);
    });

}

function createTags(arr, tagsCtn) {
    arr.forEach(tagText => { createTag(tagText, tagsCtn); });
}

function hideTags(arr) {
    arr.forEach(e => document.getElementById(`tag-${e}`).classList.add("hidden"));
}

function removeTag(tagText) {
    let tag = document.getElementById(`tag-${tagText}`);
    tag.remove();
    HomeG.tags = HomeG.tags.filter(e => e !== tagText);
}

function showTags(arr) {
    arr.forEach(e => document.getElementById(`tag-${e}`).classList.remove("hidden"));
}

function searchTags() {
    let tagBtn = document.getElementById("tag-btn");
    if (this.value.length > 0) {
        let reTag = new RegExp(Cmn.regexEscape(this.value), "i"),
            tagsActive = HomeG.tags.filter(e => { return reTag.test(e); });
        hideTags(HomeG.tags);
        showTags(tagsActive);
        if (HomeG.tags.includes(this.value)) {
            tagBtn.classList.remove("add");
            tagBtn.classList.add("del");
        } else {
            tagBtn.classList.remove("del");
            tagBtn.classList.add("add");
        }
    } else {
        showTags(HomeG.tags);
        tagBtn.classList.remove("del", "add");
    }
}

function updateTag() {
    let input = HomeG.tagSearch,
        tagText = input.value;
    if (this.classList.contains("add")) {
        HomeG.tags.push(tagText);
        createTag(tagText, HomeG.tagsCtn);
        input.value = "";
        this.classList.remove("add");
    } else if (this.classList.contains("del")) {
        removeTag(tagText);
        input.value = "";
        this.classList.remove("del");
    }
}

/******************************* SORT *******************************/
function sortBookmarks({method = null}) {
    let current = localStorage.getItem("sort"),
        sorted = [...HomeG.bookmarks];

    if (method === null) {
        if (this.id === current) { return; }
        else { method = this.id; }
    }

    switch (method) {
        case "modified-desc": sorted.sort((a,b) => b.DateModified.localeCompare(a.DateModified)); break;
        case "modified-asc": sorted.sort((a,b) => a.DateModified.localeCompare(b.DateModified)); break;
        case "created-desc": sorted.sort((a,b) => b.DateCreated.localeCompare(a.DateCreated)); break;
        case "created-asc": sorted.sort((a,b) => a.DateCreated.localeCompare(b.DateCreated)); break;
        case "title-desc": sorted.sort((a,b) => b.Title.localeCompare(a.Title)); break;
        case "title-asc": sorted.sort((a,b) => a.Title.localeCompare(b.Title)); break;
        case "views-desc": sorted.sort((a,b) => b.Views.localeCompare(a.Views)); break;
        case "views-asc": sorted.sort((a,b) => a.Views.localeCompare(b.Views)); break;
        case "size-desc": sorted.sort((a,b) => b.ImageSize - a.ImageSize); break;
        case "size-asc": sorted.sort((a,b) => a.ImageSize - b.ImageSize); break;
    }

    sorted.forEach((e, i) => document.getElementById(`b${e.BookmarkID}`).style.order = (i + 1) * 20);
    document.getElementById(current).classList.remove("active");
    (document.getElementById(method) || this).classList.add("active");

    localStorage.setItem("sort", method);
}