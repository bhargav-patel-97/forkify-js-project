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

        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds', 'grams', 'gram'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound', 'gms', 'gms'];
        const units = [...unitsShort, 'kg', 'g', 'lbs.']; 

        const newIngredients = this.ingredients.map(el => {
            //  Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            //  Remove any parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, "  ");
            //  Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(cur => unitsShort.includes(cur));
            
            let objIng;  
            
            if(unitIndex > -1) {
                // there is a unit
                const arrCount = arrIng.slice(0, unitIndex);    // for ex: 4 1/2 cups
                let count;

                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')                   
                };

            } else if (parseInt(arrIng[0], 10)) {
                // there doesn't exist unit but 1st element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if(unitIndex === -1) {
                // there is no unit and no number at 1st pos.
                objIng = {
                    count: 1,
                    unit:  '',
                    ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //  update servings on btn_clk
        const newServings = type === 'dec' ? this.servings -1 : this.servings + 1;
        
        //  update ingredients on btn_clk
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}