import {elements} from './base';

export const clearInput = () => {
    elements.searchInput.value= '';
};

export const clearResults = () => {
    elements.searchResList.innerHTML = ''; 
    elements.searchResPages.innerHTML = '';
};

export const highlight = id => {
    const resArr = Array.from(document.querySelectorAll('.results__link'));
    resArr.forEach(el => {
        el.classList.remove('results__link--active');
    })
    document.querySelector(`a[href="#${id}"]`).classList.add('results__link--active');
}
// pasta with tomato and spinach 

const trimRecipeTitle = (title, limit = 17) => {
    if(title.length>limit) {
        const newTitle =[];
        title.split(' ').reduce((acc, cur) => {
            if(acc+cur.length <= limit) {
                newTitle.push(cur);                  
            }
            return acc + cur.length;
        }, 0);
        return `${newTitle.join(' ')}...`;
    } 
    return title;
};

const trimID = uri => {
    let resID = uri.slice(51);
    return resID;
};

const renderRecipe = recipe => {
    const markup = `
                <li>
                    <a class="results__link" href="#${trimID(recipe.recipe.uri)}">
                        <figure class="results__fig">
                            <img src="${recipe.recipe.image}" alt="Img_alt">
                        </figure>
                        <div class="results__data">
                            <h4 class="results__name">${trimRecipeTitle(recipe.recipe.label)}</h4>
                            <p class="results__author">${recipe.recipe.source}</p>
                        </div>
                    </a>
                </li>
    `;
    elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

const createButton = (page, type) => `

                <button class="btn-inline results__btn--${type}" data-goto="${type === 'prev' ? page - 1 : page + 1}">
                    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
                    </svg>
                </button>
                
                `;
            

const renderButtons = (page, numRes, resPerPage) => {
    const pages = Math.ceil(numRes/resPerPage);
    let button;
    if(page === 1 && pages > 1) {
        //render 1 button to go to the next page
        button = createButton(page, 'next');
    } else if(page < pages) {
        //render 2 btns for next and prev page
        button = `${createButton(page, 'prev')}
                  ${createButton(page, 'next')}  
                `;
    } else if(page === pages && pages > 1) {
        // render 1 btn to go to the prev page
        button = createButton(page, 'prev');
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const getInput = () => elements.searchInput.value; 

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    // render results of current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    recipes.slice(start, end).forEach(renderRecipe);

    //render pagination buttons
    renderButtons(page, recipes.length, resPerPage); 
};