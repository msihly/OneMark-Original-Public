<?php
include_once("logging.php");

$dbservername = getenv("DB_SERVER_NAME");
$dbusername = getenv("DB_USERNAME");
$dbpassword = getenv("DB_PASSWORD");
$dbname = getenv("DB_NAME");

try {
    $conn = new PDO("mysql:host=$dbservername;dbname=$dbname", $dbusername, $dbpassword);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

session_start();
?>