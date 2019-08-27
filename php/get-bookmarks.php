<?php
include("db-connect.php");
include_once("logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];

        $query = "SELECT      b.BookmarkID, b.Title, b.PageURL, b.ImageURL, b.DateCreated, b.DateModified
                  FROM        Bookmark AS b
                  WHERE       b.UserID = :userID;";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":userID", $userID);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["Success" => true, "Bookmarks" => $result]);
    } else {
        echo json_encode(["Success" => false, "Message" => "Error: Access denied. No active user found."]);
    }
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>