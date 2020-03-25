<?php
    session_start();
    if (!isset($_SESSION["uid"])) {
        if (isset($_COOKIE["authToken"])) {
            include_once("php/restricted/db-functions.php");
            $userID = validateToken($_COOKIE["authToken"]);
            if ($userID === false) {
                setcookie("authToken", "", 1);
                header("Location: /login.php");
                exit;
            } else {
                $_SESSION["uid"] = $userID;
            }
        } else {
            header("Location: /login.php");
            exit;
        }
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
		<script src="js/home.js" type="module"></script>
		<base target="_blank">
	</head>
	<body class="bg-prism">
        <nav id="navbar">
            <div class="nav-btn" id="create-bookmark" data-modal="u-bookmark"></div>
            <input type="text" placeholder="Search..." class="placeholder" id="searchbar" data-full-word="" data-and="">
            <div class="nav-menu sort">
                <div class="nav-btn" id="sortmenu" data-menu="sortmenu-content"></div>
                <div class="hidden" id="sortmenu-content">
                    <div class="sortmenu-btn desc active" id="modified-desc" data-text="Date Modified"></div>
                    <div class="sortmenu-btn asc" id="modified-asc" data-text="Date Modified"></div>
                    <div class="sortmenu-btn desc" id="created-desc" data-text="Date Created"></div>
                    <div class="sortmenu-btn asc" id="created-asc" data-text="Date Created"></div>
                    <div class="sortmenu-btn desc" id="title-desc" data-text="Title"></div>
                    <div class="sortmenu-btn asc" id="title-asc" data-text="Title"></div>
                    <div class="sortmenu-btn desc" id="views-desc" data-text="Views"></div>
                    <div class="sortmenu-btn asc" id="views-asc" data-text="Views"></div>
                    <div class="sortmenu-btn desc" id="size-desc" data-text="Image Size"></div>
                    <div class="sortmenu-btn asc" id="size-asc" data-text="Image Size"></div>
                </div>
            </div>
            <div class="nav-menu">
                <div class="nav-btn" id="sidemenu" data-menu="sidemenu-content"></div>
                <div class="hidden" id="sidemenu-content">
                    <div class="sidemenu-btn" id="account">ACCOUNT</div>
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
                            <span class="file-input-btn"><img src="images/Upload.png" class="file-input-icon"></span>
                        </label>
                            <input type="file" class="file-input" name="imageURL" id="image-upload" accept="image/png, image/jpeg">
                        <span class="file-input-btn del" id="remove-upload"><img src="images/Delete.png" class="file-input-icon"></span>
                            <input type="hidden" name="removeImage" id="bk-f-remove" value="false">
                    </div>
                    <div class="row">
                        <div class="column bk-left">
                            <div class="form-group">
                                <label class="error-label invisible" id="bk-f-url-error">Error</label>
                                <input type="text" placeholder="Enter URL" name="pageURL" id="bk-f-url" data-preview="preview" data-attr="data-href" data-invalid-value="#" data-listener="errorCheck inputPreview" required>
                                <label for="bk-f-url" class="lb-title">URL</label>
                            </div>
                            <div class="form-group">
                                <label class="error-label invisible" id="bk-f-title-error">Error</label>
                                <input type="text" placeholder="Enter Title" name="title" id="bk-f-title" data-preview="preview-title" data-attr="innerHTML" data-invalid-value="No Title" data-listener="errorCheck inputPreview" required>
                                <label for="bk-f-title" class="lb-title">Title</label>
                            </div>
                        </div>
                        <div class="column bk-right">
                            <div class="row">
                                <input type="text" placeholder="Tags" id="tag-search" class="placeholder tag-search">
                                <span class="tag-search-btn" id="tag-btn" data-listener="tag-btn"></span>
                            </div>
                            <div class="tags" id="tags"></div>
                        </div>
                    </div>
                    <button class="btn-hollow submit" id="bk-submit" type="submit">SUBMIT</button>
                </form>
            </div>
        </div>
        <div class="modal-container hidden" id="acc-modal" data-modal="acc-modal" data-listener="modalClose">
            <div class="modal-content acc-modal">
                <span class="close" id="close-acc-modal" data-modal="acc-modal" data-listener="modalClose">&times;</span>
                <div id="acc-left-panel">
                    <div id="acc-tab-info" class="acc-btn active" data-listener="acc-btn" data-panel="acc-panel-info">Account Info</div>
                    <div id="acc-tab-pass" class="acc-btn" data-listener="acc-btn" data-panel="acc-panel-pass">Password</div>
                </div>
                <div class="acc-right-panel" id="acc-panel-info">
                    <h4>Username</h4>
                    <p class="acc-text" id="acc-username"></p>
                    <h4>Email</h4>
                    <p class="acc-text" id="acc-email"></p>
                    <h4>Date Created</h4>
                    <p class="acc-text" id="acc-created"></p>
                    <h4>Account Type</h4>
                    <p class="acc-text" id="acc-type"></p>
                </div>
                <div class="acc-right-panel hidden-panel hidden" id="acc-panel-pass">
                    <form id="acc-pass-form" enctype="multipart/form-data">
                        <div class="form-group no-rev no-mgn">
                            <label for="pass-cur">Current Password</label>
                            <input type="password" name="password" id="pass-cur" data-listener="errorCheck" required>
                            <label class="error-label invisible" id="pass-cur-error">Error</label>
                        </div>
                        <div class="form-group no-rev no-mgn">
                            <label for="pass-new">New Password</label>
                            <input type="password" name="password-new" id="pass-new" data-listener="errorCheck" required>
                            <label class="error-label invisible" id="pass-new-error">Error</label>
                        </div>
                        <div class="form-group no-rev no-mgn">
                            <label for="pass-conf">Confirm Password</label>
                            <input type="password" name="password-confirm" id="pass-new-confirm" data-listener="errorCheck" required>
                            <label class="error-label invisible" id="pass-new-confirm-error">Error</label>
                        </div>
                        <button type="submit" id="pass-submit">Confirm</button>
                    </form>
                </div>
            </div>
        </div>
	</body>
</html>