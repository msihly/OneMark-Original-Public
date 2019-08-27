var bookmarksArray = [],
	toastArray = [],
	container,
    eventListeners = [{"eleID": "upload-form",              "eventType": "submit",      "function": uploadBookmark},
                      {"eleID": "edit-form",                "eventType": "submit",      "function": editBookmark},
                      {"eleID": "open-upload-modal",        "eventType": "click",       "function": modalUpload},
                      {"eleID": "logout",                   "eventType": "click",       "function": logout},
                      {"dataListener": "modalClose",        "eventType": "click",       "function": modalClose},
                      {"dataListener": "inputPreview",      "eventType": "input",       "function": inputPreview},
                      {"dataListener": "fileUpload",        "eventType": "change",      "function": fileUpload},
					 ];

window.onload = async function() {
    addListeners(eventListeners);

    let response = await fetch("/php/get-bookmarks.php");
    response = await response.json();
    if (response.Success) { bookmarksArray = response.Bookmarks; }
    else {
        //toast(response.Message, "error");
        return window.location.href = "/index.html";
    }

	container = document.getElementById("bookmark-container");

	if (!bookmarksArray.length) {
		toast("No bookmarks found");
	} else {
		var	docFrag = document.createDocumentFragment();    //Document Fragment used to prevent reflow for each node added
		bookmarksArray.forEach(function(bookmarkInfo) {
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
        case "warning": toast.classList.add("bg-yellow"); break;
    }

	for (let i = 0; i < toastArray.length; i++) {
		toastArray[i].style.bottom = (parseFloat(toastArray[i].style.bottom) || 0) + toastArray[i].clientHeight + 8 + 'px';
	}

	toastArray.push(toast);
	document.body.appendChild(toast);

	setTimeout(function() {
		toast.remove();
		toastArray.shift();
    }, 5000);
}

function insertInlineMessage(parentNode, refNode, text, type) {
    var parentNode = document.getElementById(parentNode),
        refNode = document.getElementById(refNode),
        messageNode = document.createElement("div");

    messageNode.classList.add("inline-message");
    messageNode.innerHTML = text;

    switch (type) {
        case "success": messageNode.classList.add("bg-green");  break;
        case "error":   messageNode.classList.add("bg-red");    break;
        case "warning": messageNode.classList.add("bg-yellow"); break;
    }

    return parentNode.insertBefore(messageNode, refNode);
}

/******************************* ACCOUNT FUNCTIONS *******************************/
async function logout() {
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
		previewURL = document.getElementById("edit-preview-url"),
		previewTitle = document.getElementById("edit-preview-title"),
		previewImage = document.getElementById("edit-preview-image"),
		form = document.getElementById("edit-form"),
		formURL = document.getElementById("edit-form-url"),
		formTitle = document.getElementById("edit-form-title"),
		bookmarkInfo = bookmarksArray[bookmarksArray.findIndex(({BookmarkID}) => BookmarkID == this.dataset.parent.substring(1))];

	previewURL.href = bookmarkInfo.PageURL;
	previewTitle.innerHTML = bookmarkInfo.Title;
	previewImage.src = bookmarkInfo.ImageURL;
	form.dataset.target = this.dataset.parent;
	formURL.value = bookmarkInfo.PageURL;
	formTitle.value = bookmarkInfo.Title;
	editor.classList.toggle("hidden");
}

function modalUpload() {
	document.getElementById(this.dataset.modal).classList.toggle("hidden");
}

function modalClose(event) {
	var modal = document.getElementById(this.dataset.modal);
	if (modal == event.target || this.classList.contains("close")) {
		modal.classList.toggle("hidden");
	}
}

/******************************* FORM FUNCTIONS *******************************/
function isValid(element) {
    return element.name && element.value;
    //modify to validate for URLs and potential title restrictions
}

function inputPreview() {
	var preview = document.getElementById(this.dataset.preview);
	preview[this.dataset.attr] = isValid(this) ? this.value : this.dataset.invalidValue;
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

	menuContent.classList.add("menu-content", "hidden");
	menuContent.id = "m" + bookmarkInfo.BookmarkID;

	menuToggle.classList.add("menu-toggle");
	menuToggle.dataset.menu = menuContent.id;
	menuToggle.addEventListener("click", toggleMenu);

	menuEdit.innerHTML = "Edit";
	menuEdit.dataset.parent = bookmark.id;
	menuEdit.addEventListener("click", modalEditor);

	menuDelete.innerHTML = "Delete";
	menuDelete.dataset.parent = bookmark.id;
	menuDelete.addEventListener("click", deleteBookmark);

	menuContent.appendChild(menuEdit);
	menuContent.appendChild(menuDelete);
	bookmark.appendChild(title);
	bookmark.appendChild(img);
	bookmark.appendChild(menuToggle);
	bookmark.appendChild(menuContent);

	return bookmark;
}

function toggleMenu() {
	event.stopPropagation();
	document.getElementById(this.dataset.menu).classList.toggle("hidden");
}

function openBookmark() {
	window.open(this.dataset.href);
}

async function uploadBookmark(event) {
	event.preventDefault();
	var formData = new FormData(this);

	if (bookmarksArray.some(e => e.PageURL == formData.get("pageURL"))) {
		toast("Bookmark already exists with this URL", "error");
	} else {
        var response = await fetch("/php/add-bookmark.php", {method: "POST", body: formData});
        response = await response.json();
        if (response.Success) {
            bookmarksArray.push(response.BookmarkInfo);
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
	if (bookmarksArray.some(e => e.PageURL == formData.get("pageURL") && e.BookmarkID != bookmarkID)) {
		toast("Bookmark already exists with this URL", "error");
	} else {
        var response = await fetch("/php/edit-bookmark.php", {method: "POST", body: formData});
        response = await response.json();
        if (response.Success) {
            bookmarksArray[bookmarksArray.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)] = response.BookmarkInfo;
            document.getElementById("b" + response.BookmarkInfo.BookmarkID).dataset.href = response.BookmarkInfo.PageURL;
            document.getElementById("i" + response.BookmarkInfo.BookmarkID).src = response.BookmarkInfo.ImageURL;
            document.getElementById("t" + response.BookmarkInfo.BookmarkID).innerHTML = response.BookmarkInfo.Title;

            toast("Bookmark updated", "success");
        } else {
            toast(response.Message, "error")
        }
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
        bookmarksArray.splice(bookmarksArray.findIndex(({BookmarkID}) => BookmarkID == bookmarkID), 1);
        //log removed bookmark ID and other info returned from PHP contained in response.Message
        toast("Bookmark deleted", "success");
    } else {
        toast(response.Message, "error");
    }
}

/*******************************  TO-DO-LIST ************************************
Functions:
    • Pull-out menu with logout, settings - account info (date created, total bookmarks,
         storage space, etc.); edit info (email, password, possibly username)
    • Redorder (manual w/ drag & drop, lexicographic, date created, date modified, etc.)
    • Background image / color selection
    • Bookmark views (tiles, content, list, etc.)
    • In-line image cropping
    • Include HTMLtoCanvas library for screenshot uploads
Optimization:
    • Import / export modules for login.js and main.js
    • Merge upload and edit modals into one dynamic modal
Loading screen:
    • Book flipping pages rapidly
Logo:
    • Book with visible bookmark
Miscellaneous:
    • Form validation / restrictions via HTML, JS, and PHP
    + Persistent login via cookie / session / tokens (may require library)
    • Close all open menus and modals when clicking out of their containers
    • Alert modal with options passed to switch or if_else chain (types of buttons shown, if any;
      enable / disable closing the dialog box without selecting an option; opacity, color, blur of
      modal background)
    ~ Log all transactions and responses in PHP
        + Accomplished with logToFile(), which encapsulates the native error_log()
        ~ For production environment, modify logging function to output more info in a standardized
          JSON format to be read by a custom HTML / JS reader, or use the Monolog library (need to
          research overhead) and export to a third-party log reader
    • Display metadata info (Date Created, Date Modified, etc.) in editor modal
    • Folder system and possibly tagging system with search
    • Highlight multiple bookmarks / folders for group actions
    • Compress large images
    • Lazy-load images not in viewport
    • Confirm email on register with PHP
    • Share read-only view of bookmarks via link

*********************************************************************************/