<?php
require_once("db-connect.php");
include_once("logging.php");

/******************************* USERS / ACCOUNTS *******************************/
function getAccessLevel(int $userID) {
    GLOBAL $conn;
    $query = "SELECT      u.AccessLevel
              FROM        User AS u
              WHERE       u.UserID = :userID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userID", $userID);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0];
}

function getLoginInfo(string $username) {
    GLOBAL $conn;
    $query = "SELECT      l.UserID, l.PasswordHash
              FROM        Logins l
              WHERE       l.Username = :username;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0];
}

function getPass(int $userID) {
    GLOBAL $conn;
    $query = "SELECT      l.PasswordHash
              FROM        Logins l
              WHERE       l.UserID = :userID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userID", $userID);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0]["PasswordHash"];
}

function getUser(string $username) {
    GLOBAL $conn;
    $query = "SELECT      l.UserID
              FROM        Logins AS l
              WHERE       l.Username = :username;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0]["UserID"];
}

function getUserInfo(int $userID) {
    GLOBAL $conn;
    $query = "SELECT      l.Username, u.Email, u.DateCreated, u.Verified, u.AccessLevel
              FROM        Logins AS l INNER JOIN User AS u
                              ON l.UserID = u.UserID
              WHERE       u.UserID = :userID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userID", $userID);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0];
}

function register(string $email, string $username, string $password) {
    GLOBAL $conn;
    $date = date('Y-m-d H:i:s');

    $conn->beginTransaction();

    $query = "INSERT INTO User (Email, DateCreated)
                VALUES (:email, :dateCreated);";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":dateCreated", $date);
    $stmt->execute();

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $userID = $conn->lastInsertID();

    $query = "INSERT INTO Logins (Username, PasswordHash, UserID)
                VALUES (:username, :passwordHash, :userID);";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->bindParam(":passwordHash", $passwordHash);
    $stmt->bindParam(":userID", $userID);
    $stmt->execute();

    $conn->commit();

    return $userID;
}

function updateProfile(int $userID, string $email, string $username) {
    GLOBAL $conn;
    $query = "UPDATE      User AS u, Logins AS l
              SET         u.Email = :email, l.Username = :username
              WHERE       u.UserID = l.UserID AND u.UserID = :userID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userID", $userID);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":username", $username);
    $stmt->execute();
}

function updatePass(int $userID, string $passwordHash) {
    GLOBAL $conn;
    $query = "UPDATE      Logins AS l
              SET         l.PasswordHash = :passwordHash
              WHERE       l.UserID = :userID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userID", $userID);
    $stmt->bindParam(":passwordHash", $passwordHash);
    $stmt->execute();
}

/******************************* AUTHENTICATION TOKENS *******************************/
function createToken(int $userID, int $days) {
    GLOBAL $conn;
    $selector = base64_encode(random_bytes(15));
    $validator = base64_encode(random_bytes(33));
    $validatorHash = hash("sha256", $validator);
    $expiryDate = date("Y-m-d H:i:s", time() + (86400 * $days));

    $query = "INSERT INTO Token (Selector, ValidatorHash, ExpiryDate, UserID)
                 VALUES (:selector, :validatorHash, :expiryDate, :userID);";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":selector", $selector);
    $stmt->bindParam(":validatorHash", $validatorHash);
    $stmt->bindParam(":expiryDate", $expiryDate);
    $stmt->bindParam(":userID", $userID);
    $stmt->execute();

    return $selector . ":" . $validator;
}

function deleteToken(string $selector) {
    GLOBAL $conn;
    if (strlen($selector) !== 20) {
        logToFile("Invalid selector $selector", "e");
        return false;
    }

    $query = "DELETE
              FROM        Token
              WHERE       Selector = :selector;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":selector", $selector);
    $stmt->execute();

    return true;
}

function validateToken(string $token) {
    GLOBAL $conn;
    if (strpos($token, ":") === false) {
        logToFile("Failed to find ':' in token $token", "e");
        return false;
    }

    list($selector, $validator) = explode(":", $token);

    if (strlen($selector) !== 20 || strlen($validator) !== 44) {
        logToFile("Invalid length of selector [$selector] or validator [$validator]", "e");
        return false;
    }

    $validatorHash = hash("sha256", $validator);

    $query = "SELECT      t.ValidatorHash, t.ExpiryDate, t.UserID
              FROM        Token AS t
              WHERE       t.Selector = :selector;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":selector", $selector);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($result) || !hash_equals($result[0]["ValidatorHash"], $validatorHash)) {
        logToFile("Selector lookup failed or validator does not match", "e");
        return false;
    } else if (time() - strtotime($result[0]["ExpiryDate"]) > 0) {
        $deleteResult = deleteToken($conn, $selector);
        if ($deleteResult) { logToFile("Token [$token] has expired and been deleted"); }
        else { logToFile("Failed to delete token [$token]", "e"); }
        return false;
    }

    return $result[0]["UserID"];
}

