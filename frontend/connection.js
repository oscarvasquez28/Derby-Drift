
export default class Connection{
    
    static #socket = null;

    static getConnection(){
        if(!this.#socket){
            this.#socket = io();
        }
        return this.#socket;
    }

}