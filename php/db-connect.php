<?php
include_once("logging.php");

$dbservername = ""; //REDACTED
$dbusername = ""; //REDACTED
$dbpassword = ""; //REDACTED
$dbname = ""; //REDACTED

try {
    $conn = new PDO("mysql:host=$dbservername;dbname=$dbname", $dbusername, $dbpassword);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

session_start();
?>