<?php
include("db-connect.php");
include("auth-tokens.php");
include_once("logging.php");

try {
    if(!empty($_POST)) {
        $email = $_POST["email"];
        $username = $_POST["username"];
        $password = $_POST["password"];
        $passwordConf = $_POST["password-confirm"];
        $date = date('Y-m-d H:i:s');

        if(empty($email) || empty($username) || empty($password) || empty($passwordConf)) {
            echo json_encode(["Success" => false, "Message" => "All fields are required"]);
        } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["Success" => false, "Message" => "Enter a valid email"]);
        } else if ($password != $passwordConf) {
            echo json_encode(["Success" => false, "Message" => "Passwords do not match"]);
        } else if (strlen($password) < 8) {
            echo json_encode(["Success" => false, "Message" => "Password must be a minimum of 8 characters"]);
        } else {
            $conn->beginTransaction();

            $stmt = "INSERT INTO User (Email, DateCreated)
                        VALUES (:email, :dateCreated);";
            $query = $conn->prepare($stmt);
            $query->bindParam(":email", $email);
            $query->bindParam(":dateCreated", $date);
            $query->execute();

            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $userID = $conn->lastInsertID();

            $stmt = "INSERT INTO Logins (Username, PasswordHash, UserID)
                        VALUES (:username, :passwordHash, :userID);";
            $query = $conn->prepare($stmt);
            $query->bindParam(":username", $username);
            $query->bindParam(":passwordHash", $passwordHash);
            $query->bindParam(":userID", $userID);
            $query->execute();

            $conn->commit();

            setcookie("authToken", createToken($conn, $userID, 14), time() + (86400 * 14), "", ""); // , TRUE, TRUE);   --removed for local testing without https

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