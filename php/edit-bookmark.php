<?php
include("db-connect.php");
include_once("logging.php");

try {
    if (isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $bookmarkID = $_POST["bookmarkID"];
        $title = $_POST["title"];
        $pageURL = $_POST["pageURL"];

        if (empty($title)) {
            echo json_encode(["Success" => false, "Message" => "Title field is required"]);
        } else if (empty($pageURL)) {
            echo json_encode(["Success" => false, "Message" => "URL field is required"]);
        } else {
            $query = "SELECT      b.BookmarkID, b.Title, b.PageURL, b.ImageURL, b.DateCreated, b.DateModified
                      FROM        Bookmark AS b
                      WHERE       b.BookmarkID = :bookmarkID;";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":bookmarkID", $bookmarkID);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $curTitle = $result[0]["Title"];
            $curPageURL = $result[0]["PageURL"];
            $curImageURL = $result[0]["ImageURL"];
            $dateCreated = $result[0]["DateCreated"];
            $dateModified = date("Y-m-d H:i:s");

            if (!empty($_FILES["imageURL"]["name"])) {
                $response = include("upload.php");
                if ($response["Success"]) {
                    $imageURL = $response["File"];
                } else {
                    echo json_encode(["Success" => false, "Message" => $response["Errors"]]);
                    exit();
                }
            } else {
                $imageURL = $curImageURL;
            }

            if ($title == $curTitle && $pageURL == $curPageURL && $imageURL == $curImageURL) {
                echo json_encode(["Success" => false, "Message" => "No changes made"]);
            } else {
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

                echo json_encode(["Success" => true, "BookmarkInfo" => ["BookmarkID" => $bookmarkID, "Title" => $title, "PageURL" => $pageURL,  "ImageURL" => $imageURL, "DateCreated" => $dateCreated, "DateModified" => $dateModified]]);
            }
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