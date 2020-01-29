<?php
require_once("logging.php");
/*
logToFile("Default log test");
logToFile("Error log test", "e");
logToFile("Warning log test", "w");
logToFile("Debug log test", "d");

echo json_encode(["user_ini.filename" => ini_get("user_ini.filename"),
                  "display_errors" => ini_get("display_errors"),
                  "error_reporting" => ini_get("error_reporting"),
                  "error_log" => ini_get("error_log"),
                  "html_errors" => ini_get("html_errors")]);
*/
logToFile("");
logToFile("user_ini.filename: " . ini_get("user_ini.filename"));
logToFile("display_errors: " . (int)ini_get("display_errors"));
logToFile("error_reporting: " . ini_get("error_reporting"));
logToFile("error_log: " . ini_get("error_log"));
logToFile("html_errors: " . (int)ini_get("html_errors"));
?>