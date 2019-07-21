<?php
include("db-connect.php");

try {
    if(!empty($_POST) && isset($_POST["register"])) {
        echo "<pre>" . var_dump($_POST) . "</pre>";

        $email = $_POST["email"];
        $username = $_POST["username"];
        $password = $_POST["password"];
        $passwordConf = $_POST["password-confirm"];
        $date = date('Y-m-d H:i:s');

        if(empty($email) || empty($username) || empty($password) || empty($passwordConf)) {
            echo "All fields are required";
        } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo "Enter a valid email";
        } else if ($password != $passwordConf) {
            echo "Passwords do not match";
        } else if (strlen($password) < 8) {
            echo "Password must be a minimum of 8 characters";
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

            echo "User registered";
        }
    } else {
        echo "'Register' failed";
    }
} catch(PDOException $e) {
    $conn->rollback();
	echo "Error: " . $e->getMessage();
}

$conn = null;
?>