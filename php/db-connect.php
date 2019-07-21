<?php
$dbservername = ""; //REDACTED
$dbusername = ""; //REDACTED
$dbpassword = ""; //REDACTED
$dbname = ""; //REDACTED

try {
    $conn = new PDO("mysql:host=$dbservername;dbname=$dbname", $dbusername, $dbpassword);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
	echo "Error: " . $e->getMessage();
}

session_start();
?>