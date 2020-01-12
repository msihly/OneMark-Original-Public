<?php
require_once("db-functions.php");
include_once("logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $bookmarks = getAllBookmarks($userID);
        if (!empty($bookmarks)) {
            foreach ($bookmarks as $idx => $bk) {
                $tags = getAllBookmarkTags($bk["BookmarkID"]);
                $bookmarks[$idx]["Tags"] = empty($tags) ? [] : $tags;
            }
        }

        echo json_encode(["Success" => true, "Bookmarks" => $bookmarks]);
    } else {
        echo json_encode(["Success" => false, "Message" => "Error: Access denied. No active user found."]);
    }
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>