import * as Common from "./modules/common.js";

const eventListeners = [
    {
        "eleID": "upload-form",
        "eventType": "submit",
        "function": uploadBookmark
    }, {
        "eleID": "edit-form",
        "eventType": "submit",
        "function": editBookmark
    }, {
        "eleID": "open-upload-modal",
        "eventType": "click",
        "function": modalUpload
    }, {
        "eleID": "sidemenu",
        "eventType": "click",
        "function": toggleMenu
    }, {
        "eleID": "logout",
        "eventType": "click",
        "function": logout
    }, {
        "eleID": "searchbar",
        "eventType": "input",
        "function": searchBookmarks,
        "debounce": 100
    }, {
        "dataListener": "tag-search",
        "eventType": "input",
        "function": searchTags,
        "debounce": 50
    }, {
        "dataListener": "tag-btn",
        "eventType": "click",
        "function": updateTag
    }, {
        "dataListener": "preview",
        "eventType": "click",
        "function": openBookmark
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
        "dataListener": "fileUpload",
        "eventType": "change",
        "function": fileUpload
    }, {
        "domObject": document,
        "eventType": "click",
        "function": closeMenus
    }
];

var container,
    [bookmarks, activeBookmarks, filteredBookmarks, tmpTags, openMenus] = [[], [], [], [], []];

window.onload = async function() {
    bookmarks = await getBookmarks();
    activeBookmarks = [...bookmarks];
    Common.addListeners(eventListeners);
	container = document.getElementById("bookmark-container");
    if (!bookmarksEmpty(activeBookmarks)) { createBookmarks(container, activeBookmarks); }
};

