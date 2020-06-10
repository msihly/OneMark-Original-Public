<?php
    session_start();
    if (!isset($_SESSION["uid"])) {
        if (!isset($_COOKIE["authToken"])) {
            header("Location: /login");
            exit;
        }
        include_once("php/restricted/db-functions.php");
        $userID = validateToken($_COOKIE["authToken"]);
        if ($userID === false) {
            setcookie("authToken", "", 1);
            header("Location: /login");
            exit;
        }
        $_SESSION["uid"] = $userID;
    }
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Home - OneMark</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="icon" type="image/ico" href="images/favicon.ico">
        <link rel="stylesheet" href="css/common.css">
        <link rel="stylesheet" href="css/home.css">
		<script src="js/home.js" type="module"></script>
		<base target="_blank">
	</head>
	<body class="bg-prism">
        <nav id="navbar">
            <div id="create-bookmark" class="nav-btn"></div>
            <div id="search-group">
                <input id="searchbar" class="placeholder" type="text" placeholder="Search..." data-and="true" data-whole="false">
                <span id="adv-search" class="nav-btn down-arrow" data-menu="adv-search-content" data-listener="menu"></span>
                <div id="adv-search-content" class="hidden">
                    <h4>Advanced Search</h4>
                    <div class="row row-mgn mobile">
                        <div class="row row-mgn mgn-btm">
                            <span class="relative">
                                <div id="adv-search-type-content" class="drop-menu-content hidden">
                                    <div class="drop-btn" data-dropdown="adv-search-type" data-listener="dropdown">Anything</div>
                                    <div class="drop-btn" data-dropdown="adv-search-type" data-listener="dropdown">URL</div>
                                    <div class="drop-btn" data-dropdown="adv-search-type" data-listener="dropdown">Title</div>
                                    <div class="drop-btn" data-dropdown="adv-search-type" data-listener="dropdown">Tag</div>
                                </div>
                                <span id="adv-search-type" class="dropdown down-arrow" data-menu="adv-search-type-content" data-parent-menu="adv-search-content" data-value="Anything" data-listener="menuChild"></span>
                            </span>
                            <span class="relative">
                                <div id="adv-search-contains-content" class="drop-menu-content hidden">
                                    <div class="drop-btn" data-dropdown="adv-search-contains" data-listener="dropdown">contains</div>
                                    <div class="drop-btn" data-dropdown="adv-search-contains" data-listener="dropdown">does not contain</div>
                                </div>
                                <span id="adv-search-contains" class="dropdown down-arrow" data-menu="adv-search-contains-content" data-parent-menu="adv-search-content" data-value="contains" data-listener="menuChild"></span>
                            </span>
                        </div>
                        <div class="row row-mgn flex-child grow mgn-btm">
                            <input id="adv-search-input" type="text">
                            <span id="adv-search-add" class="add-btn"></span>
                        </div>
                    </div>
                    <div class="row mobile multi-checkboxes">
                        <label class="checkbox-ctn">
                            <input id="adv-search-and" type="checkbox" data-option="and" data-listener="searchMode" checked="checked">
                            <span class="checkbox"></span>
                            <label for="adv-search-and" class="lb-title checkbox-title">Match all terms</label>
                        </label>
                        <label class="checkbox-ctn">
                            <input id="adv-search-whole" type="checkbox" data-option="whole" data-listener="searchMode">
                            <span class="checkbox"></span>
                            <label for="adv-search-whole" class="lb-title checkbox-title">Match whole term</label>
                        </label>
                    </div>
                </div>
            </div>
            <div class="nav-menu sort">
                <div class="nav-btn" id="sortmenu" data-menu="sortmenu-content" data-listener="menu"></div>
                <div class="nav-menu-content hidden" id="sortmenu-content">
                    <div class="sortmenu-btn desc" id="modified-desc" data-text="Date Modified"></div>
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
                <div class="nav-btn down-arrow" id="sidemenu" data-menu="sidemenu-content" data-listener="menu"></div>
                <div class="nav-menu-content hidden" id="sidemenu-content">
                    <div class="sidemenu-btn" id="account">ACCOUNT</div>
                    <div class="sidemenu-btn" id="logout">LOGOUT</div>
                </div>
            </div>
        </nav>
        <main>
            <div class="bookmark-container" id="bookmark-container"></div>
            <div class="modal-container hidden" id="bk-modal" data-modal="bk-modal" data-listener="modalClose">
                <div class="modal-content pad-ctn-2">
                    <div class="modal-header">
                        <span class="close" id="close-bk-modal" data-modal="bk-modal" data-listener="modalClose">&times;</span>
                    </div>
                    <figure class="preview-output" id="preview" data-href="#">
                        <img class="image" id="preview-image" src="images/No-Image.jpg">
                        <figcaption class="title" id="preview-title">No Title</figcaption>
                    </figure>
                    <form id="bk-f" enctype="multipart/form-data">
                        <div class="row between">
                            <label for="bk-file-input" id="bk-file-input-group" class="file-input-group">
                                <span id="file-label" class="file-input-name hidden"></span>
                                <span id="file-btn" class="file-input-btn"></span>
                            </label>
                            <input type="file" name="imageURL" id="bk-file-input" class="file-input" accept="image/png, image/jpeg">
                            <input type="hidden" name="removeImage" id="bk-file-remove" value="false">
                        </div>
                        <div class="row mobile">
                            <div class="column bk-left">
                                <div class="row">
                                    <label for="bk-f-url" class="lb-title horizontal">Link</label>
                                    <div class="form-group full-width">
                                        <input type="text" placeholder="Enter URL" name="pageURL" id="bk-f-url" data-preview="preview" data-attr="data-href" data-invalid-value="#" data-listener="errorCheck inputPreview" required>
                                        <label class="error-label invisible" id="bk-f-url-error">Error</label>
                                    </div>
                                </div>
                                <div class="row">
                                    <label for="bk-f-title" class="lb-title horizontal">Title</label>
                                    <div class="form-group full-width">
                                        <input type="text" placeholder="Enter Title" name="title" id="bk-f-title" data-preview="preview-title" data-attr="innerHTML" data-invalid-value="No Title" data-listener="errorCheck inputPreview" required>
                                        <label class="error-label invisible" id="bk-f-title-error">Error</label>
                                    </div>
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
                        <button class="btn-hollow white submit" id="bk-submit" type="submit">SUBMIT</button>
                    </form>
                </div>
            </div>
            <div class="modal-container hidden" id="acc-modal" data-modal="acc-modal" data-listener="modalClose">
                <div class="modal-content acc-modal">
                    <div class="modal-header">
                        <span class="close" id="close-acc-modal" data-modal="acc-modal" data-listener="modalClose">&times;</span>
                    </div>
                    <div id="acc-left-panel">
                        <div id="acc-tab-info" class="acc-btn active" data-listener="acc-btn" data-panel="acc-panel-info">Account Info</div>
                        <div id="acc-tab-pass" class="acc-btn" data-listener="acc-btn" data-panel="acc-panel-pass">Password</div>
                    </div>
                    <div class="acc-right-panel pad-ctn-2" id="acc-panel-info">
                        <form id="acc-profile-form" data-listener="profileForm" data-type="profile" enctype="multipart/form-data">
                            <div class="row mobile">
                                <div class="form-group">
                                    <label for="acc-username">Username</label>
                                    <input type="text" name="username" id="acc-username" data-listener="errorCheck" required>
                                    <label class="error-label invisible" id="acc-username-error">Error</label>
                                </div>
                                <div class="form-group">
                                    <label for="acc-email">Email</label>
                                    <input type="email" name="email" id="acc-email" data-listener="errorCheck" required>
                                    <label class="error-label invisible" id="acc-email-error">Error</label>
                                </div>
                            </div>
                            <div class="row mobile">
                                <div class="form-group no-error">
                                    <label for="acc-created">Date Created</label>
                                    <input type="text" id="acc-created" disabled>
                                </div>
                                <div class="form-group no-error">
                                    <label for="acc-type">Account Type</label>
                                    <input type="text" id="acc-type" disabled>
                                </div>
                            </div>
                            <button type="submit" id="profile-submit" class="btn-hollow white">Save Changes</button>
                        </form>
                    </div>
                    <div class="acc-right-panel hidden-panel pad-ctn-2 hidden" id="acc-panel-pass">
                        <form id="acc-pass-form" data-listener="profileForm" data-type="password" enctype="multipart/form-data">
                            <div class="form-group">
                                <label for="pass-cur">Current Password</label>
                                <input type="password" name="password" id="pass-cur" class="med-width" data-listener="errorCheck" required>
                                <label class="error-label invisible" id="pass-cur-error">Error</label>
                            </div>
                            <div class="form-group">
                                <label for="pass-new">New Password</label>
                                <input type="password" name="password-new" id="pass-new" class="med-width" data-listener="errorCheck" required>
                                <label class="error-label invisible" id="pass-new-error">Error</label>
                            </div>
                            <div class="form-group">
                                <label for="pass-conf">Confirm Password</label>
                                <input type="password" name="password-confirm" id="pass-new-confirm" class="med-width" data-listener="errorCheck" required>
                                <label class="error-label invisible" id="pass-new-confirm-error">Error</label>
                            </div>
                            <button type="submit" id="pass-submit" class="btn-hollow white">Change Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
	</body>
</html>