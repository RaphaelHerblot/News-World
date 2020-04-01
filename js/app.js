/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    const apiURL = "https://newsapp.dwsapp.io/api";

    const registerForm = document.querySelector('#registerForm');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    const firstName = document.querySelector('#firstName');
    const lastName = document.querySelector('#lastName');

    const buttonDisconnect = document.querySelector('#buttonDisconnect');
    const favSources = document.querySelector('#favSources');
    const listFavorite = document.querySelector('#listFavorite')
    const bookmarkButton = document.querySelector('#addToBookmark');
    const alreadyBookmarked = document.querySelector('#alreadyInBookmark');
    const sourceBookmarked = document.querySelector('.sourceBookmarked');

    const loginForm = document.querySelector('#loginForm');
    const emailLogin = document.querySelector('#emailLogin');
    const passwordLogin = document.querySelector('#passwordLogin');
    const hiStranger = document.querySelector('#hiStranger')
    let emailVar = null;
    let passwordVar = null;
    var idCheck = 3;
    const localSt = 'user';

    const searchForm = document.querySelector('#searchForm');
    const searchData = document.querySelector('#searchData');
    const sourceList = document.querySelector('#sourceList');
    const articleList = document.querySelector('#articleList');
    const searchLabel = document.querySelector('header form#searchForm span');

    const checkToken = (step = 'favorite') => {
        new requestAPI(
            `${apiURL}/me`,
            'POST', {
                token: localStorage.getItem(localSt)
            }
        )
        .callAPI()
        .then( fetchData => {
            // Check step
            if( step === 'favorite' ){ // Add favorite
                // Display favorites
                displayFav(fetchData)
            }
            else if( step === 'checkuser' ){ // First check
                console.log(fetchData)
                // Hide register and loggin form
                register.classList.add('hidden');
                login.classList.add('hidden');
                search.style.display = "flex";
                buttonDisconnect.style.display = "initial";
                favSources.style.display = "initial";
                hiStranger.innerHTML = `Hi ${fetchData.data.user.firstname} !`;
                // Display nav
                // displayNav(fetchData.data.user.pseudo);

                // Display favorites
                displayFav(fetchData)

                // Get form submit event
                getHomeSubmit();
            }
        })
        .catch( fetchError => {
            console.log(fetchError)
        })
    }

    const checkFavorite = (favoriteID) => {
        new requestAPI(
            `${apiURL}/me`,
            'POST', {
                token: localStorage.getItem(localSt)
            }
        )
        .callAPI()
        .then( fetchData => {
            idCheck = 0;
            for( let fav of fetchData.data.bookmark ){
               if(fav.id == favoriteID.id) {
                idCheck = 1;
               }
            }
            displayFav(fetchData)
            alreadyFavorite(idCheck, favoriteID.name)
        })
        .catch( fetchError => {
            console.log(fetchError)
        })
    }

    const idCheckSetter = (id) => {
         idCheck = id;
    }

    const getHomeSubmit = () => {

        registerForm.addEventListener('submit', event => {
            // Stop event propagation
            event.preventDefault();

            // Check form data
            let formError = 0;

            if(email.value.length < 5) { formError++ };
            if(password.value.length < 3) { formError++ };
            if(firstName.value.length < 3) { formError++ };
            if(lastName.value.length < 3) { formError++ };

            if(formError === 0){
                new requestAPI(`${apiURL}/register`, 'POST', { 
                    email: email.value,
                    password: password.value,
                    firstname: firstName.value,
                    lastname: lastName.value
                })
                .callAPI()
                .then( fetchData => {
                    console.log(fetchData)
                })
                .catch( fetchError => {
                    displayError(fetchError.message, "Erreur")
                });
            }
            else{ displayError('Check mandatory fields') }
        });

        loginForm.addEventListener('submit', (event) => {
            isLogin = 0;
            event.preventDefault();
            emailVar = emailLogin.value ;
            passwordVar = passwordLogin.value ;
    
            if (emailVar !== null && passwordVar !== null) {
                new requestAPI(apiURL+'/login', 'POST', {
                    email: emailVar,
                    password: passwordVar
                })
                .callAPI()
                .then( fetchData => {
                    localStorage.setItem(localSt, fetchData.data.token);
                    displayMsg(fetchData.message);
                    checkToken('checkuser');
                })
                .catch(error=>{
                    displayMsg(error.message)
                })   
            } else {
                console.log('erreur à la connection')
            }
            loginForm.reset();
        })

        searchForm.addEventListener('submit', event => {
            // Stop event propagation
            event.preventDefault();
            
            let optionSelected = sourceList.options[sourceList.selectedIndex].text;
            let optionRemastered = optionSelected.replace(" ", "-");
            let searchText = searchData.value;
            // Check form data
            console.log(searchText)
            searchData.value.length > 0 
            ? searchArticles(optionRemastered, searchText)
            : displayError(searchData, 'Minimum 1 caractère');
        });
    };

    const displayMsg = (msg) => {
        console.log(msg) ;
    }

    const displayError = (tag, msg) => {
        searchLabel.textContent = msg;
        tag.addEventListener('focus', () => searchLabel.textContent = '');
    };

    const displayFav = (favData) => {
        favSources.innerHTML = '';
        listFavorite.innerHTML = '';
        console.log(localStorage)  

        for(let fav of favData.data.bookmark){
            favSources.innerHTML = "Your favorites sources of news"
            listFavorite.innerHTML += `<span>${fav.name}  <button class="buttonDeleteFav btn btn-danger" news-id="${fav._id}" type="submit">X</button> </span>`;
        }
        deleteFavorite(document.querySelectorAll('.buttonDeleteFav'));      
    }

    const newFavorite = (favoriteData) => {
        const buttonFavorite = document.querySelectorAll('.buttonFav');
        for(let button of buttonFavorite){
            let i = button.getAttribute('ref-id')
            checkFavorite(favoriteData.articles[i].source);
            button.addEventListener('click', () => {
                if(idCheck == 0) {
                    try {
                        new requestAPI(`${apiURL}/bookmark`, 'POST', {
                                id: favoriteData.articles[i].source.id,
                                name: favoriteData.articles[i].source.name,
                                description: favoriteData.articles[i].description,
                                url: favoriteData.articles[i].url,
                                category: 'general',
                                language: 'fr',
                                country: 'FR',
                                token: localStorage.getItem(localSt)
                            }
                        )
                        .callAPI()
                        .then( data => {
                            displayMsg(data.message)
                            checkToken('favorite')
                            checkFavorite(favoriteData.articles[i].source);
                            alreadyFavorite(1, favoriteData.articles[i].source.name)
                            console.log("LOLILOLILOLILOLI")
                        })
                        .catch( error => {
                            displayMsg(error)
                        })
                        
                    } catch {
                        displayMsg('Error you fucked up')
                    }
                }
                else {
                    console.log("Already in your bookmark")
                }
            })            
        }
    }

    const deleteFavorite = favoriteData => {
        for( let fav of favoriteData ){
            fav.addEventListener('click', () => {
                new requestAPI(`${apiURL}/bookmark/${fav.getAttribute('news-id')}`, 'DELETE', {
                    token: localStorage.getItem(localSt)
                })
                .callAPI()
                .then( fetchData =>  {
                    idCheckSetter(0);
                    checkToken('favorite')
                    console.log(fetchData.data.name)
                    alreadyFavorite(idCheck, fetchData.data.name)
                })
                .catch( fetchError => {
                    console.log(fetchError)
                })
            })
        } 
    }

    const alreadyFavorite = (idCheck, sourceName) => {
        console.log(sourceBookmarked)
        console.log("ATTEND LA")
        console.log(idCheck)
        console.log(sourceName)
        if(idCheck == 0) {
            bookmarkButton.style.display = "flex";
            alreadyBookmarked.style.display = "none";
        }
        else {
            bookmarkButton.style.display = "none";
            alreadyBookmarked.style.display = "flex";
            // alreadyBookmarked
            sourceBookmarked.innerHTML = `${sourceName} `
        }
    }

    const logOut = () => {
        buttonDisconnect.addEventListener('click', () => {
            new requestAPI(`${apiURL}/logout`, 'GET',)
            .callAPI()
            .then(fetchData=>{
                localStorage.removeItem(localSt)
                buttonDisconnect.style.display = "initial";
                displayMsg(fetchData.message) 
                document.location.href = './index.html'
            })
            .catch(error=>{
                displayMsg(error)
            })              
        })
    }

    function createArticles(articles) {
        searchData.value = '';
        articleList.innerHTML = '';
        const articlesSection = document.querySelector('#articleList')
        let count = 0;
        bookmarkButton.innerHTML = `<button class="buttonFav btn btn-info btn-sm" ref-id="${count}" type="submit">Add <b>${articles[count].source.name}</b> to your bookmark</button></span>`
        articles.forEach(article => {
            articlesSection.innerHTML += `
                <article>
                    <img src="${article.urlToImage}">
                    <h2>${article.title}</h2>
                    <div class="content">
                        <span>${simplifyDate(article.publishedAt)} - ${article.source.name}
                        <p>${article.description}</p>
                        <span>${article.author}</span>
                    </div>
                </article>`
            count++;
            })
    }

    function createSources(sources) {
        const sourcesSelect = document.querySelector("#sourceList")

        sources.forEach(source => {
            sourcesSelect.innerHTML += `
            <option value="dab">${source.name}</option> ;
        `
        })
    }

    function simplifyDate(date) {
        let newDate = date.split("-")
        let day = newDate[2].split("T")[0]
        return `${day}/${newDate[1]}/${newDate[0]}`
    }

    async function searchArticles(sourceList, searchData) {
        const articles = new requestAPI(`${apiURL}/news/${sourceList}/${searchData}`, 'POST', {
            "news_api_token": "4ac860c120bb494a8835bfa8f6ea3ca8"
        })
        .callAPI()
        .then(articleList=>{
            console.log(articleList)
            createArticles(articleList.data.articles);
            newFavorite(articleList.data)
        })
        .catch(error=>{
            displayMsg(error)
        })
    }

    async function searchSources() {
        const sources = new requestAPI(`${apiURL}/news/sources`, 'POST', {
            "news_api_token": "4ac860c120bb494a8835bfa8f6ea3ca8"
        })
        console.log(sources)
        const sourceList = await sources.callAPI()
        createSources(sourceList.data.sources);
    }

    if( localStorage.getItem(localSt) !== null ){
        console.log(localStorage.getItem(localSt))
        // Get user onnfoprmations
        checkToken('checkuser');
    }

    else{
        getHomeSubmit();
    };

    searchSources();
    logOut();
    
})