var imgArray,
	toastArray = [],
	container,
	eventListeners = [{"eleID": "button-upload-bookmark",   "eventType": "click",       "function": modalUpload},
					  {"eleID": "upload-bookmark",          "eventType": "mousedown",   "function": modalClose},
					  {"eleID": "close-upload-modal",       "eventType": "click",       "function": modalClose},
					  {"eleID": "edit-bookmark",            "eventType": "mousedown",   "function": modalClose},
					  {"eleID": "close-edit-modal",         "eventType": "click",       "function": modalClose},
					  {"eleID": "upload-form",              "eventType": "submit",      "function": uploadBookmark},
					  {"eleID": "edit-form",                "eventType": "submit",      "function": editBookmark},
					  {"eleID": "upload-preview",           "eventType": "click",       "function": formPreview},
					  {"eleID": "edit-preview",             "eventType": "click",       "function": formPreview},
					  {"eleID": "edit-form-title",          "eventType": "input",       "function": inputPreview},
					  {"eleID": "edit-form-url",            "eventType": "input",       "function": inputPreview},
					  {"eleID": "upload-form-title",        "eventType": "input",       "function": inputPreview},
					  {"eleID": "upload-form-url",          "eventType": "input",       "function": inputPreview},
					  {"eleID": "upload-form-image",        "eventType": "change",      "function": fileUpload},
					  {"eleID": "edit-form-image",          "eventType": "change",      "function": fileUpload},
					  {"eleID": "button-test",              "eventType": "click",       "function": dbTest},
					  {"eleID": "toast",                    "eventType": "click",       "function": toast}
					 ];

//Load DOM
window.onload = async function() {
	addListeners(eventListeners);
	try {
		let response = await fetch("/php/get-bookmarks.php");
		imgArray = await response.json();
		console.log(imgArray);
	} catch (err) {
		console.error(err);
	}

	container = document.getElementById("bookmark-container");

	if (!imgArray.length) {
		toast("No bookmarks found.");
	} else {
		var	docFrag = document.createDocumentFragment();    //Document Fragment used to prevent reflow for each node added

		imgArray.forEach(function(arrayObj, index) {
			docFrag.appendChild(createBookmark(arrayObj, index));
		});

		container.appendChild(docFrag);
	}
};

async function addListeners(data) {
	var errors = [];
	for (let i = 0; i < data.length; i++) {
		if (document.getElementById(data[i].eleID)) {
			document.getElementById(data[i].eleID).addEventListener(data[i].eventType, data[i].function);
		} else {
			errors.push("Could not find element with ID: " + data[i].eleID);
		}
	}
	if (errors.length > 0) {console.log(errors);}
}

async function dbTest() {
	var test = await fetch("php/db-test.php").then(response => response.json());
	console.log(test);
}

