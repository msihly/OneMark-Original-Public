<?php
include("db-connect.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $title = $_POST["title"];
        $pageURL = $_POST["pageURL"];
        $bookmarkID = $_POST["bookmarkID"];

        if (empty($title)) {
            echo json_encode("Error: Title field is required.");
        } else if (empty($pageURL)) {
            echo json_encode("Error: URL field is required.");
        } else {
            $response = include("upload.php");
            if (!$response["error"]) {
                $imageURL = $response["file"];
            } else {
                echo json_encode($response["errors"]);
                exit();
            }

            $dateModified = date('Y-m-d H:i:s');

            $stmt = "UPDATE      Bookmark AS b
                     SET         b.Title = :title, b.PageURL = :pageURL, b.ImageURL = :imageURL, b.DateModified = :dateModified
                     WHERE       b.UserID = :userID AND b.BookmarkID = :bookmarkID;";
            $query = $conn->prepare($stmt);
            $query->bindParam(":title", $title);
            $query->bindParam(":pageURL", $pageURL);
            $query->bindParam(":imageURL", $imageURL);
            $query->bindParam(":dateModified", $dateModified);
            $query->bindParam(":userID", $userID);
            $query->bindParam(":bookmarkID", $bookmarkID);
            $query->execute();

            echo json_encode(["BookmarkID" => $bookmarkID, "Title" => $title, "PageURL" => $pageURL,  "ImageURL" => $imageURL, "DateModified" => $dateModified]);
        }
    } else {
        echo json_encode("User not signed in.");
    }
} catch(PDOException $e) {
    $conn->rollback();
	echo json_encode("Error: " . $e->getMessage());
}

$conn = null;
?>