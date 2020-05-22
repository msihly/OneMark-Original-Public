<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if (isset($_SESSION["uid"])) {
        addView((int)$_POST["bookmarkID"], $_SESSION["uid"]);
    } else {
        logToFile("User not signed in", "e");
    }
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
}

$conn = null;
?>