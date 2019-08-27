<?php
include_once("logging.php");

function createToken($conn, int $userID, int $days) {
    $selector = base64_encode(random_bytes(15));
    $validator = base64_encode(random_bytes(33));
    $validatorHash = hash("sha256", $validator);
    $expiryDate = date("Y-m-d H:i:s", time() + (86400 * $days));

    try {
        $query = "INSERT INTO Token (Selector, ValidatorHash, ExpiryDate, UserID)
                     VALUES (:selector, :validatorHash, :expiryDate, :userID);";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":selector", $selector);
        $stmt->bindParam(":validatorHash", $validatorHash);
        $stmt->bindParam(":expiryDate", $expiryDate);
        $stmt->bindParam(":userID", $userID);
        $stmt->execute();
    } catch (PDOException $e) {
        logToFile("Error: " . $e->getMessage(), "e");
    }

    return $selector . ":" . $validator;
}

function deleteToken($conn, string $selector) {
    if (strlen($selector) !== 20) {
        logToFile("Invalid selector $selector", "e");
        return false;
    }

    try {
        $query = "DELETE
                  FROM        Token
                  WHERE       Selector = :selector;";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":selector", $selector);
        $stmt->execute();
    } catch (PDOException $e) {
        logToFile("Error: " . $e->getMessage(), "e");
    }

    return true;
}

function validateToken($conn, string $token) {
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

    try {
        $query = "SELECT      t.ValidatorHash, t.ExpiryDate, t.UserID
                  FROM        Token t
                  WHERE       t.Selector = :selector;";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":selector", $selector);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        logToFile("Error: " . $e->getMessage(), "e");
    }

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
?>