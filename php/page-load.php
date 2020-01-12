<?php
    session_start();
    echo json_encode(["Success" => isset($_SESSION["uid"])]);
?>