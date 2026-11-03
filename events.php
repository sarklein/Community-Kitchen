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

$action = $data["action"] ?? $_GET["action"] ?? "";


if ($action === "create") {

    $hostUserId = $data["host_user_id"];
    $eventName = $data["event_name"];
    $eventDate = $data["event_date"];
    $startTime = $data["start_time"];
    $address = $data["address"];
    $city = $data["city"];
    $state = $data["state"];
    $zipCode = $data["zip_code"];
    $maxGuests = $data["max_guests"];

    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO events
        (
            host_user_id,
            event_name,
            event_date,
            start_time,
            address,
            city,
            state,
            zip_code,
            max_guests
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "isssssssi",
        $hostUserId,
        $eventName,
        $eventDate,
        $startTime,
        $address,
        $city,
        $state,
        $zipCode,
        $maxGuests
    );

    if (mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => true,
            "message" => "Dinner event created!",
            "event_id" => mysqli_insert_id($conn)
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Could not create event",
            "error" => mysqli_error($conn)
        ]);
    }
}


elseif ($action === "list") {

    $result = mysqli_query(
        $conn,
        "SELECT
            e.event_id,
            e.host_user_id,
            e.event_name,
            e.event_date,
            e.start_time,
            e.address,
            e.city,
            e.state,
            e.zip_code,
            e.max_guests,
            COUNT(em.event_member_id) AS guest_count

         FROM events e

         LEFT JOIN event_members em
            ON e.event_id = em.event_id

         WHERE e.event_date >= CURDATE()

         GROUP BY
            e.event_id,
            e.host_user_id,
            e.event_name,
            e.event_date,
            e.start_time,
            e.address,
            e.city,
            e.state,
            e.zip_code,
            e.max_guests

         ORDER BY e.event_date"
    );

    $events = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $events[] = $row;
    }

    echo json_encode([
        "success" => true,
        "events" => $events
    ]);
}

elseif ($action === "join") {

    $eventId = $data["event_id"];
    $userId = $data["user_id"];

    $checkMember = mysqli_prepare(
        $conn,
        "SELECT event_member_id
         FROM event_members
         WHERE event_id = ?
         AND user_id = ?"
    );

    mysqli_stmt_bind_param(
        $checkMember,
        "ii",
        $eventId,
        $userId
    );

    mysqli_stmt_execute($checkMember);

    $memberResult =
        mysqli_stmt_get_result($checkMember);


    if (mysqli_num_rows($memberResult) > 0) {

        echo json_encode([
            "success" => false,
            "message" => "You are already signed up for this dinner."
        ]);

        exit;
    }

    $checkCapacity = mysqli_prepare(
        $conn,
        "SELECT
            e.max_guests,
            COUNT(em.event_member_id) AS guest_count

         FROM events e

         LEFT JOIN event_members em
            ON e.event_id = em.event_id

         WHERE e.event_id = ?

         GROUP BY
            e.event_id,
            e.max_guests"
    );

    mysqli_stmt_bind_param(
        $checkCapacity,
        "i",
        $eventId
    );

    mysqli_stmt_execute($checkCapacity);

    $capacityResult =
        mysqli_stmt_get_result($checkCapacity);

    $event =
        mysqli_fetch_assoc($capacityResult);


    if (!$event) {

        echo json_encode([
            "success" => false,
            "message" => "Event not found."
        ]);

        exit;
    }

    if (
        (int)$event["guest_count"] >=
        (int)$event["max_guests"]
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Sorry, this dinner is full."
        ]);

        exit;
    }

    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO event_members
        (event_id, user_id)
        VALUES (?, ?)"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "ii",
        $eventId,
        $userId
    );


    if (mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => true,
            "message" => "You signed up for the dinner!"
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Could not join event",
            "error" => mysqli_error($conn)
        ]);
    }
}

elseif ($action === "my_events") {

    $userId =
        $_GET["user_id"] ?? null;


    if (!$userId) {

        echo json_encode([
            "success" => false,
            "message" =>
                "User ID is required."
        ]);

        exit;
    }


    $stmt = mysqli_prepare(
        $conn,
        "SELECT
            e.event_id,
            e.host_user_id,
            e.event_name,
            e.event_date,
            e.start_time,
            e.address,
            e.city,
            e.state,
            e.zip_code,
            e.max_guests,

            COUNT(em2.event_member_id)
                AS guest_count

         FROM events e

         LEFT JOIN event_members em2
            ON e.event_id =
               em2.event_id

         WHERE
            e.host_user_id = ?

            OR EXISTS (
                SELECT 1
                FROM event_members em
                WHERE
                    em.event_id =
                        e.event_id
                AND em.user_id = ?
            )

         GROUP BY
            e.event_id,
            e.host_user_id,
            e.event_name,
            e.event_date,
            e.start_time,
            e.address,
            e.city,
            e.state,
            e.zip_code,
            e.max_guests

         ORDER BY
            e.event_date"
    );


    mysqli_stmt_bind_param(
        $stmt,
        "ii",
        $userId,
        $userId
    );


    mysqli_stmt_execute($stmt);


    $result =
        mysqli_stmt_get_result($stmt);


    $events = [];


    while (
        $row =
            mysqli_fetch_assoc($result)
    ) {

        $events[] = $row;

    }


    echo json_encode([
        "success" => true,
        "events" => $events
    ]);
}

else {

    echo json_encode([
        "success" => false,
        "message" => "Invalid action"
    ]);
}