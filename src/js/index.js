// Global app controller
import Search from './models/Search';
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
//Global state obj of the app
/* Consists of:
    Search obj
    Current recipe obj
    Shopping list obj
    Liked recipes obj
*/
const state = {};

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

const controlRecipe =async () => {
    // get the recipe ID from the window obj which is clicked by change hash method //**NEW**//
    const ID = window.location.hash.replace('#', '');
    console.log(`The recipe you selected has id: ${ID}`);
    
    if (ID) {
        //prepare UI for changes

        //create new recipe obj
        state.search.recipe = new Recipe(ID);

        try {
            //get recipe data from recipe obj
            await state.search.recipe.getRecipe();
            //call recipe functions
            state.search.recipe.calcTime();
            //render recipe
            console.log(state.search.recipe);
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