/******************************* BOOKMARK *******************************/
function addView(int $bookmarkID, int $userID) {
    GLOBAL $conn;
    $query = "UPDATE      Bookmark AS b
              SET         b.Views = b.Views + 1
              WHERE       b.UserID = :userID AND b.BookmarkID = :bookmarkID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->bindParam(":userID", $userID);
    $stmt->execute();
}

function bookmarkExists(int $userID, string $pageURL) {
    GLOBAL $conn;
    $query = "SELECT      b.BookmarkID
              FROM        Bookmark AS b
              WHERE       b.UserID = :userID AND b.PageURL = :pageURL;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userID", $userID);
    $stmt->bindParam(":pageURL", $pageURL);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0];
}

function deleteBookmark(int $bookmarkID) {
    GLOBAL $conn;
    removeBookmarkTags($bookmarkID);
    $query = "DELETE
              FROM        Bookmark
              WHERE       BookmarkID = :bookmarkID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->execute();
}

function editBookmark(int $bookmarkID, int $userID, string $title, string $pageURL, int $imageID, array $tags) {
    GLOBAL $conn;
    $dateModified = date("Y-m-d H:i:s");

    $query = "UPDATE      Bookmark AS b
              SET         b.Title = :title, b.PageURL = :pageURL, b.ImageID = :imageID, b.DateModified = :dateModified
              WHERE       b.UserID = :userID AND b.BookmarkID = :bookmarkID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->bindParam(":userID", $userID);
    $stmt->bindParam(":title", $title);
    $stmt->bindParam(":pageURL", $pageURL);
    $stmt->bindParam(":imageID", $imageID);
    $stmt->bindParam(":dateModified", $dateModified);
    $stmt->execute();

    editBookmarkTags($bookmarkID, $tags);

    return $dateModified;
}

function getAllBookmarks(int $userID) {
    GLOBAL $conn;
    $query = "SELECT      b.BookmarkID, b.Title, b.PageURL, i.ImagePath, i.ImageSize, b.DateCreated, b.DateModified, b.Views
              FROM        Bookmark AS b INNER JOIN Images AS i
                              ON b.ImageID = i.ImageID
              WHERE       b.UserID = :userID
              ORDER BY    b.DateModified DESC";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userID", $userID);
    $stmt->execute();
    $bookmarks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($bookmarks)) {
        $query = "SELECT      b_t.BookmarkID, t.TagText
                  FROM        Tag AS t INNER JOIN BookmarkTag AS b_t
                              ON t.TagID = b_t.TagID
                  WHERE       b_t.BookmarkID IN (
                      SELECT    b.BookmarkID
                      FROM      Bookmark AS b
                      WHERE     b.UserID = :userID
                  );";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":userID", $userID);
        $stmt->execute();
        $tags = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($bookmarks as $idx => $bk) {
            $bookmarks[$idx]["Tags"] = array_column(array_filter($tags, function($var) use($bk) {
                return ($var["BookmarkID"] == $bk["BookmarkID"]);
            }), "TagText");
        }
    }

    return empty($bookmarks) ? [] : $bookmarks;
}

function getBookmark(int $bookmarkID) {
    GLOBAL $conn;
    $query = "SELECT      b.Title, b.PageURL, b.ImageID, i.ImagePath, i.ImageSize, b.DateCreated, b.DateModified, b.Views
              FROM        Bookmark AS b INNER JOIN Images AS i
                              ON b.ImageID = i.ImageID
              WHERE       b.BookmarkID = :bookmarkID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0];
}

function uploadBookmark(int $userID, int $imageID, string $title, string $pageURL, string $dateCreated = null, string $dateModified = null) {
    GLOBAL $conn;
    if (is_null($dateCreated)) { $dateCreated = date("Y-m-d H:i:s"); }
    if (is_null($dateModified)) { $dateModified = date("Y-m-d H:i:s"); }

    $query = "INSERT INTO Bookmark (Title, PageURL, DateCreated, DateModified, ImageID, UserID)
                VALUES (:title, :pageURL, :dateCreated, :dateModified, :imageID, :userID);";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":title", $title);
    $stmt->bindParam(":pageURL", $pageURL);
    $stmt->bindParam(":dateCreated", $dateCreated);
    $stmt->bindParam(":dateModified", $dateModified);
    $stmt->bindParam(":imageID", $imageID);
    $stmt->bindParam(":userID", $userID);
    $stmt->execute();

    return $conn->lastInsertId();
}

