import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredients.model';
import * as ShoppingListActions from '../shopping-list/store/shopping-list.actions'
import * as fromApp from '../store/app.reducer'

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  // private recipes: Recipe[] = [
  //   new Recipe(
  //     'Pizza Vegetariana',
  //     'Deliciosa pizza con vegetales',
  //     'https://www.tasteofhome.com/wp-content/uploads/2018/02/Grilled-Veggie-Pizza_EXPS_LSBZ18_48960_D01_18_6b-696x696.jpg',
  //     [new Ingredient('Queso', 2), new Ingredient('zanahoria', 1)]
  //   ),
  //   new Recipe(
  //     'Hamburguesa Antioqueña',
  //     'Deliciosa hamburguesa con carne de res, queso y papas',
  //     'https://scontent.fbga2-1.fna.fbcdn.net/v/t31.0-8/s960x960/20643434_830144307158912_2382738779120330588_o.jpg?_nc_cat=111&_nc_sid=85a577&_nc_ohc=e1pHPgL6zUsAX90vDYx&_nc_ht=scontent.fbga2-1.fna&_nc_tp=7&oh=a5adc914368c5056260b9e9ec0c97320&oe=5EDF0A4A',
  //     [new Ingredient('Carne de res', 1), new Ingredient('Pollo desmechado', 1)]
  //   ),
  // ];

  private recipes: Recipe[] = [];

  constructor( private store: Store<fromApp.AppState>) {
    
  }

  setRecipes(recipes: Recipe[]) {

    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

  //This creates a copy of the recipes array so it does not get modified.
  getRecipes() {
    
    return this.recipes.slice();
  }
  getRecipe(index: number) {
    return this.recipes[index];
  }

  addIngredientsToTheShoppingList(ingredients: Ingredient[]) {
    this.store.dispatch(new ShoppingListActions.AddIngredients(ingredients))
  }

  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }
}
