<?php
include("db-connect.php");

try {
    $stmt = ""; //REDACTED
    $query = $conn->prepare($stmt);
    $query->execute();

    $stmt = ""; //REDACTED
    $query = $conn->prepare($stmt);
    $query->execute();

    $stmt = ""; //REDACTED
    $query = $conn->prepare($stmt);
    $query->execute();

    $stmt = ""; //REDACTED
    $query = $conn->prepare($stmt);
    $query->execute();

    $stmt = ""; //REDACTED
    $query = $conn->prepare($stmt);
    $query->execute();

    echo "Database successfully created";
} catch(PDOException $e) {
    $conn->rollback();
	echo "Error: " . $e->getMessage();
}

$conn = null;
?>