/******************************* IMAGES *******************************/
function getImagePath(int $imageID) {
    GLOBAL $conn;
    $query = "SELECT      i.ImagePath
              FROM        Images AS i
              WHERE       i.ImageID = :imageID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":imageD", $imageID);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0];
}

function imageExists(string $imageHash) {
    GLOBAL $conn;
    $query = "SELECT      i.ImageID, i.ImagePath
              FROM        Images AS i
              WHERE       i.ImageHash = :imageHash;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":imageHash", $imageHash);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0];
}

function uploadImage(string $imagePath, string $imageHash, int $imageSize) {
    GLOBAL $conn;
    $dateCreated = date("Y-m-d H:i:s");

    $query = "INSERT INTO Images (ImagePath, ImageHash, ImageSize, DateCreated)
                VALUES (:imagePath, :imageHash, :imageSize, :dateCreated);";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":imagePath", $imagePath);
    $stmt->bindParam(":imageHash", $imageHash);
    $stmt->bindParam(":imageSize", $imageSize);
    $stmt->bindParam(":dateCreated", $dateCreated);
    $stmt->execute();

    return $conn->lastInsertID();
}

/******************************* TAGS *******************************/
function addTag(int $bookmarkID, string $tagText) {
    GLOBAL $conn;
    $tagID = getTag($tagText)?: createTag($tagText);
    if (getBookmarkTag($bookmarkID, $tagID)) { return false; }

    $query = "INSERT INTO BookmarkTag (BookmarkID, TagID)
                  VALUES (:bookmarkID, :tagID);";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->bindParam(":tagID", $tagID);
    $stmt->execute();

    return ["BookmarkID" => $bookmarkID, "TagID" => $tagID];
}

function createTag(string $tagText) {
    GLOBAL $conn;
    $query = "INSERT INTO Tag (TagText)
                  VALUES (:tagText);";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":tagText", $tagText);
    $stmt->execute();

    return $conn->lastInsertID();
}

function editBookmarkTags(int $bookmarkID, array $tags) {
    GLOBAL $conn;
    $curTags = getAllBookmarkTags($bookmarkID);
    $add = array_diff($tags, $curTags);
    $remove = array_diff($curTags, $tags);
    foreach ($add as $a) { addTag($bookmarkID, $a); }
    foreach ($remove as $r) { removeTag($bookmarkID, $r); }

    return true;
}

function getAllBookmarkTags(int $bookmarkID) {
    GLOBAL $conn;
    $query = "SELECT      t.TagText
              FROM        Tag AS t INNER JOIN BookmarkTag AS b_t
                            ON t.TagID = b_t.TagID
              WHERE       b_t.BookmarkID = :bookmarkID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

    return empty($result) ? [] : $result;
}

function getAllUserTags(int $userID) {
    GLOBAL $conn;
    $query = "SELECT      t.TagText
              FROM        Tag AS t INNER JOIN BookmarkTag AS b_t
                              ON t.TagID = b_t.TagID
                          INNER JOIN Bookmark AS b
                              ON b.BookmarkID = b_t.BookmarkID
              WHERE       b.UserID = :userID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":userID", $userID);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? [] : $result;
}

function getAllTagBookmarks(int $tagID) {
    GLOBAL $conn;
    $query = "SELECT      b.bookmarkID
              FROM        Bookmark AS b INNER JOIN BookmarkTag AS b_t
                              ON b.BookmarkID = b_t.BookmarkID
              WHERE       b_t.TagID = :tagID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":tagID", $tagID);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? [] : $result;
}

function getBookmarkTag(int $bookmarkID, int $tagID) {
    GLOBAL $conn;
    $query = "SELECT      b_t.BookmarkID, b_t.TagID
              FROM        BookmarkTag AS b_t
              WHERE       b_t.BookmarkID = :bookmarkID AND b_t.TagID = :tagID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->bindParam(":tagID", $tagID);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0];
}

function getTag(string $tagText) {
    GLOBAL $conn;
    $query = "SELECT      t.TagID
              FROM        Tag AS t
              WHERE       t.TagText = :tagText;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":tagText", $tagText);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return empty($result) ? false : $result[0]["TagID"];
}

function removeBookmarkTags(int $bookmarkID) {
    GLOBAL $conn;
    $query = "DELETE
              FROM        BookmarkTag
              WHERE       BookmarkID = :bookmarkID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->execute();

    return true;
}

function removeTag(int $bookmarkID, string $tagText) {
    GLOBAL $conn;
    $tagID = getTag($tagText);
    if (!$tagID) { return false; }

    $query = "DELETE
              FROM        BookmarkTag
              WHERE       BookmarkID = :bookmarkID AND TagID = :tagID;";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":bookmarkID", $bookmarkID);
    $stmt->bindParam(":tagID", $tagID);
    $stmt->execute();

    return $tagID;
}

?>