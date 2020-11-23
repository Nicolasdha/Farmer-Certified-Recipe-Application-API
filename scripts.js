// Variable Bindings
const mealsEl = document.getElementById('meals');
const favoriteContainer  = document.getElementById('fav-meals');
let searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup')
const popupCloseBtn = document.getElementById('close-popup')
const mealInfoEl = document.getElementById('meal-info')
const logo =  document.getElementById('logo')
const area = document.querySelectorAll(".area")
const category = document.querySelectorAll(".category")
const burgerIcon = document.querySelector(".navbar-toggler")
const navbar = document.querySelector(".navbar")
let youtubeText;
const proxy = "https://fierce-stream-08080.herokuapp.com/"
const form = document.querySelector(".form-inline")


//Initially load 12 meals to page
for(let i=0; i < 12; i++){
    getRandomMeal();
}
//Fill in Favorite Meals - or add 8 stock ones
fetchFavMeals();

// Function to retrive random meals from API
async function getRandomMeal(){
    let randomApi = `${proxy}https://www.themealdb.com/api/json/v1/1/random.php`;
    const response = await fetch(randomApi);
    const data = await response.json();
    const randomMeal = data.meals[0];
    addMeal(randomMeal, true);
}

// Function to retrive meals by ID from API
async function getMealById(id){
    let idApi = `${proxy}https://www.themealdb.com/api/json/v1/1/lookup.php?i=`+id;
    const response = await fetch(idApi)
    const data = await response.json();
    const meal = data.meals[0];
    return meal;
}

// Function to retrive meals by searching term/name
async function getmealsBySearch(term){
    let termApi = `${proxy}https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`;
    const response = await fetch(termApi);
    const data = await response.json();
    const meals = data.meals;
    return meals;
}

// Function to add each meal and each favorite icon to DOM
function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
    const heart = document.createElement('button');
    heart.classList.add('fav-btn')

    heart.innerHTML = `<i class="fas fa-heart"></i>`
    meal.innerHTML= `
        <div class="meal-header">
       ${random ? `  <span class="random">Random Recipe</span>` : ``}
            <img class ="imageId" src=${mealData.strMealThumb} alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
        </div>`;

    // Event listener to add/remove meal to favorites when heart icon is clicked and reload page
    heart.addEventListener("click", () => {
        if(heart.classList.contains('active')){
            removeMealFromLocalStorage(mealData.idMeal);
            heart.classList.remove('active');
        } else {
            addMealToLocalStorage(mealData.idMeal);
            heart.classList.add('active');
        }
        fetchFavMeals();
        }, false);

    // Event listener to show meal information
    meal.addEventListener('click', () => {
        showMealInfo(mealData);
        }, true);

    mealsEl.appendChild(meal);
    meal.appendChild(heart);
}

// Function to add meal to local browser storage
function addMealToLocalStorage(mealId){
    const mealIds = getMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

// Function to remove meal to local browser storage
function removeMealFromLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id=> id !== mealId)));
}

// Function to get all favorite meals from local browser storage or add stock favorite meals if none
function getMealsFromLocalStorage(mealId){
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? ["52852","52838","52921","53019","52773","52910","52904"] : mealIds;
}

// Function to gather all favorite meals
async function fetchFavMeals(){

   // To clean the container
   favoriteContainer.innerHTML = '';

    const mealIds = getMealsFromLocalStorage();
    for(let i=0; i<mealIds.length;i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealToFav(meal);
    }
}

// Function to append each favorite meal to favorite meal container
function addMealToFav(mealData) {
    const favMeal = document.createElement('div');
    favMeal.classList.add("img-container");
    const xbox = document.createElement('button');
    xbox.classList.add("clr-button");
    xbox.innerHTML = ` <i class="fas fa-window-close clear"></i>`
    let shortMeal = mealData.strMeal;
    if(shortMeal.length > 30){
         shortMeal= shortMeal.substring(0,29) + '...'
    }else{
        shortMeal = shortMeal
    }
   
    favMeal.innerHTML= `
            <li>
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                    <span>${shortMeal}</span>
            </li>`

            const btn = xbox.querySelector('.clear');

            // Event listener to remove meal from favorite meals
            btn.addEventListener("click", () => {
                removeMealFromLocalStorage(mealData.idMeal);
                fetchFavMeals();
            }, false);

            // Event listener to show favorite meal info
            favMeal.addEventListener('click', () => {
                showMealInfo(mealData);
            }, false);
    
        favoriteContainer.appendChild(favMeal);
        favoriteContainer.appendChild(xbox);
}

