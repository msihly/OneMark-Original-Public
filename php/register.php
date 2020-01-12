<?php
require_once("db-functions.php");
include_once("logging.php");

try {
    if(!empty($_POST)) {
        $email = $_POST["email"];
        $username = $_POST["username"];
        $password = $_POST["password"];
        $passwordConf = $_POST["password-confirm"];

        if(empty($email) || empty($username) || empty($password) || empty($passwordConf)) {
            echo json_encode(["Success" => false, "Message" => "All fields are required"]);
        } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["Success" => false, "Message" => "Enter a valid email"]);
        } else if (strlen($username) > 40) {
            echo json_encode(["Success" => false, "Message" => "Username cannot be more than 40 characters"]);
        } else if (getUser($username)) {
            echo json_encode(["Success" => false, "Message" => "Username is already taken"]);
        } else if (strlen($password) < 8) {
            echo json_encode(["Success" => false, "Message" => "Password must be a minimum of 8 characters"]);
        } else if ($password != $passwordConf) {
            echo json_encode(["Success" => false, "Message" => "Passwords do not match"]);
        } else {
            $userID = register($email, $username, $password);
            $_SESSION["uid"] = $userID;
            $_SESSION["username"] = $username;
            if (isset($_POST["remember-me"])) { setcookie("authToken", createToken($conn, $userID, 14), time() + (86400 * 14), "", ""); } // , TRUE, TRUE);   --removed for local testing without https

            echo json_encode(["Success" => true, "Message" => "Registration successful"]);
        }
    } else {
        echo json_encode(["Success" => false, "Message" => "Invalid form information. Please try again."]);
    }
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>