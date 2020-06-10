import * as Cmn from "./modules/common.js";

const HomeG = {
    account: {
        curTab: "acc-tab-info",
        curPanel: "acc-panel-info",
        info: null
    },
    bookmarks: [],
    container: null,
    eventListeners: [{
            "id": "account",
            "eventType": "click",
            "function": modalAccount
        }, {
            "id": "adv-search-add",
            "eventType": "click",
            "function": addSearchTerm
        }, {
            "id": "create-bookmark",
            "eventType": "click",
            "function": () => modalBookmark("upload")
        }, {
            "id": "bk-file-input",
            "eventType": "change",
            "function": uploadFile
        }, {
            "id": "bk-file-input-group",
            "eventType": "click",
            "function": updateFileInput
        }, {
            "id": "logout",
            "eventType": "click",
            "function": logout
        }, {
            "id": "preview",
            "eventType": "click",
            "function": () => openBookmark(true)
        }, {
            "id": "search-group",
            "eventType": "click",
            "function": () => event.stopPropagation()
        }, {
            "id": "searchbar",
            "eventType": "input",
            "function": searchBookmarks,
            "debounce": 100
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
            "class": "sortmenu-btn",
            "eventType": "click",
            "function": sortBookmarks
        }, {
            "dataListener": "acc-btn",
            "eventType": "click",
            "function": e => {
                Cmn.switchPanel(HomeG.account.curPanel, e.target.dataset.panel);
                HomeG.account.curPanel = e.target.dataset.panel;
                Cmn.switchTab(HomeG.account.curTab, e.target.id);
                HomeG.account.curTab = e.target.id;
            }
        }, {
            "dataListener": "dropdown",
            "eventType": "click",
            "function": Cmn.selectDropdown
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
            "function": () => Cmn.toggleMenu()
        }, {
            "dataListener": "menuChild",
            "eventType": "click",
            "function": () => Cmn.toggleMenu(true)
        }, {
            "dataListener": "modalClose",
            "eventType": "mousedown",
            "function": () => Cmn.modalClose()
        }, {
            "dataListener": "profileForm",
            "eventType": "submit",
            "function": updateProfile
        }, {
            "dataListener": "searchMode",
            "eventType": "change",
            "function": changeSearchMode
        }, {
            "domObject": document,
            "eventType": "click",
            "function": Cmn.closeMenus
        }],
    search: {
        advContains: null,
        advInput: null,
        advType: null,
        searchbar: null
    },
    tag: {
        container: null,
        search: null
    },
    tags: []
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
    HomeG.tag.search = document.getElementById("tag-search");
    HomeG.tag.container = document.getElementById("tags");
    HomeG.search.advContains = document.getElementById("adv-search-contains");
    HomeG.search.advInput = document.getElementById("adv-search-input");
    HomeG.search.advType = document.getElementById("adv-search-type");
    HomeG.search.searchbar = document.getElementById("searchbar");

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

async function updateProfile() {
    event.preventDefault();
    if (!Cmn.checkErrors([...this.elements])) { return Cmn.toast("Errors in form fields", "error"); }

    let formData = new FormData(this);
    formData.append("formType", this.dataset.type);

    let res = await (await fetch("/php/update-profile.php", {method: "POST", body: formData})).json();
    res.Success ? Cmn.toast(`${Cmn.capitalize(this.dataset.type)} updated`, "success") : Cmn.toast(res.Message, "error");
    if (res.Info) {
        HomeG.account.info.Username = res.Info.Username;
        HomeG.account.info.Email = res.Info.Email;
    }
}

/******************************* MODAL *******************************/
async function modalAccount() {
    let [modal, username, email, dateCreated, accType] = document.querySelectorAll("#acc-modal, #acc-username, #acc-email, #acc-created, #acc-type");
    //if (HomeG.account.info === null) { HomeG.account.info = (await (await fetch("/php/account-info.php")).json()).Info; }
    let info = HomeG.account.info === null ? HomeG.account.info = (await (await fetch("/php/account-info.php")).json()).Info : HomeG.account.info;

    username.value = info.Username;
    email.value = info.Email;
    dateCreated.value = Cmn.formatDate(info.DateCreated);
    dateCreated.title = Cmn.formatDate(info.DateCreated, "datetime");
    accType.value = info.AccessLevel;

    Cmn.closeMenus();
	modal.classList.remove("hidden");
}

function modalBookmark(formType) {
    event.preventDefault();
    let [modal, previewURL, previewImage, previewTitle, form, fileInputGroup, fileLabel, formURL, formTitle, tagSearch, tagBtn, tagsCtn] =
            document.querySelectorAll("#bk-modal, #preview, #preview-image, #preview-title, #bk-f, #bk-file-input-group, #file-label, #bk-f-url, #bk-f-title, #tag-search, #tag-btn, #tags");

    if (formType == "upload") {
        previewURL.dataset.href = "";
        previewTitle.innerHTML = "No Title";
        previewImage.src = "images/No-Image.jpg";

        fileInputGroup.classList.remove("del");
        fileLabel.title = fileLabel.innerHTML = "";
        fileLabel.classList.add("hidden");

        formURL.value = "";
        formTitle.value = "";

        tagSearch.value = "";
        tagBtn.classList.remove("add", "del");
        HomeG.tags = [];
        while (tagsCtn.firstChild) { tagsCtn.removeChild(tagsCtn.firstChild); }

        form.removeEventListener("submit", editBookmark);
        form.addEventListener("submit", uploadBookmark);
    } else if (formType == "edit") {
        let	bkInfo = HomeG.bookmarks[HomeG.bookmarks.findIndex(({BookmarkID}) => BookmarkID == event.target.dataset.parent.substring(1))];
        form.dataset.bkTarget = event.target.dataset.parent;

        previewURL.dataset.href = bkInfo.PageURL;
        previewTitle.innerHTML = bkInfo.Title;
        previewImage.src = bkInfo.ImagePath;

        let hasImage = !/No-Image.jpg$/.test(bkInfo.ImagePath);
        fileInputGroup.classList.toggle("del", hasImage);
        fileLabel.title = fileLabel.innerHTML = hasImage ? bkInfo.ImagePath.substring(bkInfo.ImagePath.lastIndexOf("/") + 1) : "";
        fileLabel.classList.toggle("hidden", !hasImage);

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
        form.addEventListener("submit", editBookmark);
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

function updateFileInput() {
    if (this.classList.contains("del")) {
        event.preventDefault();
        let [preview, fileLabel, fileInput, inputRemove] = document.querySelectorAll("#preview-image, #file-label, #bk-file-input, #bk-file-remove");
        preview.src = "/images/No-Image.jpg";
        fileLabel.title = fileLabel.innerHTML = "";
        fileLabel.classList.add("hidden");
        this.classList.remove("del");
        fileInput.value = "";
        inputRemove.value = "true";
    }
}

function uploadFile() {
    let fileName = this.value.split("\\").pop(),
        [preview, inputGroup, fileLabel, inputRemove] = document.querySelectorAll("#preview-image, #bk-file-input-group, #file-label, #bk-file-remove");
    inputRemove.value = "false";
    fileLabel.classList.toggle("hidden", !fileName);
    fileLabel.title = fileLabel.innerHTML = fileName;

    if (this.files.length > 0) {
        let reader = new FileReader();
        reader.onload = e => preview.src = e.target.result;
        reader.readAsDataURL(this.files[0]);
        inputGroup.classList.add("del");
    } else {
        preview.src = "/images/No-Image.jpg";
        inputGroup.classList.remove("del");
    }
}

/******************************* BOOKMARKS *******************************/
function bookmarksEmpty(arr) {
    arr.length < 1 ? HomeG.container.classList.add("empty") : HomeG.container.classList.remove("empty");
    return Cmn.checkEmpty(arr);
}

function createBookmark(bkInfo) {
    let html = `<figure class="bookmark" id="b${bkInfo.BookmarkID}" data-href="${bkInfo.PageURL}">
                    <figcaption class="title" id="t${bkInfo.BookmarkID}">${bkInfo.Title}</figcaption>
                    <img class="image lazy" id="i${bkInfo.BookmarkID}" src="/images/Lazy-Load.jpg" data-src="${bkInfo.ImagePath}">
                    <div class="menu">
                        <div class="menu-content hidden" id="m${bkInfo.BookmarkID}">
                            <div id="mc-i${bkInfo.BookmarkID}" data-parent="b${bkInfo.BookmarkID}">Info</div>
                            <div id="mc-e${bkInfo.BookmarkID}" data-parent="b${bkInfo.BookmarkID}">Edit</div>
                            <div id="mc-d${bkInfo.BookmarkID}" data-parent="b${bkInfo.BookmarkID}">Delete</div>
                        </div>
                        <div class="menu-toggle" id="m-t${bkInfo.BookmarkID}" data-menu="m${bkInfo.BookmarkID}"></div>
                    </div>
                </figure>`;

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
    return  `<table class="table-vert right">
                <tr>
                    <th>Date Created</th>
                    <td title="${Cmn.formatDate(bk.DateCreated, "datetime")}">${Cmn.formatDate(bk.DateCreated)}</td>
                </tr>
                <tr>
                    <th>Date Modified</th>
                    <td title="${Cmn.formatDate(bk.DateModified, "datetime")}">${Cmn.formatDate(bk.DateModified)}</td>
                </tr>
                <tr>
                    <th>Image Size</th>
                    <td title="${bk.ImageSize} bytes">${Cmn.formatBytes(bk.ImageSize)}</td>
                </tr>
                <tr>
                    <th>View Count</th>
                    <td>${bk.Views}</td>
                </tr>
            </table>`;
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
function addSearchTerm() {
    let contains = HomeG.search.advContains.dataset.value,
        type = HomeG.search.advType.dataset.value.toLowerCase(),
        term = HomeG.search.advInput.value,
        searchbar = HomeG.search.searchbar,
        search = searchbar.value,
        result = `${contains == "does not contain" ? "-" : ""}${type == "anything" ? "" : `${type}:`}${term}`;

    searchbar.value = `${search}${search.length > 0 ? " " : ""}${result}`;
    searchBookmarks();
}

function changeSearchMode() {
    let searchbar = HomeG.search.searchbar,
        option = event.target.dataset.option;

    searchbar.dataset[option] = event.target.checked;
    searchBookmarks();
}

function displayBookmarks(arr, show = true) {
    arr.forEach(e => document.getElementById(`b${e["BookmarkID"]}`).classList.toggle("hidden", !show));
}

function searchBookmarks() {
    let filteredBookmarks = [],
        searchbar = HomeG.search.searchbar;

    if (searchbar.value.length > 0) {
        let terms = searchbar.value.trim(),
            regexes = [/(?<!-title:)(?<=title:)\S*/gi, /(?<!-url:)(?<=url:)\S*/gi, /(?<!-tag:)(?<=tag:)\S*/gi, /(?<=^|\s)(?!-|(title|tag|url):)\S*\S/gi, /(?<=-title:)\S*/gi, /(?<=-url:)\S*/gi, /(?<=-tag:)\S*/gi, /(?<=-(?!(title|url|tag):))\S*/gi],
            [titles, urls, tags, any, negTitles, negUrls, negTags, negAny] = regexes.map(re => terms.match(re) || []),
            isAnd = (searchbar.dataset.and == "true"),
            wholeDelim = searchbar.dataset.whole == "true" ? "\\b" : "",
            prefix = `${isAnd ? "(?=.*" : ".*"}${wholeDelim}`,
            suffix = `${wholeDelim}${isAnd ? ")" : ""}.*`;

        [titles, urls, tags, any, negTitles, negUrls, negTags, negAny] = [titles, urls, tags, any, negTitles, negUrls, negTags, negAny].map(arr => arr.length > 0 ? `${prefix}${arr.join(`${wholeDelim}${isAnd ? ")(?=.*" : "|"}`)}${suffix}` : "");

        let hasPositives = [titles, urls, tags, any].some(e => e.length > 0),
            hasNegatives = [negTitles, negUrls, negTags, negAny].some(e => e.length > 0),
            [reTitle, reURL, reTag, reAny, reNegTitle, reNegURL, reNegTag, reNegAny] = [titles, urls, tags, any, negTitles, negUrls, negTags, negAny].map(arr => RegExp(`^${arr}$`, "i"));

        filteredBookmarks = HomeG.bookmarks.filter(bk => {
            let [title, pageUrl, tags] = [bk.Title, bk.PageURL, bk.Tags.length > 0 ? bk.Tags : [null]];
            return ( !reNegTitle.test(title) && !reNegURL.test(pageUrl) && !tags.some(tag => reNegTag.test(tag)) && ![title, pageUrl, tags].flat().some(term => reNegAny.test(term)) )
                    && ( reTitle.test(title) || reURL.test(pageUrl) || tags.some(tag => reTag.test(tag)) || [title, pageUrl, tags].flat().some(term => reAny.test(term)) || (!hasPositives && hasNegatives));
        });

        displayBookmarks(HomeG.bookmarks, false);
        displayBookmarks(filteredBookmarks);
        bookmarksEmpty(filteredBookmarks);
    } else {
        displayBookmarks(filteredBookmarks, false);
        bookmarksEmpty(HomeG.bookmarks);
        displayBookmarks(HomeG.bookmarks);
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
        removeTag(tagText);
    });

}

function createTags(arr, tagsCtn) {
    arr.forEach(tagText => { createTag(tagText, tagsCtn); });
}

function displayTags(arr, show = true) {
    arr.forEach(e => document.getElementById(`tag-${e}`).classList.toggle("hidden", !show));
}

function removeTag(tagText) {
    let tag = document.getElementById(`tag-${tagText}`);
    tag.remove();
    HomeG.tags = HomeG.tags.filter(e => e !== tagText);
}

function searchTags() {
    let tagBtn = document.getElementById("tag-btn");
    if (this.value.length > 0) {
        let reTag = new RegExp(Cmn.regexEscape(this.value), "i"),
            tagsActive = HomeG.tags.filter(e => { return reTag.test(e); });
        displayTags(HomeG.tags, false);
        displayTags(tagsActive);
        if (HomeG.tags.includes(this.value)) {
            tagBtn.classList.remove("add");
            tagBtn.classList.add("del");
        } else {
            tagBtn.classList.remove("del");
            tagBtn.classList.add("add");
        }
    } else {
        displayTags(HomeG.tags);
        tagBtn.classList.remove("del", "add");
    }
}

function updateTag() {
    let input = HomeG.tag.search,
        tagText = input.value;
    if (this.classList.contains("add")) {
        HomeG.tags.push(tagText);
        createTag(tagText, HomeG.tag.container);
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