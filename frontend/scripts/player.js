import * as THREE from 'three'
import ObjModel from "./model.js";

export default class Player{

    name = "Incógnito";
    color = 0x000000;
    id = -1;
    #position = {x: 0, y: 0, z:0};
    #rotation = {x: 0, y: 0, z:0};
    mesh = null;

    constructor(scene){
        this.scene = scene;
    }

    initPlayerFromJSON(data){

        try {

            if(data.name)
                this.name = data.name;

            if(data.color)
                this.color = data.color;

            if(data.id)
                this.id = data.id;
            else
                throw "Cannot initialize player with an undefined id";

            if(data.position && typeof data.position === 'object')
                this.#position = data.position;
            if(data.rotation && typeof data.rotation === 'object')
                this.#rotation = data.rotation;

            // Si se proporciona un modelo será utilizado, de lo contrario se mostrará una caja por default
            let mesh;
            if(!data.mesh){
                const geometry = new THREE.BoxGeometry();
                const material = new THREE.MeshStandardMaterial({ color: this.color });
                mesh = new THREE.Mesh(geometry, material);
            }else{
                mesh = data.mesh;
            }

            mesh.castShadow = true;
            mesh.recieveShadow = true;

            this.mesh = mesh;
            this.mesh.position.set(this.#position.x, this.#position.y, this.#position.z);
            this.mesh.rotation.set(this.#rotation.x, this.#rotation.y, this.#rotation.z);

            this.scene.add(this.mesh);
            return true;

        } catch (error) {
            console.log("Something went wrong when initializing player:\n" + this.name + " ID:" + this.id + "\n" + error);
            return false;
        }

    }

    initPlayerAsCubeMesh(){

        try {

            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshStandardMaterial({ color: this.color });
            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;

            this.mesh = cube;

            this.scene.add(this.mesh);
            return true;

        } catch (error) {
            console.log("Something went wrong when initializing player:\n" + this.name + " ID:" + this.id + "\n" + error);
            return false;
        }
    }

    updatePlayerFromJSON(data){

        try {

            if(data.name)
                this.name = data.name;

            if(data.color)
                this.color = data.color;

            if(data.position && typeof data.position === 'object')
                this.#position = data.position;
            if(data.rotation && typeof data.rotation === 'object')
                this.#rotation = data.rotation;

            this.mesh.position.set(this.#position.x, this.#position.y, this.#position.z);
            this.mesh.rotation.set(this.#rotation.x, this.#rotation.y, this.#rotation.z);

            return true;

        } catch (error) {
            console.log("Something went wrong when updating player:\n" + this.name + " ID:" + this.id + "\n" + error);
            return false;
        }

    }

    setPlayerPosition(newPos = {x: 0, y: 0, z: 0}){
        this.#position = newPos;
        this.mesh.position.set(this.#position.x, this.#position.y, this.#position.z);
    }

    getPlayerPosition(){
        return this.#position;
    }

    removePlayer(){
        this.scene.remove(this.mesh);
    }

}