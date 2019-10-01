var bookmarks = [],
    activeBookmarks = [],
    toasts = [],
    openMenus = [],
	container,
    eventListeners = [{"eleID": "upload-form",              "eventType": "submit",      "function": uploadBookmark},
                      {"eleID": "edit-form",                "eventType": "submit",      "function": editBookmark},
                      {"eleID": "open-upload-modal",        "eventType": "click",       "function": modalUpload},
                      {"eleID": "sidemenu",                 "eventType": "click",       "function": toggleMenu},
                      {"eleID": "logout",                   "eventType": "click",       "function": logout},
                      {"dataListener": "preview",           "eventType": "click",       "function": openBookmark},
                      {"dataListener": "modalClose",        "eventType": "mousedown",   "function": modalClose},
                      {"dataListener": "inputPreview",      "eventType": "input",       "function": inputPreview},
                      {"dataListener": "fileUpload",        "eventType": "change",      "function": fileUpload},
                      {"domObject": document,               "eventType": "click",       "function": closeMenus},
					 ];

window.onload = async function() {
    addListeners(eventListeners);

    let response = await getBookmarks();
    if (response === false) { return window.location.href = "/index.html"; }
    else {
        bookmarks = response;
        activeBookmarks = bookmarks;
    }

	container = document.getElementById("bookmark-container");

	if (!bookmarks.length) {
        container.classList.add("empty");
	} else {
		var	docFrag = document.createDocumentFragment();
		bookmarks.forEach(function(bookmarkInfo) {
			docFrag.appendChild(createBookmark(bookmarkInfo));
		});
		container.appendChild(docFrag);
	}
};

/******************************* GENERAL FUNCTIONS *******************************/
function addListeners(data) {
	var errors = [];
	for (let i = 0; i < data.length; i++) {
		if (data[i].eleID) {
            let element = document.getElementById(data[i].eleID);
            if (element) {element.addEventListener(data[i].eventType, data[i].function);}
            else {errors.push("Could not find element with ID: " + data[i].eleID);}
		} else if (data[i].dataListener) {
            let elements = document.querySelectorAll("[data-listener='" + data[i].dataListener + "']");
            if (elements.length > 0) {elements.forEach(function(e) {e.addEventListener(data[i].eventType, data[i].function);});}
            else {errors.push("Could not find any elements with data-listener attribute: " + data[i].dataListener);}
        } else if(data[i].domObject) {
            data[i].domObject.addEventListener(data[i].eventType, data[i].function);
        }
	}
	if (errors.length > 0) {console.log(errors);}
}

function toast(message, type) {
	var toast = document.createElement("div");
	toast.classList.add("toast", "fade-in-out");
    toast.innerHTML = message;

    switch (type) {
        case "success": toast.classList.add("bg-blue");   break;
        case "error":   toast.classList.add("bg-red");    break;
        case "warning": toast.classList.add("bg-orange"); break;
    }

	for (let i = 0; i < toasts.length; i++) {
		toasts[i].style.bottom = (parseFloat(toasts[i].style.bottom) || 0) + toasts[i].clientHeight + 8 + 'px';
	}

	toasts.push(toast);
	document.body.appendChild(toast);

	setTimeout(function() {
		toast.remove();
		toasts.shift();
    }, 5000);
}

