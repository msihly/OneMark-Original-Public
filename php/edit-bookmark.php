<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $bookmarkID = $_POST["bookmarkID"];
        $title = $_POST["title"];
        $pageURL = $_POST["pageURL"];
        $tags = json_decode($_POST["tags"]);

        if (empty($title)) {
            echo json_encode(["Success" => false, "Message" => "Title field is required"]);
        } else if (empty($pageURL)) {
            echo json_encode(["Success" => false, "Message" => "URL field is required"]);
        } else {
            $bookmark = getBookmark($bookmarkID);
            $imageID = $bookmark["ImageID"];
            $curImagePath = $bookmark["ImagePath"];
            $curTitle = $bookmark["Title"];
            $curPageURL = $bookmark["PageURL"];
            $curTags = getAllBookmarkTags($bookmarkID);
            $dateCreated = $bookmark["DateCreated"];

            if (!empty($_FILES["imageURL"]["name"])) {
                $response = include("upload.php");
                if ($response["Success"]) {
                    $imageID = $response["ImageID"];
                    $imagePath = $response["ImagePath"];
                } else {
                    echo json_encode(["Success" => false, "Message" => $response["Errors"]]);
                    exit();
                }
            } else {
                if ($_POST["removeImage"] == "true") {
                    $imageID = 2;
                    $imagePath = "../images/No-Image.jpg";
                } else {
                    $imagePath = $curImagePath;
                }
            }

            if ($title == $curTitle && $pageURL == $curPageURL && $imagePath == $curImagePath && empty(array_diff($tags, $curTags)) && empty(array_diff($curTags, $tags))) {
                echo json_encode(["Success" => false, "Message" => "No changes made"]);
            } else {
                $dateModified = editBookmark($bookmarkID, $userID, $title, $pageURL, $imageID, $tags);

                echo json_encode(["Success" => true, "BookmarkInfo" => ["BookmarkID" => $bookmarkID, "Title" => $title, "PageURL" => $pageURL,  "ImagePath" => $imagePath, "DateCreated" => $dateCreated, "DateModified" => $dateModified, "Views" => $_POST["views"], "Tags" => $tags]]);
            }
        }
    } else {
        echo json_encode(["Success" => false, "Message" => "User not signed in"]);
    }
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>