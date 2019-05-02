import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }
    async getResults(query) {
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        const key = 'da9b4b838798b506a7700f78df1dde8d';
        try{
            const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            //instead of return, we simply store in this.result, along with the search are encapsulated inside the object
            this.result = res.data.recipes; 
           
        } catch (error) {
            alert(error);
        }
    }
}


