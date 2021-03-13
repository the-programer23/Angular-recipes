import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/Operators';
import { Store } from '@ngrx/store';

import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from '../recipes/recipe.model';
import * as RecipeActions from '../recipes/store/recipe.actions'
import * as fromApp from '../store/app.reducer'

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(
    private http: HttpClient,
    private recipeService: RecipeService,
   private store: Store<fromApp.AppState>
  ) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put('https://ng-recetas.firebaseio.com/recetas.json', recipes)
      .subscribe((response) => {
      });
  }

  fetchRecipes() {
    return this.http
      .get<Recipe[]>('https://ng-recetas.firebaseio.com/recetas.json')
      .pipe(
        map((recipes) => {
          return recipes.map((recipe) => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : [],
            };
          });
        }),
        tap((recipes) => {
          this.store.dispatch(new RecipeActions.SetRecipes(recipes))
          //this.recipeService.setRecipes(recipes);
        })
      );
  }
}
