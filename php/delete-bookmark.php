<?php
include("db-connect.php");

try {
    if (isset($_SESSION["uid"])) {
        $bookmarkID = $_POST["bookmarkID"];

        $stmt = "DELETE
                 FROM        Bookmark
                 WHERE       BookmarkID = :bookmarkID;";
        $query = $conn->prepare($stmt);
        $query->bindParam(":bookmarkID", $bookmarkID);
        $query->execute();

        echo json_encode("Bookmark #" . $bookmarkID . " deleted.");
    } else {
        echo json_encode("User not signed in.");
    }
} catch(PDOException $e) {
    //$conn->rollback();
	echo json_encode("Error: " . $e->getMessage());
}

$conn = null;
?>