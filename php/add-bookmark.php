<?php
include("db-connect.php");
include_once("logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $title = $_POST["title"];
        $pageURL = $_POST["pageURL"];

        if (empty($title)) {
            echo json_encode(["Success" => false, "Message" => "Title field is required"]);
        } else if (empty($pageURL)) {
            echo json_encode(["Success" => false, "Message" => "URL field is required"]);
        } else {
            $response = include("upload.php");
            if ($response["Success"]) {
                $imageURL = $response["File"];
            } else {
                echo json_encode(["Success" => false, "Message" => $response["Errors"]]);
                exit();
            }

            $dateCreated = date("Y-m-d H:i:s");
            $dateModified = $dateCreated;

            $query = "INSERT INTO Bookmark (Title, PageURL, ImageURL, DateCreated, DateModified, UserID)
                        VALUES (:title, :pageURL, :imageURL, :dateCreated, :dateModified, :userID);";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":pageURL", $pageURL);
            $stmt->bindParam(":imageURL", $imageURL);
            $stmt->bindParam(":dateCreated", $dateCreated);
            $stmt->bindParam(":dateModified", $dateModified);
            $stmt->bindParam(":userID", $userID);
            $stmt->execute();
            $bookmarkID = $conn->lastInsertId();

            echo json_encode(["Success" => true, "BookmarkInfo" => ["BookmarkID" => $bookmarkID, "Title" => $title, "PageURL" => $pageURL,  "ImageURL" => $imageURL, "DateCreated" => $dateCreated, "DateModified" => $dateModified]]);
        }
    } else {
        echo json_encode(["Success" => false, "Message" => "User not signed in"]);
    }
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>