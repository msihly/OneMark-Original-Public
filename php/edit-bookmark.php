<?php
include("db-connect.php");
include_once("logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $title = $_POST["title"];
        $pageURL = $_POST["pageURL"];
        $bookmarkID = $_POST["bookmarkID"];

        if (empty($title)) {
            echo json_encode(["Success" => false, "Message" => "Title field is required"]);
        } else if (empty($pageURL)) {
            echo json_encode(["Success" => false, "Message" => "URL field is required"]);
        } else {
            $response = include("upload.php");
            if (!$response["error"]) {
                $imageURL = $response["file"];
            } else {
                echo json_encode(["Success" => false, "Message" => $response["errors"]]);
                exit();
            }

            $dateModified = date("Y-m-d H:i:s");

            $query = "UPDATE      Bookmark AS b
                      SET         b.Title = :title, b.PageURL = :pageURL, b.ImageURL = :imageURL, b.DateModified = :dateModified
                      WHERE       b.UserID = :userID AND b.BookmarkID = :bookmarkID;";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":pageURL", $pageURL);
            $stmt->bindParam(":imageURL", $imageURL);
            $stmt->bindParam(":dateModified", $dateModified);
            $stmt->bindParam(":userID", $userID);
            $stmt->bindParam(":bookmarkID", $bookmarkID);
            $stmt->execute();

            echo json_encode(["Success" => true, "BookmarkInfo" => ["BookmarkID" => $bookmarkID, "Title" => $title, "PageURL" => $pageURL,  "ImageURL" => $imageURL, "DateModified" => $dateModified]]);
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