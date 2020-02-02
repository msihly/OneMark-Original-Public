<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $info = getUserInfo($userID);
        echo json_encode(["Success" => true, "Info" => $info]);
    } else {
        echo json_encode(["Success" => false, "Message" => "User not signed in"]);
    }
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>