import axios from 'axios';
import {app_id, api_key} from '../config';
export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getRecipe() {
        const app_id = '4d10d774';
        const api_key = '8fa2415f848acf55a3fdb459f8a2d3b7';
        try {
            let response = await axios(`https://api.edamam.com/search?q=${this.query}&app_id=${app_id}&app_key=${api_key}&from=${0}&to=${30}`);
            this.result = response.data.hits;
            //console.log(this.result);
        } catch(error) {
            console.log(error);
        }
    }

}
