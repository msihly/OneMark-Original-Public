<?php
function logToFile($message, string $type = "info", int $line = null, string $logFile = "development") {
    $trace = debug_backtrace(2);
    $trace = array_shift($trace);
    switch (strtolower($type)) {
        case "i": case "info": $type = "INFO"; break;
        case "e": case "error": $type = "ERROR"; break;
        case "w": case "warning": $type = "WARNING"; break;
        case "d": case "debug": $type = "DEBUG"; break;
        default: $type = "INFO"; break;
    }
    error_log(date("[Y-m-d H:i:s]") . " [$type] [" . basename($trace["file"]) . " : " . (isset($line) ? $line : $trace["line"]) . "] " . print_r($message, TRUE) . "\n", 3, "restricted/logs/" . $logFile . ".log");
}
?>