/******************************* GENERAL *******************************/
function regexEscape(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function closeMenus() {
    if (openMenus.length > 0) {
        openMenus.forEach(e => {
            e.classList.toggle("hidden");
            openMenus.shift();
        });
    }
}

function toggleMenu() {
    event.stopPropagation();
    var menu = document.getElementById(this.dataset.menu);
    if (!openMenus.includes(menu)) {
        closeMenus();
        menu.classList.toggle("hidden");
        openMenus.push(menu);
    } else { closeMenus(); }
}

/******************************* ACCOUNT *******************************/
async function logout(event) {
    event.preventDefault();
    var response = await fetch("/php/logout.php");
    response = await response.json();
    if (response.Success) {
        Common.toast(response.Message, "success");
        setTimeout(function() { window.location.href = "/index.html"; }, 1000);
    } else {
        Common.toast(response.Message, "error");
    }
}

/******************************* MODAL *******************************/
function modalEditor() {
	event.stopPropagation();
    var [editor, previewURL, previewTitle, previewImage, form, formURL, formTitle, tagSearch, tagBtn, tagsCtn] =
            document.querySelectorAll("#edit-bookmark, #edit-preview, #edit-preview-title, #edit-preview-image, #edit-form, #edit-form-url, #edit-form-title, #edit-tag-search, #edit-tag-btn, #edit-tags"),
		bkInfo = bookmarks[bookmarks.findIndex(({BookmarkID}) => BookmarkID == this.dataset.parent.substring(1))];

	previewURL.dataset.href = bkInfo.PageURL;
	previewTitle.innerHTML = bkInfo.Title;
	previewImage.src = bkInfo.ImagePath;
	form.dataset.target = this.dataset.parent;
	formURL.value = bkInfo.PageURL;
    formTitle.value = bkInfo.Title;

    tagSearch.value = "";
    tagBtn.classList.remove("add", "del");
    tmpTags = [...bkInfo.Tags];
    while (tagsCtn.firstChild) { tagsCtn.removeChild(tagsCtn.firstChild); }
    createTags(tmpTags, tagsCtn);

    Common.errorCheck.call(formURL);
    Common.errorCheck.call(formTitle);

    closeMenus();
	editor.classList.remove("hidden");
}

function modalUpload(event) {
    event.preventDefault();
    var tagsCtn = document.getElementById("upload-tags");
    while (tagsCtn.firstChild) { tagsCtn.removeChild(tagsCtn.firstChild); }
    tmpTags = [];

    closeMenus();
    document.getElementById(this.dataset.modal).classList.remove("hidden");
}

function modalClose(event) {
	var modal = document.getElementById(this.dataset.modal);
	if (modal == event.target || this.classList.contains("close")) {
		modal.classList.add("hidden");
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
        let tagBtn = document.getElementById(`${this.dataset.form}-tag-btn`);
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
    tmpTags = tmpTags.filter(e => e !== tagText);
}

function hideTags(arr) {
    arr.forEach(function(e) { document.getElementById(`tag-${e}`).classList.add("hidden"); });
}

function showTags(arr) {
    arr.forEach(function(e) { document.getElementById(`tag-${e}`).classList.remove("hidden"); });
}

function searchTags() {
    var tagBtn = document.getElementById(`${this.dataset.form}-tag-btn`);
    if (this.value.length > 0) {
        var reTag = new RegExp(regexEscape(this.value), "i"),
            tagsActive = tmpTags.filter(e => { return reTag.test(e); });
        hideTags(tmpTags);
        showTags(tagsActive);
        if (tmpTags.includes(this.value)) {
            tagBtn.classList.remove("add");
            tagBtn.classList.add("del");
        } else {
            tagBtn.classList.remove("del");
            tagBtn.classList.add("add");
        }
    } else {
        showTags(tmpTags);
        tagBtn.classList.remove("del", "add");
    }
}

function updateTag() {
    var tagText = document.getElementById(`${this.dataset.form}-tag-search`).value,
        tagsCtn = document.getElementById(`${this.dataset.form}-tags`);
    if (this.classList.contains("add")) {
        tmpTags.push(tagText);
        createTag(tagText, tagsCtn);
        this.classList.remove("add");
        this.classList.add("del");
    } else if (this.classList.contains("del")) {
        removeTag(tagText);
        this.classList.remove("del");
        this.classList.add("add");
    }
}

/******************************* FORM *******************************/
function inputPreview() {
    var preview = document.getElementById(this.dataset.preview);
    if (this.dataset.attr == "innerHTML") { preview.innerHTML = Common.isValid(this).Valid ? this.value : this.dataset.invalidValue; }
    else { preview.setAttribute(this.dataset.attr, Common.isValid(this).Valid ? this.value : this.dataset.invalidValue); }
}

function fileUpload() {
	var fileName = this.value.split("\\").pop(),
		label = document.getElementById(this.dataset.label),
		imagePreview = document.getElementById(this.dataset.preview);

	label.classList.toggle("hidden", !fileName);
	label.innerHTML = fileName;

	if (this.files.length != 0) {
		var reader = new FileReader();
		reader.onload = function(e) {imagePreview.src = e.target.result;}
		reader.readAsDataURL(this.files[0]);
	} else {
		imagePreview.src = "/images/assets/No-Image.jpg";
	}
}

/******************************* BOOKMARKS *******************************/
function createBookmark(bkInfo) {
    var html = `<div class="bookmark" id="b${bkInfo.BookmarkID}" data-href="${bkInfo.PageURL}">
                    <div class="title" id="t${bkInfo.BookmarkID}">${bkInfo.Title}</div>
                    <img class="image" id="i${bkInfo.BookmarkID}" src="${bkInfo.ImagePath}">
                    <div class="menu">
                        <div class="menu-content hidden" id="m${bkInfo.BookmarkID}">
                            <div id="mc-t${bkInfo.BookmarkID}" data-parent="b${bkInfo.BookmarkID}">Edit</div>
                            <div id="mc-d${bkInfo.BookmarkID}" data-parent="b${bkInfo.BookmarkID}">Delete</div>
                        </div>
                        <div class="menu-toggle" id="m-t${bkInfo.BookmarkID}" data-menu="m${bkInfo.BookmarkID}"></div>
                    </div>
                </div>`;
    var frag = document.createRange().createContextualFragment(html);
    frag.querySelector(`#b${bkInfo.BookmarkID}`).addEventListener("click", openBookmark);
    frag.querySelector(`#m-t${bkInfo.BookmarkID}`).addEventListener("click", toggleMenu);
    frag.querySelector(`#mc-t${bkInfo.BookmarkID}`).addEventListener("click", modalEditor);
    frag.querySelector(`#mc-d${bkInfo.BookmarkID}`).addEventListener("click", deleteBookmark);

	return frag;
}

function createBookmarks(ctnr, arr) {
    var	docFrag = document.createDocumentFragment();
    arr.forEach(bkInfo => docFrag.appendChild(createBookmark(bkInfo)));
    ctnr.appendChild(docFrag);
}

function openBookmark() {
    var href = this.dataset.href;
    if (href && href != "#") { window.open(href); }
}

async function getBookmarks() {
    let response = await fetch("/php/get-bookmarks.php");
    response = await response.json();
    if (!response.Success) { return window.location.href = "/index.html"; }
    return response.Bookmarks;
}

async function uploadBookmark(event) {
    event.preventDefault();
    if (!Common.checkErrors([...this.elements])) { return Common.toast("Errors in form fields", "error"); }

    var formData = new FormData(this);

    if (bookmarks.some(e => e.PageURL == formData.get("pageURL"))) {
		Common.toast("Bookmark already exists with this URL", "error");
	} else {
        formData.append("tags", JSON.stringify(tmpTags));
        var response = await fetch("/php/add-bookmark.php", {method: "POST", body: formData});
        response = await response.json();
        if (response.Success) {
            if (activeBookmarks.length < 1) { container.classList.remove("empty"); }
            activeBookmarks.push(response.BookmarkInfo);
            bookmarks.push(response.BookmarkInfo);
            container.appendChild(createBookmark(response.BookmarkInfo));
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
		bookmark = document.getElementById(this.dataset.target),
        bookmarkID = bookmark.id.substring(1);

	if (bookmarks.some(e => e.PageURL == formData.get("pageURL") && e.BookmarkID != bookmarkID)) {
		Common.toast("Bookmark already exists with this URL", "error");
	} else {
        //cursorLoad(true, "wait");
        formData.append("bookmarkID", bookmarkID);
        formData.append("tags", JSON.stringify(tmpTags));
        var response = await fetch("/php/edit-bookmark.php", {method: "POST", body: formData});
        response = await response.json();
        if (response.Success) {
            bookmarks[bookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)] = response.BookmarkInfo;
            document.getElementById(`b${response.BookmarkInfo.BookmarkID}`).dataset.href = response.BookmarkInfo.PageURL;
            document.getElementById(`i${response.BookmarkInfo.BookmarkID}`).src = response.BookmarkInfo.ImagePath;
            document.getElementById(`t${response.BookmarkInfo.BookmarkID}`).innerHTML = response.BookmarkInfo.Title;

            Common.toast("Bookmark updated", "success");
        } else {
            Common.toast(response.Message, "error")
        }
        //cursorLoad(false);
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
        container.classList.add("empty");
        return true;
    } else {
        container.classList.remove("empty");
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
        spliceBookmark(bookmarks, bookmarkID);
        spliceBookmark(activeBookmarks, bookmarkID);
        bookmarksEmpty(activeBookmarks);
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
    //ADD [type]: folder
    //ADD "-" to remove from results
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

        filteredBookmarks = bookmarks.filter(bk => {
            return reTitle.test(bk["Title"]) || reURL.test(bk["PageURL"]) || reTag.test(bk["Tags"]) ||
                reUnstrict.test(bk["Title"]) || reUnstrict.test(bk["PageURL"]) || reUnstrict.test(bk["Tags"]);
        });

        hideBookmarks(activeBookmarks);
        showBookmarks(filteredBookmarks);
        bookmarksEmpty(filteredBookmarks);
    } else {
        bookmarksEmpty(filteredBookmarks);
        hideBookmarks(filteredBookmarks);
        showBookmarks(activeBookmarks);
    }
}