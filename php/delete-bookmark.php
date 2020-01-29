<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $bookmarkID = $_POST["bookmarkID"];
        deleteBookmark($bookmarkID);

        echo json_encode(["Success" => true, "Message" => "Bookmark #" . $bookmarkID . " deleted."]);
    } else {
        echo json_encode(["Success" => false, "Message" => "User not signed in."]);
    }
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>