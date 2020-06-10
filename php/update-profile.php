<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if(!empty($_POST) && isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];

        if ($_POST["formType"] == "profile") {
            $email = $_POST["email"];
            $username = $_POST["username"];
            $usernameID = getUser($username);

            if (empty($username) || empty($email)) {
                echo json_encode(["Success" => false, "Message" => "All fields are required"]);
            } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["Success" => false, "Message" => "Invalid email"]);
            } else if (strlen($username) > 40) {
                echo json_encode(["Success" => false, "Message" => "Username cannot be more than 40 characters"]);
            } else if ($usernameID && $usernameID != $userID) {
                echo json_encode(["Success" => false, "Message" => "Username is already taken"]);
            } else {
                updateProfile($userID, $email, $username);
                $_SESSION["username"] = $username;
                echo json_encode(["Success" => true, "Info" => ["Username" => $username, "Email" => $email]]);
            }
        } else if ($_POST["formType"] == "password") {
            $passCur = $_POST["password"];
            $passNew = $_POST["password-new"];
            $passConf = $_POST["password-confirm"];

            if (empty($passCur) || empty($passNew) || empty($passConf)) {
                echo json_encode(["Success" => false, "Message" => "All fields are required"]);
            } else if (strlen($passNew) < 8) {
                echo json_encode(["Success" => false, "Message" => "New password must be a minimum of 8 characters"]);
            } else if ($passNew != $passConf) {
                echo json_encode(["Success" => false, "Message" => "New Password and Confirm Password mismatch"]);
            } else if ($passCur === $passNew) {
                echo json_encode(["Success" => false, "Message" => "New Password cannot match Current Password"]);
            } else {
                $passHash = getPass($userID);
                if (password_verify($passCur, $passHash)) {
                    updatePass($userID, password_hash($passNew, PASSWORD_DEFAULT));
                    echo json_encode(["Success" => true, "Message" => "Password updated"]);
                } else {
                    echo json_encode(["Success" => false, "Message" => "Current password is incorrect"]);
                }
            }
        }
    } else {
        echo json_encode(["Success" => false, "Message" => "Invalid form information"]);
    }
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>