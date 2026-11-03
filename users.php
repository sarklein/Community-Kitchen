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

header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$action = $data["action"] ?? $_GET["action"] ?? "";

if ($action === "register") {
    $firstName = $data["first_name"];
    $lastName = $data["last_name"];
    $email = $data["email"];
    $zipCode = $data["zip_code"];

    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO users
        (first_name, last_name, email, zip_code)
        VALUES (?, ?, ?, ?)"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "ssss",
        $firstName,
        $lastName,
        $email,
        $zipCode
    );

    mysqli_stmt_execute($stmt);

    echo json_encode([
        "success" => true,
        "message" => "User registered successfully",
        "user_id" => mysqli_insert_id($conn)
    ]);
}

elseif ($action === "list") {
    $result = mysqli_query(
        $conn,
        "SELECT user_id, first_name, last_name, email, zip_code
         FROM users
         ORDER BY last_name"
    );

    $users = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }

    echo json_encode([
        "success" => true,
        "users" => $users
    ]);
}

else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid action"
    ]);
}