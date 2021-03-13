import { Ingredient } from '../../shared/ingredients.model';
import * as ShopingListActions from './shopping-list.actions'

export interface State {
    ingredients: Ingredient[],
    editedIngredient: Ingredient,
    editedIngredientIndex: number
}


const initialState: State = {
    ingredients : [
        new Ingredient('Pera', 5),
        new Ingredient('Tomates', 10),
      ],
    editedIngredient: null,
    editedIngredientIndex: -1  
}

export function shoppingListReducer(state: State = initialState, action: ShopingListActions.ShoppingListActions) {
    switch (action.type){
        case ShopingListActions.ADD_INGREDIENT : 
            return {
                ...state,
                ingredients: [...state.ingredients, action.payload]
            }

        case ShopingListActions.ADD_INGREDIENTS : 
            return {
                ...state,
                ingredients: [...state.ingredients, ...action.payload]
            }
        case ShopingListActions.UPDATE_INGREDIENT : 
            const ingredient = state.ingredients[state.editedIngredientIndex];
            const updatedIngredient = {
                ...ingredient,
                ...action.payload
            };
            const updatedIngredients = [...state.ingredients];
            updatedIngredients[state.editedIngredientIndex] = updatedIngredient;

            return {
                ...state,
                ingredients: updatedIngredients,
                editedIngredientIndex: -1,
                editedIngredient: null
            }
        case ShopingListActions.DELETE_INGREDIENT : 
            return {
                ...state,
                ingredients: state.ingredients.filter((ig, igIndex) => {
                    return igIndex !== state.editedIngredientIndex
                })
            } 
        case ShopingListActions.START_EDIT : 
            return {
                ...state,
                editedIngredientIndex : action.payload,
                editedIngredient : {...state.ingredients[action.payload]}
            }
        case ShopingListActions.STOP_EDIT : 
            return {
                ...state,
                editedIngredient: null,
                editedIngredientIndex: -1
            }           
        default: 
        return state;
    }
}