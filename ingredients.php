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

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$action =
    $data["action"]
    ?? $_GET["action"]
    ?? "";


if ($action === "add") {

    $eventId = $data["event_id"];
    $userId = $data["user_id"];
    $ingredients = $data["ingredients"];


    if (count($ingredients) !== 3) {

        echo json_encode([
            "success" => false,
            "message" => "Please enter exactly 3 ingredients."
        ]);

        exit;
    }

    $deleteStmt = mysqli_prepare(
        $conn,
        "DELETE FROM event_ingredients
         WHERE event_id = ?
         AND user_id = ?"
    );

    mysqli_stmt_bind_param(
        $deleteStmt,
        "ii",
        $eventId,
        $userId
    );

    mysqli_stmt_execute($deleteStmt);

    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO event_ingredients
        (
            event_id,
            user_id,
            ingredient_name
        )
        VALUES (?, ?, ?)"
    );


    foreach ($ingredients as $ingredient) {

        $ingredient = trim($ingredient);

        mysqli_stmt_bind_param(
            $stmt,
            "iis",
            $eventId,
            $userId,
            $ingredient
        );

        mysqli_stmt_execute($stmt);
    }


    echo json_encode([
        "success" => true,
        "message" => "Ingredients saved!"
    ]);
}

elseif ($action === "list") {

    $eventId = $_GET["event_id"] ?? null;

    if (!$eventId) {

        echo json_encode([
            "success" => false,
            "message" => "Event ID is required."
        ]);

        exit;
    }


    $stmt = mysqli_prepare(
        $conn,
        "SELECT
            ei.ingredient_id,
            ei.event_id,
            ei.user_id,
            ei.ingredient_name,
            u.first_name,
            u.last_name

         FROM event_ingredients ei

         INNER JOIN users u
            ON ei.user_id = u.user_id

         WHERE ei.event_id = ?

         ORDER BY u.first_name"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "i",
        $eventId
    );

    mysqli_stmt_execute($stmt);

    $result =
        mysqli_stmt_get_result($stmt);

    $ingredients = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $ingredients[] = $row;
    }


    echo json_encode([
        "success" => true,
        "ingredients" => $ingredients
    ]);
}

else {

    echo json_encode([
        "success" => false,
        "message" => "Invalid action"
    ]);
}