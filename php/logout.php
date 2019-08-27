<?php
include("db-connect.php");
include("auth-tokens.php");
include_once("logging.php");

try {
    if (isset($_COOKIE["authToken"])) {
        $selector = strstr($_COOKIE["authToken"], ":", true);
        deleteToken($conn, $selector);
        setcookie("authToken", "", 1);
    }
    session_destroy();
    echo json_encode(["Success" => true, "Message" => "Logout successful"]);
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Logout failed. Error logged to file"]);
}

$conn = null;
?>