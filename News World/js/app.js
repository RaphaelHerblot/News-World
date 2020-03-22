document.addEventListener('DOMContentLoaded', () => {

    const articleURL = 'http://newsapp.dwsapp.io/api/news/nbc-news/null'
    const sourceUrl = 'http://newsapp.dwsapp.io/api/news/sources'
    const articleSection = document.querySelector('#articleList');

    const callAPI = ($fetchURL) => {
        fetch($fetchURL)
        .then(response => {
            return response.json(); 
        })
        .then(jsonData => {
        console.log(jsonData.data.articles);
        console.log(jsonData.data.articles.length);
        forArticle(jsonData.data.articles) ;
        })
        .catch(error=>{
            console.log(error);
        })
    }

    const forArticle = (articlesTab) => {
        articlesTab.forEach(article => {
            articleSection.innerHTML +=  `
                            <article>
                                <h2>${article.title}</h2>
                            </article>
                        `;
        })       
    }

    const getSearchSumbit = () => {
        searchForm.addEventListener('submit', event => {
            // Stop event propagation
            event.preventDefault();

            // Check form data
            searchData.value.length > 0 
            ? fetchFunction(searchData.value) 
            : displayError(searchData, 'Minimum 1 caractère');
        });
    };
    
    // const selectionAPI = ($fetchURL) => {
    //     fetch($fetchURL)
    //     .then(response => {
    //         return response.json(); 
    //     })
    //     .then(jsonData => {
    //     console.log(jsonData.data.articles);
    //     console.log(jsonData.data.articles.length);
    //     forArticle(jsonData.data.articles) ;
    //     })
    //     .catch(error=>{
    //         console.log(error);
    //     })
    // }
    
    // const forArticle = (articlesTab) => {
    //     articlesTab.forEach(article => {
    //         articleSection.innerHTML +=  `
    //                         <article>
    //                             <h2>${article.title}</h2>
    //                         </article>
    //                     `;
    //     })       
    // }

    callAPI(articleURL);
})