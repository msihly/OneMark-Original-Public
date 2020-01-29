<?php
require_once("db-connect.php");
include_once("logging.php");

try {
    $conn->beginTransaction();
    /************************** TABLES **************************/
    // SECTION REDACTED IN PUBLIC REPO FOR SECURITY

    /************************** FOREIGN KEYS **************************/
    // SECTION REDACTED IN PUBLIC REPO FOR SECURITY

    /************************** INDEXES **************************/
    // SECTION REDACTED IN PUBLIC REPO FOR SECURITY

    /************************** DEFAULT VALUES **************************/
    // SECTION REDACTED IN PUBLIC REPO FOR SECURITY

    $conn->commit();

    echo json_encode(["Success" => true, "Message" => "Database successfully created"]);
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>