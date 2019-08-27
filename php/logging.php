<?php
function logToFile(string $message, string $type = "info", string $logFile = "development") {
    $trace = debug_backtrace(2);
    $trace = array_shift($trace);
    switch (strtolower($type)) {
        case "i": case "info": $type = "INFO"; break;
        case "e": case "error": $type = "ERROR"; break;
        case "w": case "warning": $type = "WARNING"; break;
        case "d": case "debug": $type = "DEBUG"; break;
        default: $type = "INFO"; break;
    }
    error_log(date("[Y-m-d H:i:s]") . " [$type] [" . basename($trace["file"]) . " : " . $trace["line"] . "] $message\n", 3, "logs/" . $logFile . ".log");
}
?>