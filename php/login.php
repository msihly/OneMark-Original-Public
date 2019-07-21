<?php
include("db-connect.php");

try {
    if (isset($_POST["login"])) {
        $username = $_POST["username"];
        $password = $_POST["password"];
        if (empty($username) || empty($password)) {
            echo "All fields are required";
        } else {
            $stmt = "SELECT      l.UserID, l.PasswordHash
                     FROM        Logins l
                     WHERE       l.Username = :username;";
            $query = $conn->prepare($stmt);
            $query->bindParam(":username", $username);
            $query->execute();

            $result = $query->fetchAll(\PDO::FETCH_BOTH);
            if (!empty($result)) {
                $userID = $result[0][0];
                $passwordHash = $result[0][1];
                if (password_verify($password, $passwordHash)) {
                    $_SESSION["uid"] = $userID;
                    $_SESSION["username"] = $username;
                    header("Location: /main.html");
                    //echo "User successfully logged in";
                } else {
                    echo "Incorrect login credentials";
                }
            } else {
                echo "Incorrect login credentials";
            }
        }
    }
} catch(PDOException $e) {
    $conn->rollback();
	echo "Error: " . $e->getMessage();
}

$conn = null;
?>