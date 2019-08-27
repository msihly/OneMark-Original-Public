<?php
include("db-connect.php");
include_once("logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $bookmarkID = $_POST["bookmarkID"];

        $query = "DELETE
                  FROM        Bookmark
                  WHERE       BookmarkID = :bookmarkID;";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":bookmarkID", $bookmarkID);
        $stmt->execute();

        echo json_encode(["Success" => true, "Message" => "Bookmark #" . $bookmarkID . " deleted."]);
    } else {
        echo json_encode(["Success" => false, "Message" => "User not signed in."]);
    }
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>