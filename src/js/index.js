// Global app controller
import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from './models/list';
import Likes from './models/Likes'
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

const controlRecipe = async () => {
    // get the recipe ID from the window obj which is clicked by change hash method //**NEW**//
    const ID = window.location.hash.replace('#', '');
    
    
    if (ID) {
        //prepare UI for changes
        console.log(`The recipe you selected has id: ${ID}`);
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
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(ID));
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
//  LIKES MODEL CONTROLLER
//////////////////////////////////////////

const controlLike = () => {
    //if(!state.likes) 
    const currentId = state.recipe.ID;

    // user has not yet liked current recipe
    if(!state.likes.isLiked(currentId)) {
        
        // Add like to the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.publisher,
            state.recipe.img_url
        );
        // Toggle like btn
        likesView.toggleLikeBtn(true);
        // Add like to UI List
        likesView.renderLIkeBtn(newLike);
        //console.log(state.likes);
    } 
    // user has liked the recipe
    else {
        // Remove like from the state
        state.likes.deleteLike(currentId);
        // Toggle like btn
        likesView.toggleLikeBtn(false);
        //Remove like from UI List
        likesView.deleteLike(currentId);
        //console.log(state.likes);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

////////////////////////////////////////////
//  Restore liked recipes on page reload
///////////////////////////////////////////

window.addEventListener('load', () => {
    state.likes = new Likes();
    //  Restore likes from localStorage
    state.likes.readStorage();
    //  Toggle like menu btn
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    //  Render exisiting liked recipes
    if(state.likes.likes) {
        state.likes.likes.forEach(likes => likesView.renderLIkeBtn(likes));
    }
    //state.likes.like.forEach(like => likesView.renderLIkeBtn(like));
});

///////////////////////////////////////////
//  Handling recipe +/- btn clicks
//////////////////////////////////////////

elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        //  Decrease btn is clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        //  Increase btn is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping cart btn is clicked
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller take over
        controlLike();
    }
});