function insertInlineMessage(position, parentNode, refNode, text, type) {
    var tempID = parentNode + "-" + refNode,
        parentNode = document.querySelector(parentNode),
        refNode = document.querySelector(refNode),
        prevNode = document.querySelector("#" + tempID),
        messageNode = document.createElement("div");

    messageNode.classList.add("inline-message");
    messageNode.innerHTML = text;
    messageNode.id = tempID;
    if (prevNode) { prevNode.remove(); }

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

/*
function cursorLoad(loading, type) {
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
}
*/

/******************************* ACCOUNT FUNCTIONS *******************************/
async function logout(event) {
    event.preventDefault();
    var response = await fetch("/php/logout.php");
    response = await response.json();
    if (response.Success) {
        toast(response.Message, "success");
        setTimeout(function() { window.location.href = "/index.html"; }, 1500);
    } else {
        toast(response.Message, "error");
    }
}

/******************************* MODAL FUNCTIONS *******************************/
function modalEditor() {
	event.stopPropagation();
	var editor = document.getElementById("edit-bookmark"),
		previewURL = document.getElementById("edit-preview"),
		previewTitle = document.getElementById("edit-preview-title"),
		previewImage = document.getElementById("edit-preview-image"),
		form = document.getElementById("edit-form"),
		formURL = document.getElementById("edit-form-url"),
		formTitle = document.getElementById("edit-form-title"),
		bookmarkInfo = bookmarks[bookmarks.findIndex(({BookmarkID}) => BookmarkID == this.dataset.parent.substring(1))];

	previewURL.dataset.href = bookmarkInfo.PageURL;
	previewTitle.innerHTML = bookmarkInfo.Title;
	previewImage.src = bookmarkInfo.ImageURL;
	form.dataset.target = this.dataset.parent;
	formURL.value = bookmarkInfo.PageURL;
    formTitle.value = bookmarkInfo.Title;

    closeMenus();
	editor.classList.toggle("hidden");
}

function modalUpload(event) {
    event.preventDefault();
    closeMenus();
    document.getElementById(this.dataset.modal).classList.toggle("hidden");
}

function modalClose(event) {
	var modal = document.getElementById(this.dataset.modal);
	if (modal == event.target || this.classList.contains("close")) {
		modal.classList.toggle("hidden");
	}
}

/* ASBSTRACT THE OPEN AND CLOSE FUNCTIONALITY */

/******************************* FORM FUNCTIONS *******************************/
function isValid(element) {
    return element.name && element.value;
    //modify to validate for URLs and potential title restrictions
}

function inputPreview() {
	var preview = document.getElementById(this.dataset.preview);
	preview.setAttribute(this.dataset.attr, isValid(this) ? this.value : this.dataset.invalidValue);
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

/******************************* BOOKMARK FUNCTIONS *******************************/
function createBookmark(bookmarkInfo) {
	var bookmark = document.createElement("div"),
		img = document.createElement("img"),
        title = document.createElement("div"),
        menu = document.createElement("div"),
        menuCircle = document.createElement("div"),
        menuToggle = document.createElement("div"),
		menuContent = document.createElement("div"),
		menuEdit = document.createElement("div"),
		menuDelete = document.createElement("div");

	bookmark.classList.add("bookmark");
	bookmark.id = "b" + bookmarkInfo.BookmarkID;
	bookmark.dataset.href = bookmarkInfo.PageURL;
	bookmark.addEventListener("click", openBookmark);

	img.classList.add("image");
	img.id = "i" + bookmarkInfo.BookmarkID;
	img.src = bookmarkInfo.ImageURL;

	title.classList.add("title");
	title.id = "t" + bookmarkInfo.BookmarkID;
    title.innerHTML = bookmarkInfo.Title;

    menu.classList.add("menu");

    menuCircle.classList.add("menu-circle");
    menuCircle.dataset.menu = "m" + bookmarkInfo.BookmarkID;
    menuCircle.addEventListener("click", toggleMenu);

    menuToggle.classList.add("menu-toggle");

	menuContent.classList.add("menu-content", "hidden");
	menuContent.id = menuCircle.dataset.menu;

	menuEdit.innerHTML = "Edit";
	menuEdit.dataset.parent = bookmark.id;
	menuEdit.addEventListener("click", modalEditor);

	menuDelete.innerHTML = "Delete";
	menuDelete.dataset.parent = bookmark.id;
	menuDelete.addEventListener("click", deleteBookmark);

	menuContent.appendChild(menuEdit);
    menuContent.appendChild(menuDelete);
    menuCircle.appendChild(menuToggle);
    menu.appendChild(menuContent);
    menu.appendChild(menuCircle);
	bookmark.appendChild(title);
	bookmark.appendChild(img);
	bookmark.appendChild(menu);

	return bookmark;
}

function closeMenus() {
    if (openMenus.length > 0) {
        openMenus.forEach(function(e) {
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
    } else {
        closeMenus();
    }
}

function openBookmark() {
    href = this.dataset.href;
    if (href && href != "#") { window.open(href); }
}

async function getBookmarks() {
    let response = await fetch("/php/get-bookmarks.php");
    response = await response.json();

    if (response.Success) { return response.Bookmarks; }
    else { return false; }
}

async function uploadBookmark(event) {
	event.preventDefault();
	var formData = new FormData(this);

	if (bookmarks.some(e => e.PageURL == formData.get("pageURL"))) {
		toast("Bookmark already exists with this URL", "error");
	} else {
        var response = await fetch("/php/add-bookmark.php", {method: "POST", body: formData});
        response = await response.json();
        if (response.Success) {
            if (activeBookmarks.length < 1) { container.classList.remove("empty"); }
            activeBookmarks.push(response.BookmarkInfo);
            bookmarks.push(response.BookmarkInfo);
            container.appendChild(createBookmark(response.BookmarkInfo));
            toast("Bookmark created", "success");
        } else {
            toast(response.Message, "error");
        }
	}
}

async function editBookmark(event) {
	event.preventDefault();
	var formData = new FormData(this),
		bookmark = document.getElementById(this.dataset.target),
		bookmarkID = bookmark.id.substring(1);

    formData.append("bookmarkID", bookmarkID);
	if (bookmarks.some(e => e.PageURL == formData.get("pageURL") && e.BookmarkID != bookmarkID)) {
		toast("Bookmark already exists with this URL", "error");
	} else {
        cursorLoad(true, "wait");
        var response = await fetch("/php/edit-bookmark.php", {method: "POST", body: formData});
        response = await response.json();
        if (response.Success) {
            bookmarks[bookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)] = response.BookmarkInfo;
            document.getElementById("b" + response.BookmarkInfo.BookmarkID).dataset.href = response.BookmarkInfo.PageURL;
            document.getElementById("i" + response.BookmarkInfo.BookmarkID).src = response.BookmarkInfo.ImageURL;
            document.getElementById("t" + response.BookmarkInfo.BookmarkID).innerHTML = response.BookmarkInfo.Title;

            toast("Bookmark updated", "success");
        } else {
            toast(response.Message, "error")
        }
        cursorLoad(false);
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
        bookmarks.splice(bookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID), 1);
        activeBookmarks.splice(activeBookmarks.findIndex(({BookmarkID}) => BookmarkID == bookmarkID), 1);
        if (activeBookmarks.length < 1) { container.classList.add("empty"); }
        toast("Bookmark deleted", "success");
        //log removed bookmark ID and other info returned from PHP contained in response.Message
    } else {
        toast(response.Message, "error");
    }
}

/*******************************  TO-DO-LIST ************************************
High Priority:
    • Page sequencing and navigation (max bookmarks per screen); jump to specific page
    • Pull-out menu with settings - account info (date created, total bookmarks, storage space,
      etc.), edit account (email, password, possibly username). Shrinks to hamburger icon
    • Form validation / restrictions via HTML, JS, and PHP
    • Custom 404 page
    • Redorder (manual w/ drag & drop, lexicographic, date created, date modified, etc.)

Medium Priority:
    • Search with bookmark tagging
    • Edit modal - remove image button (set to no image url)
    • Folder system
    • Highlight multiple bookmarks / folders for group actions
    • Alert modal with options passed to switch or if_else chain (types of buttons shown,
      if any; enable / disable closing the dialog box without selecting an option; opacity,
      color, blur of modal background)
    • Display metadata info (Date Created, Date Modified, etc.) in editor modal
    • Bookmark views (tiles, content, list, etc.)
    • Lazy-load images not in viewport

Low Priority:
    • Replace .menu-toggle with ::before to create the arrow OR apply an rgba() background-color
      and 50% border-radius (for a circle) to the outer container; change modal close buttons
      to work the same way. Add close button to toasts and inline messages
    • Import / export modules for login.js and main.js
    • Merge upload and edit modals into one dynamic modal
    • Background image / color selection
    • Confirm email on register with PHP
    • Loading screen - Book flipping pages rapidly
    • Logo - Book with visible bookmark
    • Compress large images
    • In-line image cropping
    • Include HTMLtoCanvas library for screenshot uploads
    • Share read-only view of bookmarks via link

Partially Completed:
    ~ Replace "No Bookmarks" toast with text and icon background; check on 'load / deletion
      of all bookmarks / folder open' if array is empty; add .empty to .bookmark-container
      classList; remove from classList on load, new bookmark, and non-empty folder
    ~ Log all transactions and responses in PHP
        + Accomplished with logToFile(), which encapsulates the native error_log()
        ~ For production environment, modify logging function to output more info in a
          standardized JSON format to be read by a custom HTML / JS reader, or use the
          Monolog library (research overhead) and export to a third-party log reader

Completed:
    + Persistent login via cookie / session / tokens
    + Close all open menus and modals when clicking out of their containers
    + Mobile responsiveness for login page and bookmarks page
    + Sticky top navigation; left - create bookmark (shrinks to '+'); middle - search;
      right - menu (shrinks to down-chevron)

*********************************************************************************/