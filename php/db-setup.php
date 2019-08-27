<?php
include("db-connect.php");
include_once("logging.php");

try {
    $conn->beginTransaction();

    $query = ""; //REDACTED
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $query = ""; //REDACTED
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $query = ""; //REDACTED
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $query = ""; //REDACTED
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $query = ""; //REDACTED
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $query = ""; //REDACTED
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $query = ""; //REDACTED
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $query = ""; //REDACTED
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $conn->commit();

    echo json_encode(["Success" => true, "Message" => "Database successfully created"]);
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>