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

$apiKey = "4f085e7916c94d1ea5173abb4386cd51";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$action =
    $data["action"]
    ?? $_GET["action"]
    ?? "";


if ($action === "find") {

    $eventId = $data["event_id"];


    /*
     * Get all ingredients
     * submitted for this event.
     */

    $stmt = mysqli_prepare(
        $conn,
        "SELECT ingredient_name
         FROM event_ingredients
         WHERE event_id = ?"
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


    while (
        $row = mysqli_fetch_assoc($result)
    ) {

        $ingredients[] =
            $row["ingredient_name"];

    }


    if (count($ingredients) === 0) {

        echo json_encode([
            "success" => false,
            "message" =>
                "No ingredients have been submitted yet."
        ]);

        exit;
    }


    /*
     * Convert ingredients into:
     *
     * chicken,rice,garlic,onion
     */

    $ingredientString =
        implode(",", $ingredients);


    /*
     * Build Spoonacular URL.
     *
     * number=3 gives us the top
     * three recipes.
     *
     * ranking=1 means favor recipes
     * using the most supplied ingredients.
     */

    $url =
        "https://api.spoonacular.com/recipes/findByIngredients"
        . "?apiKey="
        . urlencode($apiKey)
        . "&ingredients="
        . urlencode($ingredientString)
        . "&number=3"
        . "&ranking=1"
        . "&ignorePantry=true";


    /*
     * Call Spoonacular.
     */

    $response =
        file_get_contents($url);


    if ($response === false) {

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to reach Spoonacular."
        ]);

        exit;
    }


    $recipes =
        json_decode($response, true);


    if (!is_array($recipes)) {

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid response from Spoonacular."
        ]);

        exit;
    }


    /*
     * Remove old suggestions.
     */

    $deleteStmt = mysqli_prepare(
        $conn,
        "DELETE FROM recipes
         WHERE event_id = ?
         AND selected = 0"
    );

    mysqli_stmt_bind_param(
        $deleteStmt,
        "i",
        $eventId
    );

    mysqli_stmt_execute($deleteStmt);


    /*
     * Save top three suggestions.
     */

    $insertStmt = mysqli_prepare(
        $conn,
        "INSERT INTO recipes
        (
            event_id,
            external_recipe_id,
            recipe_name,
            recipe_image,
            recipe_url,
            used_ingredients,
            missing_ingredients,
            selected
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)"
    );


    foreach ($recipes as $recipe) {

        $externalId =
            $recipe["id"];

        $recipeName =
            $recipe["title"];

        $recipeImage =
            $recipe["image"] ?? "";


        $recipeUrl = "";

        $usedIngredients =
            $recipe["usedIngredientCount"];

        $missingIngredients =
            $recipe["missedIngredientCount"];


        mysqli_stmt_bind_param(
            $insertStmt,
            "iisssii",
            $eventId,
            $externalId,
            $recipeName,
            $recipeImage,
            $recipeUrl,
            $usedIngredients,
            $missingIngredients
        );

        mysqli_stmt_execute(
            $insertStmt
        );
    }

    echo json_encode([
        "success" => true,
        "message" =>
            "Recipe suggestions found!",
        "recipes" => $recipes
    ]);
}


elseif ($action === "list") {

    $eventId =
        $_GET["event_id"] ?? null;


    if (!$eventId) {

        echo json_encode([
            "success" => false,
            "message" =>
                "Event ID is required."
        ]);

        exit;
    }


    $stmt = mysqli_prepare(
        $conn,
        "SELECT
            recipe_id,
            event_id,
            external_recipe_id,
            recipe_name,
            recipe_image,
            recipe_url,
            used_ingredients,
            missing_ingredients,
            selected

         FROM recipes

         WHERE event_id = ?

         ORDER BY
            selected DESC,
            used_ingredients DESC,
            missing_ingredients ASC"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "i",
        $eventId
    );

    mysqli_stmt_execute($stmt);

    $result =
        mysqli_stmt_get_result($stmt);

    $recipes = [];


    while (
        $row = mysqli_fetch_assoc($result)
    ) {

        $recipes[] = $row;

    }


    echo json_encode([
        "success" => true,
        "recipes" => $recipes
    ]);
}


elseif ($action === "select") {

    $eventId =
        $data["event_id"];

    $recipeId =
        $data["recipe_id"];

    $clearStmt = mysqli_prepare(
        $conn,
        "UPDATE recipes
         SET selected = 0
         WHERE event_id = ?"
    );

    mysqli_stmt_bind_param(
        $clearStmt,
        "i",
        $eventId
    );

    mysqli_stmt_execute(
        $clearStmt
    );


    $selectStmt = mysqli_prepare(
        $conn,
        "UPDATE recipes
         SET selected = 1
         WHERE recipe_id = ?
         AND event_id = ?"
    );

    mysqli_stmt_bind_param(
        $selectStmt,
        "ii",
        $recipeId,
        $eventId
    );

    mysqli_stmt_execute(
        $selectStmt
    );


    echo json_encode([
        "success" => true,
        "message" =>
            "Dinner recipe selected!"
    ]);
}


else {

    echo json_encode([
        "success" => false,
        "message" =>
            "Invalid action"
    ]);
}