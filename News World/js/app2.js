/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    const searchForm = document.querySelector('#searchForm');
    const searchData = document.querySelector('#searchData');
    const sourceList = document.querySelector('#sourceList');
    const articleList = document.querySelector('#articleList');
    const searchLabel = document.querySelector('header form#searchForm span');

    class requestAPI {

        constructor(url, requestType, data = null) {
            this.url = url;
            this.requestType = requestType;
            this.data = data;

            // Définition du header de la requête
            this.fetchOptions = {
                method: requestType,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Ajouter les données dans les requêtes POST et PUT
            if( this.requestType === 'POST' || this.requestType === 'PUT' || this.requestType === 'DELETE'){
                this.fetchOptions.body = JSON.stringify(data);
            };
        }

        
        callAPI(){
            return new Promise( (resolve, reject) => {
                fetch( this.url, this.fetchOptions )
                .then( fetchResponse => {
                    // Vérifier le status de la requête
                    if( fetchResponse.ok ){
                        // Extraire les données JSON de la réponse
                        return fetchResponse.json();
                    }
                    else{
                        return fetchResponse.json()
                        .then( message => reject(message) )
                    };
                })
                .then( jsonData => resolve(jsonData))
                .catch( jsonError => reject(jsonError));
            })
        }
    }

    const getSearchSumbit = () => {
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

    const displayError = (tag, msg) => {
        searchLabel.textContent = msg;
        tag.addEventListener('focus', () => searchLabel.textContent = '');
    };

    function createArticles(articles) {
        searchData.value = '';
        articleList.innerHTML = '';
        const articlesSection = document.querySelector('#articleList')

        articles.forEach(article => {
            articlesSection.innerHTML += `
                <article>
                    <h2>${article.title}</h2>
                    <span>${simplifyDate(article.publishedAt)} - ${article.source.name} - ${article.author}</span>
                    <p>${article.description}</p>
                </article>
        `
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
        const articles = new requestAPI(`https://newsapp.dwsapp.io/api/news/${sourceList}/${searchData}`)
        console.log(articles)
        const articleList = await articles.callAPI()
        createArticles(articleList.data.articles)
    }

    // async function handleArticles() {
    //     const articles = new requestAPI("https://newsapp.dwsapp.io/api/news/nbc-news/null")
    //     console.log("yo")
    //     console.log(articles)
    //     console.log("yo")
    //     const articleList = await articles.callAPI()
    //     createArticles(articleList.data.articles)
    // }

    async function handleSources() {
        const sources = new requestAPI("https://newsapp.dwsapp.io/api/news/sources")
        console.log(sources)
        const sourceList = await sources.callAPI()
        createSources(sourceList.data.sources);
    }

    // handleArticles()
    handleSources()
    getSearchSumbit();
})