/* TOAST NOTIFICATION */
// Toast type parameter - default grey, error red, success green / blue. Possible icon.
function toast(message) {
	var toast = document.createElement("div");
	toast.classList.add("toast", "fade-in-out");
	toast.innerHTML = message;

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

/* MODAL FUNCTIONS */
function modalEditor() {
	event.stopPropagation();
	var editor = document.getElementById("edit-bookmark"),
		previewURL = document.getElementById("edit-preview-url"),
		previewTitle = document.getElementById("edit-preview-title"),
		previewImage = document.getElementById("edit-preview-image"),
		form = document.getElementById("edit-form"),
		formURL = document.getElementById("edit-form-url"),
		formTitle = document.getElementById("edit-form-title"),
		bookmarkInfo = imgArray[imgArray.findIndex(({BookmarkID}) => BookmarkID == this.dataset.parent.substring(1))];

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

/* BOOKMARK FUNCTIONS */
function createBookmark(arrayObj, index) {
	var bookmark = document.createElement("div"),
		img = document.createElement("img"),
		title = document.createElement("div"),
		menuToggle = document.createElement("div"),
		menuContent = document.createElement("div"),
		menuEdit = document.createElement("div"),
		menuDelete = document.createElement("div");

	bookmark.classList.add("bookmark");
	bookmark.id = "b" + arrayObj.BookmarkID;
	bookmark.dataset.href = arrayObj.PageURL;
	bookmark.addEventListener("click", openBookmark);

	img.classList.add("image");
	img.id = "i" + arrayObj.BookmarkID;
	img.src = arrayObj.ImageURL;

	title.classList.add("title");
	title.id = "t" + arrayObj.BookmarkID;
	title.innerHTML = arrayObj.Title;

	menuContent.classList.add("menu-content", "hidden");
	menuContent.id = "m" + arrayObj.BookmarkID;

	menuToggle.classList.add("menu-toggle");
	menuToggle.dataset.menu = menuContent.id;
	menuToggle.addEventListener("click", toggleMenu);

	menuEdit.innerHTML = "Edit";
	menuEdit.dataset.parent = bookmark.id;
	menuEdit.addEventListener("click", modalEditor);    //Callback function has to open edit modal, then editBookmark is called from the modal

	menuDelete.innerHTML = "Delete";
	menuDelete.dataset.parent = bookmark.id;
	menuDelete.addEventListener("click", deleteBookmark);

	//Create the bookmark
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

	if (imgArray.some(e => e.PageURL == formData.get("pageURL"))) {
		toast("Bookmark already exists with this URL");
	} else {
		try {
			var response = await fetch("/php/add-bookmark.php", {method: "POST", body: formData});
			response = await response.json();
			console.log(response);
			let index = imgArray.push(response) - 1;
			container.appendChild(createBookmark(response, index));
			toast("Bookmark created");
		} catch (err) {
			console.error(err);
		}
	}
}

async function editBookmark(event) {
	event.preventDefault();
	var formData = new FormData(this),
		bookmark = document.getElementById(this.dataset.target),
		bookmarkID = bookmark.id.substring(1);

	formData.append("bookmarkID", bookmarkID);
	if (imgArray.some(e => e.PageURL == formData.get("pageURL") && e.BookmarkID != bookmarkID)) {
		toast("Bookmark already exists with this URL");
	} else {
		try {
			var response = await fetch("/php/update-bookmark.php", {method: "POST", body: formData});
			response = await response.json();
			console.log(response);
			toast("Bookmark updated");

			imgArray[imgArray.findIndex(({BookmarkID}) => BookmarkID == bookmarkID)] = response;
			console.log(imgArray);

			document.getElementById("b" + response.BookmarkID).dataset.href = response.PageURL;
			document.getElementById("i" + response.BookmarkID).src = response.ImageURL;
			document.getElementById("t" + response.BookmarkID).innerHTML = response.Title;
		} catch (err) {
			console.error(err);
		}
	}
}

async function deleteBookmark(event) {
	event.stopPropagation();
	var formData = new FormData(),
		bookmark = document.getElementById(this.dataset.parent),
		bookmarkID = bookmark.id.substring(1);

	formData.append("bookmarkID", bookmarkID);
	try {
		var response = await fetch("/php/delete-bookmark.php", {method: "POST", body: formData});
		response = await response.json();
		console.log(response);
		toast("Bookmark deleted");
		bookmark.remove();
		imgArray.splice(imgArray.findIndex(({BookmarkID}) => BookmarkID == bookmarkID), 1);
	} catch (err) {
		console.error(err);
	}
}

/* FORM FUNCTIONS */
function isValid(element) {
	return element.name && element.value;
}

/*
function formToFormData(elements) {
	var formData = new FormData();

	for (let i = 0; i < elements.length; i++) {
		if (isValid(elements[i])) {
			if (elements[i].files) {
				formData.append("files", elements[i].files[0]);
			} else {
				formData.append(elements[i].name, elements[i].value);
			}
		}
	}

	return formData;
}
*/

function fileUpload() {
	var fileName = this.value.split( '\\' ).pop(),
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

function inputPreview() {
	//data-preview on input element = target preview element
	//data-attr = attribute to change on preview element (href, src, innerHTML, etc.)
	//onchange / onkeyup / mouseenter w. setinterval check / --input
	var preview = document.getElementById(this.dataset.preview);
	preview[this.dataset.attr] = isValid(this) ? this.value : this.dataset.invalidValue;
	//console.log(this.dataset.attr + " set to " + preview[this.dataset.attr]);
}

function formPreview() {
	modalType = this.dataset.modalType;
	var pageURL = document.getElementById(modalType + "-form-url"),
		title = document.getElementById(modalType + "-form-title");
		//image = document.getElementById(modalType + "-form-image");

	//Deprecate this function and create onchange listeners for the title and url fields (requires autofill workaround)

	if (isValid(pageURL)) {
		document.getElementById(modalType + "-preview-url").href = pageURL.value;
	} else {
		toast("URL field empty");
	}

	if (isValid(title)) {
		document.getElementById(modalType + "-preview-title").innerHTML = title.value;
	} else {
		toast("Title field empty");
	}
	/*
	if (image.files.length > 0) {
		var file = image.files[0],
			img = document.getElementById(modalType + "-preview-image"),
			reader = new FileReader();

		image.file = file;

		reader.onload = (function(aImg) {
			return function(e) {
				aImg.src = e.target.result;
			};
		})(img);
		reader.readAsDataURL(file);
	}
	*/
}

/*
Database interface functions:	--Delete, --Edit, Redorder (including drag & drop)
Loading screen:	Book flipping pages rapidly
Logo:	Book with visible bookmark
Title:	OneMark, --Compendium, --Catalogue

--Login requiring username and password (email / phone number in future)
Lazy-load images not in viewport
Shrink oversized images
Allow in-line image cropping
Include HTMLtoCanvas library for easier screenshot uploads
*/