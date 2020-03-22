document.addEventListener('DOMContentLoaded', () => {
    const themoviedbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=';

    const fetchRequest = () => {
        fetch('http://newsapp.dwsapp.io/api/news/nbc-news/null')
        .then(response => {
            return response.json(); 
        })
            .then(jsonData => {
            console.log(jsonData);
        })
        .catch(error=>{
            console.log(error);
        })
    }

    fetchRequest();
})