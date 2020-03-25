<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if (!empty($_POST) && isset($_POST["username"]) && isset($_POST["password"])) {
        $username = $_POST["username"];
        $password = $_POST["password"];
        if (empty($username) || empty($password)) {
            echo json_encode(["Success" => false, "Message" => "All fields are required"]);
        } else {
            $loginInfo = getLoginInfo($username);
            if (!empty($loginInfo)) {
                $userID = $loginInfo["UserID"];
                $passwordHash = $loginInfo["PasswordHash"];
                if (password_verify($password, $passwordHash)) {
                    $token = createToken($userID, 90);
                    echo json_encode(["Success" => true, "UID" => $userID, "Token" => $token]);
                } else {
                    echo json_encode(["Success" => false, "Message" => "Incorrect login credentials"]);
                }
            } else {
                echo json_encode(["Success" => false, "Message" => "Incorrect login credentials"]);
            }
        }
    } else {
        echo json_encode(["Success" => false, "Message" => "Invalid form information"]);
    }
} catch(PDOException $e) {
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>