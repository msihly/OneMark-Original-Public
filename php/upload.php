<?php
require_once("../vendor/autoload.php");
require_once("restricted/db-functions.php");
require_once("restricted/logging.php");

if (isset($_FILES["imageURL"]) && $_FILES["imageURL"]["error"] != 4) {
    $s3 = new Aws\S3\S3Client([
        "version"  => "2006-03-01",
        "region"   => "us-east-1",
        "credentials" => [
            "key"    => getenv("AWS_ACCESS_KEY_ID"),
            "secret" => getenv("AWS_SECRET_ACCESS_KEY")
        ]
    ]);
    $bucket = getenv("S3_BUCKET")?: false;
    if (!$bucket) {
        logToFile("No 'S3_BUCKET' config var found in env!", "e");
        return ["Success" => false, "Errors" => ["Image server misconfiguartion"]];
    }

    $errors = [];
    $extensions = ["jpg", "jpeg", "png"];

    $imageTmp = $_FILES["imageURL"]["tmp_name"];
    $imageName = $_FILES["imageURL"]["name"];
    $imageType = $_FILES["imageURL"]["type"];
    $imageSize = $_FILES["imageURL"]["size"];
    $imageExt = explode(".", $imageName);
    $imageExt = strtolower(end($imageExt));

    $imageHash = md5_file($imageTmp);
    $imagePath = "uploads" . "/" . substr($imageHash, 0, 2) . "/" . substr($imageHash, 2, 2) . "/" . $imageHash . "." . $imageExt;
    $imageURL =  "https://" . $bucket . ".s3.us-east-1.amazonaws.com/" . $imagePath;

    if (!in_array($imageExt, $extensions)) { $errors[] = "Extension not allowed: " . $imageName . " | " . $imageType; }
    if ($imageSize > 2097152) { $errors[] = "Image size exceeds limit: " . $imageName . " | " . $imageSize; }
    if (empty($errors)) {
        $dupeCheck = imageExists($imageHash);
        if ($dupeCheck) {
            return ["Success" => true, "ImageID" => $dupeCheck["ImageID"], "ImagePath" => $dupeCheck["ImagePath"]];
        } else {
            //if (!is_dir($dir)) { mkdir($dir, 0777, true); }
            //move_uploaded_file($imageTmp, $imagePath);
            try {
                $result = $s3->upload($bucket, $imagePath, fopen($imageTmp, "rb"), "public-read");
                $imageID = uploadImage($imageURL, $imageHash);
                return ["Success" => true, "ImageID" => $imageID, "ImagePath" => $imageURL];
            } catch (Aws\S3\Exception\S3Exception $e) {
                logToFile($e->getMessage(), "e");
                return ["Success" => false, "Errors" => ["Image server misconfiguartion"]];
            }
        }
    } else {
        return ["Success" => false, "Errors" => $errors];
    }
} else {
    return ["Success" => true, "ImageID" => 2, "ImagePath" => "../images/No-Image.jpg"];
}

$conn = null;
?>