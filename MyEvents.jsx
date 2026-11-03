import { useEffect, useState } from "react";
import "./Kitchen.css";

const API_URL =
  "https://irisy.sg-host.com/dist";

function MyEvent() {

  const userId =
    localStorage.getItem("user_id");

  const currentUserId =
    Number(userId);

  const [events, setEvents] =
    useState([]);

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [ingredients, setIngredients] =
    useState(["", "", ""]);

  const [eventIngredients, setEventIngredients] =
    useState([]);

  const [recipes, setRecipes] =
    useState([]);

  const [recipeLoading, setRecipeLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [status, setStatus] =
    useState("");


  useEffect(() => {

    if (userId) {
      loadMyEvents();
    }

  }, []);


  async function loadMyEvents() {

    try {

      const response = await fetch(
        `${API_URL}/events.php?action=my_events&user_id=${userId}&t=${Date.now()}`,
        {
          cache: "no-store"
        }
      );

      const result =
        await response.json();


      if (result.success) {

        const myEvents =
          result.events || [];

        setEvents(myEvents);


        if (myEvents.length > 0) {

          const firstEvent =
            myEvents[0];

          setSelectedEvent(firstEvent);

          await loadIngredients(
            firstEvent.event_id
          );

          await loadRecipes(
            firstEvent.event_id
          );
        }

      } else {

        setStatus("error");

        setMessage(
          result.message ||
          "Could not load your events."
        );
      }

    } catch (error) {

      console.error(error);

      setStatus("error");

      setMessage(
        "Unable to reach server."
      );
    }
  }


  async function loadIngredients(eventId) {

    try {

      const response = await fetch(
        `${API_URL}/ingredients.php?action=list&event_id=${eventId}&t=${Date.now()}`,
        {
          cache: "no-store"
        }
      );

      const result =
        await response.json();


      if (result.success) {

        setEventIngredients(
          result.ingredients || []
        );

      }

    } catch (error) {

      console.error(error);

    }
  }


  async function loadRecipes(eventId) {

    try {

      const response = await fetch(
        `${API_URL}/recipes.php?action=list&event_id=${eventId}&t=${Date.now()}`,
        {
          cache: "no-store"
        }
      );

      const result =
        await response.json();


      if (result.success) {

        setRecipes(
          result.recipes || []
        );

      }

    } catch (error) {

      console.error(error);

    }
  }


  function handleIngredientChange(
    index,
    value
  ) {

    const updated =
      [...ingredients];

    updated[index] = value;

    setIngredients(updated);
  }


  async function saveIngredients(event) {

    event.preventDefault();


    if (!selectedEvent) {
      return;
    }


    if (
      ingredients.some(
        ingredient =>
          ingredient.trim() === ""
      )
    ) {

      setStatus("error");

      setMessage(
        "Please enter all 3 ingredients."
      );

      return;
    }


    try {

      const response = await fetch(
        `${API_URL}/ingredients.php`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            action: "add",
            event_id:
              selectedEvent.event_id,
            user_id:
              currentUserId,
            ingredients:
              ingredients
          })
        }
      );


      const result =
        await response.json();


      if (result.success) {

        setStatus("success");

        setMessage(
          "Your ingredients were saved!"
        );

        await loadIngredients(
          selectedEvent.event_id
        );

        setIngredients([
          "",
          "",
          ""
        ]);

      } else {

        setStatus("error");

        setMessage(
          result.message ||
          "Could not save ingredients."
        );
      }

    } catch (error) {

      console.error(error);

      setStatus("error");

      setMessage(
        "Unable to reach server."
      );
    }
  }


  async function findRecipes() {

    if (!selectedEvent) {
      return;
    }


    setRecipeLoading(true);
    setMessage("");


    try {

      const response = await fetch(
        `${API_URL}/recipes.php`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            action: "find",
            event_id:
              selectedEvent.event_id
          })
        }
      );


      const result =
        await response.json();


      if (result.success) {

        setStatus("success");

        setMessage(
          "We found 3 recipe ideas!"
        );

        await loadRecipes(
          selectedEvent.event_id
        );

      } else {

        setStatus("error");

        setMessage(
          result.message ||
          "Could not find recipes."
        );
      }

    } catch (error) {

      console.error(error);

      setStatus("error");

      setMessage(
        "Unable to find recipes."
      );

    } finally {

      setRecipeLoading(false);

    }
  }


  async function chooseRecipe(recipeId) {

    if (!selectedEvent) {
      return;
    }


    try {

      const response = await fetch(
        `${API_URL}/recipes.php`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            action: "select",
            event_id:
              selectedEvent.event_id,
            recipe_id:
              recipeId
          })
        }
      );


      const result =
        await response.json();


      if (result.success) {

        setStatus("success");

        setMessage(
          "Dinner recipe selected!"
        );

        await loadRecipes(
          selectedEvent.event_id
        );

      } else {

        setStatus("error");

        setMessage(
          result.message ||
          "Could not select recipe."
        );
      }

    } catch (error) {

      console.error(error);

      setStatus("error");

      setMessage(
        "Unable to reach server."
      );
    }
  }


  async function chooseEvent(event) {

    setSelectedEvent(event);

    setMessage("");

    await loadIngredients(
      event.event_id
    );

    await loadRecipes(
      event.event_id
    );
  }


  if (!userId) {

    return (
      <div className="kitchen-page">

        <div className="kitchen-header">

          <h1 className="kitchen-title">
            Community Kitchen
          </h1>

          <p className="kitchen-subtitle">
            My Event
          </p>

        </div>

        <div className="kitchen-card">

          <p>
            Please register before
            viewing your events.
          </p>

        </div>

      </div>
    );
  }


  const isHost =
    selectedEvent &&
    Number(selectedEvent.host_user_id)
      === currentUserId;


  return (

    <div className="kitchen-page">

      <div className="kitchen-header">

        <h1 className="kitchen-title">
          Community Kitchen
        </h1>

        <p className="kitchen-subtitle">
          My Event
        </p>

      </div>


      {events.length === 0 ? (

        <div className="kitchen-card">

          <p>
            You have not signed up
            for an event yet.
          </p>

        </div>

      ) : (

        <>

          {events.length > 1 && (

            <div className="my-event-selector">

              <p>
                Choose an event:
              </p>

              {events.map(event => (

                <button
                  className="kitchen-button"
                  key={event.event_id}
                  onClick={() =>
                    chooseEvent(event)
                  }
                >
                  {event.event_name}
                </button>

              ))}

            </div>

          )}


          {selectedEvent && (

            <div className="my-event-layout">


              <section
                className="kitchen-card my-event-card"
              >

                <h2>
                  {selectedEvent.event_name}
                </h2>

                <p>
                  <strong>Date:</strong>{" "}
                  {selectedEvent.event_date}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {selectedEvent.start_time}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {selectedEvent.address},{" "}
                  {selectedEvent.city},{" "}
                  {selectedEvent.state}{" "}
                  {selectedEvent.zip_code}
                </p>

                <p>
                  <strong>Guests:</strong>{" "}
                  {selectedEvent.guest_count}
                  {" "}of{" "}
                  {selectedEvent.max_guests}
                </p>

                {isHost && (
                  <p>
                    <strong>
                      You are the host.
                    </strong>
                  </p>
                )}

              </section>


              <section
                className="kitchen-card ingredient-card"
              >

                <h2>
                  Bring 3 Ingredients
                </h2>

                <p>
                  What do you already
                  have at home?
                </p>


                <form
                  onSubmit={saveIngredients}
                >

                  {ingredients.map(
                    (ingredient, index) => (

                      <div
                        className="field-group"
                        key={index}
                      >

                        <label
                          className="label"
                        >
                          Ingredient{" "}
                          {index + 1}
                        </label>

                        <input
                          className="kitchen-input"
                          value={ingredient}
                          onChange={event =>
                            handleIngredientChange(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={
                            index === 0
                              ? "Tomatoes"
                              : index === 1
                              ? "Rice"
                              : "Garlic"
                          }
                          required
                        />

                      </div>

                    )
                  )}


                  <button
                    className="kitchen-button"
                    type="submit"
                  >
                    Save Ingredients
                  </button>

                </form>

              </section>


              <section
                className="kitchen-card pantry-card"
              >

                <h2>
                  Community Ingredients
                </h2>


                {eventIngredients.length === 0 ? (

                  <p>
                    No ingredients
                    have been added yet.
                  </p>

                ) : (

                  <ul>

                    {eventIngredients.map(
                      ingredient => (

                        <li
                          key={
                            ingredient.ingredient_id
                          }
                        >

                          <strong>
                            {
                              ingredient.ingredient_name
                            }
                          </strong>

                          {" — "}

                          {
                            ingredient.first_name
                          }

                        </li>

                      )
                    )}

                  </ul>

                )}

              </section>


              <section
                className="kitchen-card recipe-section"
              >

                <h2>
                  Dinner Recipe
                </h2>


                {recipes.length === 0 ? (

                  <>

                    <p>
                      No recipe has been
                      suggested yet.
                    </p>


                    {isHost && (

                      <button
                        className="kitchen-button"
                        onClick={findRecipes}
                        disabled={recipeLoading}
                      >

                        {recipeLoading
                          ? "Finding Recipes..."
                          : "Find Recipes"}

                      </button>

                    )}


                    {!isHost && (

                      <p>
                        Waiting for the host
                        to choose a recipe.
                      </p>

                    )}

                  </>

                ) : (

                  <div className="recipe-grid">

                    {recipes.map(recipe => {

                      const selected =
                        Number(
                          recipe.selected
                        ) === 1;


                      return (

                        <div
                          className={
                            `recipe-card ${
                              selected
                                ? "selected-recipe"
                                : ""
                            }`
                          }
                          key={recipe.recipe_id}
                        >


                          {recipe.recipe_image && (

                            <img
                              src={
                                recipe.recipe_image
                              }
                              alt={
                                recipe.recipe_name
                              }
                            />

                          )}


                          <h3>
                            {recipe.recipe_name}
                          </h3>


                          <p>
                            <strong>
                              {
                                recipe.used_ingredients
                              }
                            </strong>{" "}
                            community ingredients used
                          </p>


                          <p>
                            <strong>
                              {
                                recipe.missing_ingredients
                              }
                            </strong>{" "}
                            additional ingredients needed
                          </p>


                          {selected ? (

                            <p className="recipe-chosen">
                              ✓ Tonight's Dinner
                            </p>

                          ) : (

                            isHost && (

                              <button
                                className="kitchen-button"
                                onClick={() =>
                                  chooseRecipe(
                                    recipe.recipe_id
                                  )
                                }
                              >
                                Choose This Recipe
                              </button>

                            )

                          )}

                        </div>

                      );

                    })}

                  </div>

                )}

              </section>


              {message && (

                <p
                  className={
                    `status-message page-status ${status}`
                  }
                >
                  {message}
                </p>

              )}

            </div>

          )}

        </>

      )}

    </div>

  );
}

export default MyEvent;
