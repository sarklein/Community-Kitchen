<?php

$allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://irisy.sg-host.com"
];

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

$host = "localhost";
$username = "uimfsgff5ihxs";
$password = "robgaibler";
$database = "dbmdnolbcp5lop";

$conn = mysqli_connect(
    $host,
    $username,
    $password,
    $database
);

if (!$conn) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]));
}