<?php
    session_start();
    if (!isset($_SESSION["uid"])) {
        header("Location: /index.php");
        exit;
    }
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Home - OneMark</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="icon" type="image/ico" href="images/favicon.ico">
        <link rel="stylesheet" href="css/stylesheet.css">
		<script src="js/main.js" type="module"></script>
		<base target="_blank">
	</head>
	<body class="bg-prism">
        <nav id="navbar">
            <div class="nav-btn" id="create-bookmark" data-modal="u-bookmark"></div>
            <input type="text" placeholder="Search..." id="searchbar" data-full-word="" data-and="">
            <div class="nav-menu sort">
                <div class="nav-btn" id="sortmenu" data-menu="sortmenu-content"></div>
                <div class="hidden" id="sortmenu-content">
                    <div class="sortmenu-btn asc" id="title-asc" data-text="Title"></div>
                    <div class="sortmenu-btn desc" id="title-desc" data-text="Title"></div>
                    <div class="sortmenu-btn asc" id="views-asc" data-text="Views"></div>
                    <div class="sortmenu-btn desc" id="views-desc" data-text="Views"></div>
                    <div class="sortmenu-btn asc" id="created-asc" data-text="Date Created"></div>
                    <div class="sortmenu-btn desc" id="created-desc" data-text="Date Created"></div>
                    <div class="sortmenu-btn asc" id="modified-asc" data-text="Date Modified"></div>
                    <div class="sortmenu-btn desc" id="modified-desc" data-text="Date Modified"></div>
                </div>
            </div>
            <div class="nav-menu">
                <div class="nav-btn" id="sidemenu" data-menu="sidemenu-content"></div>
                <div class="hidden" id="sidemenu-content">
                    <div class="sidemenu-btn" id="logout">LOGOUT</div>
                </div>
            </div>
        </nav>
        <div class="bookmark-container" id="bookmark-container"></div>
        <div class="modal-container hidden" id="bk-modal" data-modal="bk-modal" data-listener="modalClose">
            <div class="modal-content pad-ctn-2">
                <span class="close" id="close-bk-modal" data-modal="bk-modal" data-listener="modalClose">&times;</span>
                <div class="preview-output" id="preview" data-href="#">
                    <div class="title" id="preview-title">No Title</div>
                    <img class="image" id="preview-image" src="images/No-Image.jpg">
                </div>
                <form id="bk-f" enctype="multipart/form-data">
                    <div class="row between">
                        <label for="image-upload" class="file-input-group">
                            <span class="file-input-name hidden" id="bk-image-name"></span>
                            <span class="file-input-btn"><img src="images/Upload.png" class="file-input-icon">Upload Image</span>
                        </label>
                            <input type="file" class="file-input" name="imageURL" id="image-upload" accept="image/png, image/jpeg">
                        <span class="file-input-btn del" id="remove-upload"><img src="images/Delete.png" class="file-input-icon">Remove Image</span>
                            <input type="hidden" name="removeImage" id="bk-f-remove" value="false">
                    </div>
                    <div class="row">
                        <div class="column bk-left">
                            <div class="form-group">
                                <label class="error-label invisible" id="bk-f-url-error">Error</label>
                                <input type="text" placeholder="Enter URL" name="pageURL" id="bk-f-url" data-preview="preview" data-attr="data-href" data-invalid-value="#" data-listener="errorCheck inputPreview" required>
                                <label for="bk-f-url">URL</label>
                            </div>
                            <div class="form-group">
                                <label class="error-label invisible" id="bk-f-title-error">Error</label>
                                <input type="text" placeholder="Enter Title" name="title" id="bk-f-title" data-preview="preview-title" data-attr="innerHTML" data-invalid-value="No Title" data-listener="errorCheck inputPreview" required>
                                <label for="bk-f-title">Title</label>
                            </div>
                        </div>
                        <div class="column bk-right">
                            <div class="row">
                                <div class="form-group tag-group">
                                    <input type="text" placeholder="Enter Tags" id="tag-search" class="tag-search">
                                    <label for="tag-search" class="tag-search-label">Tags</label>
                                </div>
                                <span class="tag-search-btn" id="tag-btn" data-listener="tag-btn"></span>
                            </div>
                            <div class="tags" id="tags"></div>
                        </div>
                    </div>
                    <button class="btn-hollow submit" id="bk-submit" type="submit">SUBMIT</button>
                </form>
            </div>
        </div>
	</body>
</html>