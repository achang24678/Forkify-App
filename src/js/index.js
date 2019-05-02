import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';



import { getInput, renderResults, clearInput, clearResults } from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

// Global state of the app:
// - Search object
// - Current recipe object
// - Shopping list object
// - Liked recipes
const state = {};
// ------Search Controller--------------------------
const controlSearch = async () => {
    //1. Get query from view
    const query = getInput();


    if (query) {
        //2. New Search object and add to state
        state.search = new Search(query);

        //3. Prepare UI for results
        clearInput();
        clearResults();
        renderLoader(elements.searchRes);
        try {
            //4. Search for recipes
            await state.search.getResults();    //1. wait for the promise return

            //5. Render results on UI
            clearLoader();
            renderResults(state.search.result);  //2. so we can print the result here
        } catch (err) {
            alert('Error search!');
            clearLoader();
        }
        
    }
}
// Search Form submit
elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    controlSearch();
});


// Page Number click
elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline'); // go to the closest element, when button click, no matter its icon or text, all goes to button element
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); //base 10 parse int
        clearResults();
        renderResults(state.search.result, goToPage); // pass in recipe, and page to go
    }
});

 

// -------------Recipe controller---------------------------------------

// const r = new Recipe(36453);
// r.getRecipe();
// console.log(r);

const controlRecipe = async () => {
    // get recipe ID from url
    const id = window.location.hash.replace('#', ''); // replace hash symbol with nothing

    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        //Create new recipe object
        state.recipe = new Recipe(id);
        try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        } catch (err) {
            alert('Error processing recipe!');
        }
    }
}

// when ID of the recipe on url change
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
                //load fire when every page is loaded

//----------ListController----------------------------

const controlList = () => {
    // Create a new list IF there is none yet
    if(!state.list) state.list = new List();
    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

}
// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);
    //Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

//--------------LikeController-------------------------------
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)) {

        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like to UI list
        likesView.renderLike(newLike);
        
    //User has Liked current recipe
    } else{
        //Remove like to the state
        state.likes.deleteLike(currentID);
        //Toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove like to UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


//Hnadling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
        
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        //Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
    
});