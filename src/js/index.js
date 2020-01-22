// Global app controller
import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from './models/list';
//Global state obj of the app
/* Consists of:
    Search obj
    Current recipe obj
    Shopping list obj
    Liked recipes obj
*/
const state = {};
window.state = state;
/////////////////////////////////////
// SEARCH CONTROLLER
////////////////////////////////////

const controlSearch = async () => {
    //1/ get the query from the view
    let query = searchView.getInput(); //TODO
    console.log(`Fetching results for the search of: ${query}`);
    //2/ new search obj and add it to state
    state.search = new Search(query);
    //3/ update UI
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
        //4/ search for recipes
        await state.search.getRecipe();
        //4.1 clear loader when results are ready to render
        clearLoader();
        //5/ render results on UI
        //console.log(state.search.result);
        searchView.renderResults(state.search.result);
    } catch(error) {
        console.log('SOmething went wring with the search recipe!')
        console.log(error);
        clearLoader();
    }
}


elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
            const goToPage = parseInt(btn.dataset.goto, 10);
            searchView.clearResults();
            searchView.renderResults(state.search.result, goToPage);
        } 
});

////////////////////////////////////////////
// RECIPE CONTROLLER
///////////////////////////////////////////

//////////////////////////////
// FOR EXAMPLE(to select recipe ID and constructing it with ID )
/////////////////////////////
// const recipeId = '1b6dfeaf0988f96b187c7c9bb69a14fa';
// const r = new Recipe(`${recipeId}`);
// r.getRecipe();
// //const getRecipeID = state.search.result[0];
// //console.log(r);

const controlRecipe = async () => {
    // get the recipe ID from the window obj which is clicked by change hash method //**NEW**//
    const ID = window.location.hash.replace('#', '');
    console.log(`The recipe you selected has id: ${ID}`);
    
    if (ID) {
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        // Highlight selected recipe
        if(state.search) searchView.highlight(ID);
        //create new recipe obj
        state.recipe = new Recipe(ID);

        try {
            //get recipe data from recipe obj and parse ingredients
            await state.recipe.getRecipe();
            //console.log(state.search.recipe.ingredientLines);
            state.recipe.parseIngredients();
            //call recipe functions
            state.recipe.calcTime();
            //render recipe
            //console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch(error) {
            alert('Alert Processing the Recipe!');
            console.log(error);
        }
    }
};



//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
// compressing above two lines of code into 1 simple and logical line of code
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



///////////////////////////////////////////
//  LIST MODEL CONTROLLER
//////////////////////////////////////////


const controlList= () => {
    //  create a list if it is not yet
    if(!state.list) state.list = new List();

    //  Add each ingredient ot the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//  Handling up/dwn btn for shopping list
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //  Handle delete btn event
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //  Delete from state
        state.list.deleteItem(id);
        //  Dlt from UI
        listView.deleteItem(id);
    } else if(e.target.matches('.shopping__count-value')) {
        //  Handle count up/dwn arrows on shopping panel
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});

///////////////////////////////////////////
//  Handling recipe +/- btn clicks
//////////////////////////////////////////

elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        //  Decrease btn is clicked
        state.recipe.updateServings('dec');
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        //  Increase btn is clicked
        state.recipe.updateServings('inc');
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add to shopping cart btn is clicked
        controlList();
    }
});
