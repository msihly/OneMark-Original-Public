<?php
require_once("restricted/db-functions.php");
include_once("restricted/logging.php");

try {
    if(!empty($_POST) && isset($_SESSION["uid"])) {
        $userID = $_SESSION["uid"];
        $passCur = $_POST["password"];
        $passNew = $_POST["password-new"];
        $passConf = $_POST["password-confirm"];

        if(empty($passCur) || empty($passNew) || empty($passConf)) {
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