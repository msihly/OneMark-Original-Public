<?php
include("db-connect.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $title = $_POST["title"];
        $pageURL = $_POST["pageURL"];

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

            $dateCreated = date('Y-m-d H:i:s');
            $dateModified = $dateCreated;

            $stmt = "INSERT INTO Bookmark (Title, PageURL, ImageURL, DateCreated, DateModified, UserID)
                        VALUES (:title, :pageURL, :imageURL, :dateCreated, :dateModified, :userID);";
            $query = $conn->prepare($stmt);
            $query->bindParam(":title", $title);
            $query->bindParam(":pageURL", $pageURL);
            $query->bindParam(":imageURL", $imageURL);
            $query->bindParam(":dateCreated", $dateCreated);
            $query->bindParam(":dateModified", $dateModified);
            $query->bindParam(":userID", $userID);
            $query->execute();
            $bookmarkID = $conn->lastInsertId();

            echo json_encode(["BookmarkID" => $bookmarkID, "Title" => $title, "PageURL" => $pageURL,  "ImageURL" => $imageURL, "DateCreated" => $dateCreated, "DateModified" => $dateModified]);
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