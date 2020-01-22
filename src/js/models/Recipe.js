import axios from 'axios';
import {app_id, api_key, hard_url} from '../config';

export default class Recipe {
    constructor(ID) {
        this.ID = ID;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://api.edamam.com/search?r=${hard_url}${this.ID}&app_id=${app_id}&app_key=${api_key}`);
            //console.log(res.data[0]);
            const current = res.data[0];
            this.title = current.label;
            this.publisher = current.source;
            this.img_url = current.image;
            this.url = current.url;
            this.ingredients = current.ingredientLines;
            this.servings = current.yield;
        } catch(error) {
            console.log(error);
        }
    };

    calcTime() {
        // Assuming that we need 15 minutes for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    };

    parseIngredients() {

        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound']; 

        const newIngredients = this.ingredients.map(el => {
            //  Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            //  Remove any parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, "");
            //  Parse ingredients into count, unit and ingredient
        });
        this.ingredients = newIngredients;
    }
}