import React, { useEffect, useCallback, useReducer } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...(currentIngredients + action.ingredient)];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("THis should not be happening.");
  }
};

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case 'SEND':
    return { loading: true, error: null};
    case 'RESPONSE':
      return {...currentHttpState, loading: false};
      case 'ERROR':
        return {loading: false, error: action.errorMessage};
        case 'CLEAR':
          return {...currentHttpState, error: null};
        default:
          throw new Error('Should not be reached!')
  }
}

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null});
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  useEffect(() => {
    console.log("Rendering", userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setUserIngredients(filteredIngredients);
    dispatch({
      type: "SET",
      ingredients: filteredIngredients,
    });
  }, []);

  const addIngredientHandler = (ingredient) => {
    dispatchHttp({type: 'SEND'});
    fetch(
      "https://react-tasks-a94be-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => {
        dispatchHttp({type: 'RESPONSE'});
        return response.json();
      })
      .then((responseData) => {
        // setUserIngredients((prevIngredients) => [
        //   ...prevIngredients,
        //   { id: responseData.name, ...ingredient },
        // ]);
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient },
        });
      });
  };

  const removeIngredientHandler = (ingredientId) => {
    dispatchHttp({type: 'SEND'});
    fetch(
      `https://react-tasks-a94be-default-rtdb.europe-west1.firebasedatabase.app/ingredients/${ingredientId}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        dispatchHttp({type: 'RESPONSE'});
        // setUserIngredients((prevIngredients) =>
        //   prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
        // );
        dispatch({
          type: "DELETE",
          id: ingredientId,
        });
      })
      .catch((error) => {
        dispatchHttp({type: 'ERROR', errorMessage: 'Something went wrong'});
      });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR'})
  };

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
}

export default Ingredients;
