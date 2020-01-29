<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $bookmarks = getAllBookmarks($userID);
        echo json_encode(["Success" => true, "Bookmarks" => $bookmarks]);
    } else {
        header("Location: ../index.php");
        exit;
    }
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>