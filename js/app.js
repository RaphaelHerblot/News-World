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
    const test = document.querySelector('.test');
    const listFavorite = document.querySelector('#listFavorite')

    const loginForm = document.querySelector('#loginForm');
    const emailLogin = document.querySelector('#emailLogin');
    const passwordLogin = document.querySelector('#passwordLogin');
    const hiStranger = document.querySelector('#hiStranger')
    let emailVar = null;
    let passwordVar = null;
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
                buttonDisconnect.style.display = "initial";
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
                new requestAPI(`${apiUrl}/register`, 'POST', { 
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
        listFavorite.innerHTML = '';
        for(let fav of favData.data.bookmark){
            console.log(fav._id);
            listFavorite.innerHTML += `<span>${fav.name}  <button class="buttonDeleteFav" news-id="${fav._id}" type="submit">X</button> </span>`;
        }
        // deleteFavorite(document.querySelectorAll('.buttonDeleteFav'));      
    }

    const newFavorite = (favoriteData) => {
        const buttonFavorite = document.querySelectorAll('.buttonFav');
        console.log(favoriteData);

        for(let button of buttonFavorite){
            button.addEventListener('click', () => {
                let i = button.getAttribute('ref-id')
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
                    })
                    .catch( error => {
                        displayMsg(error)
                    })
                    checkToken('favorite')
                } catch {
                    displayMsg('Error you fucked up')
                }
            })            
        }
    }

    // const deleteFavorite = favoriteData => {
    //     for( let fav of favoriteData ){
    //         console.log(fav.getAttribute('news-id'))
    //         console.log(localStorage.getItem(localSt))
    //         console.log(apiURL+'/bookmark/'+fav.getAttribute('news-id'))
    //         fav.addEventListener('click', () => {
    //             new requestAPI( `${apiURL}/bookmark/${fav.getAttribute('news-id')}`, 'DELETE', {
    //                 token: localStorage.getItem(localSt)
    //             })
    //             .callAPI()
    //             .then( fetchData => checkToken('favorite'))
    //             .catch( fetchError => {
    //                 console.log(fetchError)
    //             })
    //         })
    //     }
    // }

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
        articles.forEach(article => {
            articlesSection.innerHTML += `
                <article>
                    <h2>${article.title}</h2>
                    <span>${simplifyDate(article.publishedAt)} - ${article.source.name}  <button class="buttonFav" ref-id="${count}" type="submit">Fav</button> - ${article.author}</span>
                    <p>${article.description}</p>
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

    // async function searchArticles(sourceList, searchData) {
    //     const articles = new requestAPI(`${apiURL}/news/${sourceList}/${searchData}`, 'POST', {
    //         "news_api_token": "4ac860c120bb494a8835bfa8f6ea3ca8"
    //     })
    //     console.log(articles)
    //     const articleList = await articles.callAPI()
    //     createArticles(articleList.data.articles)
    // }

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

    // async function handleArticles() {
    //     const articles = new requestAPI(`${apiURL}/news/nbc-news/null`, 'POST', {
    //         "news_api_token": "4ac860c120bb494a8835bfa8f6ea3ca8"
    //     })
    //     console.log("yo")
    //     console.log(articles)
    //     console.log("yo")
    //     const articleList = await articles.callAPI()
    //     createArticles(articleList.data.articles)
    // }

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

    // handleArticles()
    searchSources();
    logOut();
    
})