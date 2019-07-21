<?php
include("db-connect.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];

        $stmt = "SELECT      b.BookmarkID, b.Title, b.PageURL, b.ImageURL, b.DateCreated, b.DateModified
                 FROM        Bookmark AS b
                 WHERE       b.UserID = :userID;";
        $query = $conn->prepare($stmt);
        $query->bindParam(":userID", $userID);
        $query->execute();
        $result = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($result);
    } else {
        echo json_encode("Error: Access denied. No active user found.");
    }
} catch(PDOException $e) {
    $conn->rollback();
	echo "Error: " . $e->getMessage();
}

$conn = null;
?>