// Function to show meal information
function showMealInfo(mealData) {
    // To clean up container
    mealInfoEl.innerHTML='';
    const mealEl = document.createElement('div');
    const youtubeLink = mealData.strYoutube.replace(/(watch\?v=)/, "embed/");
    const ingredients = [];

    // To get ingredients and measurements
    for(let i=0; i<20; i++) {
        if(mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`)
        } 
    }

    // To link and initiate the provided YouTube URL from API 
    if(mealData.strYoutube){
        youtubeText = `<h5><span class="">Watch this recipe come to life on YouTube:</span><iframe class="video" id="video" width= '515' height='400' src="${youtubeLink}?version=3&enablejsapi=1&origin=http://youtube.com" frameborder="0" allowfullscreen></iframe></h5>`
    } else {
        youtubeText = ''
    }

    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
        ${youtubeText}
        <p>${mealData.strInstructions}</p>
        <h3> Ingredients </h3
    <ul>   
       ${ingredients.map(ing => 
           `<li>${ing}</li>`).join('')
        }
    </ul>`

    mealInfoEl.appendChild(mealEl);

    // Shows hidden popup full of meal info
    mealPopup.classList.remove('hidden');
}

// Function to search API with the user input
async function searchMeals(){
    const search = searchTerm.value;
    const meals =  await getmealsBySearch(search);
    const mealsCategory = await getMealsCategory(search);
    const mealsArea = await getMealsArea(search)
    const mealsIngredient = await getMealsIngredient(search)
    mealsEl.innerHTML = '';
        if(meals) {
            meals.forEach((meal) => {
                getMealBySearch(meal.idMeal);
                });
            }
        if(mealsCategory){
            mealsCategory.forEach((mealCat) =>{
                getMealBySearch(mealCat.idMeal);
                })
            }
        if(mealsArea){
            mealsArea.forEach((mealArea) =>{
                getMealBySearch(mealArea.idMeal);
                })
            }
        if (mealsIngredient) {
            mealsIngredient.forEach((mealIngredient) => {
                getMealBySearch(mealIngredient.idMeal);
                })
            }
}

// Function to display all meals from user input since API only returns specific meal ID when searched individually (not all meal information)
async function getMealBySearch(id){
    let idApi = `${proxy}https://www.themealdb.com/api/json/v1/1/lookup.php?i=`+id;
    const response = await fetch(idApi)
    const data = await response.json();
    const meal = data.meals[0];
    addMeal(meal);
}

// Function to search for user input by category
async function getMealsCategory(search){

    let categoryApi = `${proxy}https://www.themealdb.com/api/json/v1/1/filter.php?c=${search}`

    const response = await fetch(categoryApi);
    const data = await response.json();
    const meals = data.meals;
    return meals
}

// Function to search for user input by locale
async function getMealsArea(search){
    const areaApi = `${proxy}https://www.themealdb.com/api/json/v1/1/filter.php?a=${search}`
    const response = await fetch(areaApi);
    const data = await response.json();
    const meals = data.meals;
    return meals
}

// Function to search for user input by ingredient
async function getMealsIngredient(search){
    const ingredientApi = `${proxy}https://www.themealdb.com/api/json/v1/1/filter.php?i=${search}`
    const response = await fetch(ingredientApi);
    const data = await response.json();
    const meals = data.meals;
    return meals
}

// Function to stop video playback 
function stopVideo(){
    let link = document.querySelector('#video');
    link.src = '';
}

// Function to toggle logo and navbar background menu on/off with an interval between
function toggleLogoNavbar(){
    logo.classList.toggle("hidden")
    navbar.classList.toggle("bg-light")
    burgerIcon.disabled = false;
    setTimeout(function(){
        burgerIcon.disabled = true;
        setTimeout(function(){
            burgerIcon.disabled = false;
        },1000);
    },0);
}

// Closes/hides meal information container
popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
    stopVideo();
})

// Initializes Esc key for close/hide meal information container
document.addEventListener('keydown', function(event) {
    const key = event.key; // const {key} = event; in ES6+
    if (key === "Escape") {
        mealPopup.classList.add('hidden');
        stopVideo();
    }
});

// Reloads page on logo click
logo.addEventListener('click', () => {
    location.reload()
})

// Event listener to search API for user input
searchBtn.addEventListener('click', searchMeals, false)

// Initializes Enter key to search API for user input
document.addEventListener('keydown', async (event) => {
    const key = event.key
    if (key === 'Enter') {
        searchMeals
    }
})

// Event listener to search API for every locale in navbar
area.forEach(element=> {
    element.addEventListener('click', async (e)=> {
        const eventTarget = e.target.textContent
        const areaMeal = await getMealsArea(eventTarget)
        mealsEl.innerHTML = '';

        areaMeal.forEach((meal) => {
            getMealBySearch(meal.idMeal)
            })
    })
})

// Event listener to search API for every category in navbar
category.forEach(element=> {
    element.addEventListener('click', async (e)=> {
        const eventTarget = e.target.textContent
        const categoryMeal = await getMealsCategory(eventTarget)
        mealsEl.innerHTML = '';

        categoryMeal.forEach((meal) => {
            getMealBySearch(meal.idMeal)
            })
    })
})

// Event listener to prevent form submitting
form.addEventListener('submit', (e) => {
    e.preventDefault()
})

// Event listener to toggle logo on/off and navbar background on burger menu click
document.addEventListener('DOMContentLoaded', () => {
    burgerIcon.addEventListener('click', toggleLogoNavbar, false)})