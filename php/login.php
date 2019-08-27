<?php
include("db-connect.php");
include("auth-tokens.php");
include_once("logging.php");

//delete token and cookie on logout and password change

try {
    if (isset($_SESSION["uid"])) {
        echo json_encode(["Success" => true, "Message" => "User already logged in"]);
    } else if (isset($_COOKIE["authToken"])) {
        $userID = validateToken($conn, $_COOKIE["authToken"]);
        if ($userID === false) {
            setcookie("authToken", "", 1); //delete cookie
            echo json_encode(["Success" => false, "Message" => "Invalid authentication token"]);
        } else {
            $_SESSION["uid"] = $userID;
            echo json_encode(["Success" => true, "Message" => "Login via token successful"]);
        }
    } else if (!empty($_POST) && isset($_POST["username"]) && isset($_POST["password"])) {
        $username = $_POST["username"];
        $password = $_POST["password"];
        if (empty($username) || empty($password)) {
            echo json_encode(["Success" => false, "Message" => "All fields are required"]);
        } else {
            $query = "SELECT      l.UserID, l.PasswordHash
                      FROM        Logins l
                      WHERE       l.Username = :username;";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":username", $username);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($result)) {
                $userID = $result[0]["UserID"];
                $passwordHash = $result[0]["PasswordHash"];
                if (password_verify($password, $passwordHash)) {
                    if (isset($_POST["remember-me"])) { setcookie("authToken", createToken($conn, $userID, 14), time() + (86400 * 14), TRUE, TRUE); }
                    $_SESSION["uid"] = $userID;
                    $_SESSION["username"] = $username;

                    echo json_encode(["Success" => true, "Message" => "Login successful"]);
                } else {
                    echo json_encode(["Success" => false, "Message" => "Incorrect login credentials"]);
                }
            } else {
                echo json_encode(["Success" => false, "Message" => "Incorrect login credentials"]);
            }
        }
    } else {
        echo json_encode(["Success" => false, "Message" => "Invalid form information / no attempt made to login"]);
    }
} catch(PDOException $e) {
    $conn->rollback();
    logToFile("Error: " . $e->getMessage(), "e");
	echo json_encode(["Success" => false, "Message" => "Error logged to file"]);
}

$conn = null;
?>