<?php
if (isset($_FILES["imageURL"]) && $_FILES["imageURL"]["error"] != 4) {
    $errors = [];
    $extensions = ["jpg", "jpeg", "png", "gif"];

    $file_name = $_FILES["imageURL"]["name"];
    $file_tmp = $_FILES["imageURL"]["tmp_name"];
    $file_type = $_FILES["imageURL"]["type"];
    $file_size = $_FILES["imageURL"]["size"];
    $file_ext = explode(".", $file_name);
    $file_ext = strtolower(end($file_ext));

    $hash = md5_file($file_tmp);
    $dir = "../images/uploads/" . substr($hash, 0, 2) . "/" . substr($hash, 2, 2) . "/";
    $file_path =  $dir . $hash . "." . $file_ext;

    if (!in_array($file_ext, $extensions)) {
        $errors[] = "Extension not allowed: " . $file_name . " | " . $file_type;
    }

    if ($file_size > 2097152) {
        $errors[] = "File size exceeds limit: " . $file_name . " | " . $file_size;
    }

    if (empty($errors)) {
        if (!is_dir($dir)) {mkdir($dir, 0777, true);}
        move_uploaded_file($file_tmp, $file_path);
        return ["file" => $file_path, "error" => false];
    } else {
        return ["errors" => $errors, "error" => true];
    }
} else {
    return ["file" => "../images/assets/No-Image.jpg", "error" => false];
}
?>