<?php
require_once("db-functions.php");
include_once("logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $title = $_POST["title"];
        $pageURL = $_POST["pageURL"];
        $tags = json_decode($_POST["tags"]);

        if (empty($title) || empty($pageURL)) {
            echo json_encode(["Success" => false, "Message" => "Title and URL fields are required"]);
        } else if (strlen($title) > 100) {
            echo json_encode(["Success" => false, "Message" => "Title cannot be more than 100 characters"]);
        } else if (strlen($pageURL) > 255) {
            echo json_encode(["Success" => false, "Message" => "Page URL cannot be more than 255 characters"]);
        } else if (!filter_var($pageURL, FILTER_VALIDATE_URL)) {
            echo json_encode(["Success" => false, "Message" => "Invalid page URL"]);
        } else {
            $response = include("upload.php");
            if ($response["Success"]) {
                $imageID = $response["ImageID"];
                $imagePath = $response["ImagePath"];
            } else {
                echo json_encode(["Success" => false, "Message" => $response["Errors"]]);
                exit();
            }

            $date = date("Y-m-d H:i:s");
            $bookmarkID = uploadBookmark($userID, $imageID, $title, $pageURL, $date, $date);

            foreach($tags as $tag) { addTag($bookmarkID, $tag); }

            echo json_encode(["Success" => true, "BookmarkInfo" => ["BookmarkID" => $bookmarkID, "Title" => $title, "PageURL" => $pageURL,  "ImagePath" => $imagePath, "DateCreated" => $date, "DateModified" => $date, "Tags" => $tags]]);
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