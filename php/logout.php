<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if (isset($_COOKIE["authToken"])) {
        $selector = strstr($_COOKIE["authToken"], ":", true);
        deleteToken($selector);
        setcookie("authToken", "", 1);
    }
    session_destroy();
    echo json_encode(["Success" => true, "Message" => "Logout successful"]);
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Logout failed. Error logged to file"]);
}

$conn = null;
?>