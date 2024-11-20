import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import * as THREE from 'three';

export default class ObjModel {
    constructor(scene, objPath, mtlPath, selfInit = true) {
        this.scene = scene;
        this.objPath = objPath;
        this.mtlPath = mtlPath;
        if (selfInit) {
            this.initModel();
        }
    }

    initModel() {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        if(this.mesh) {
            this.scene.remove(this.mesh);
        }

        return new Promise((resolve, reject) => {
            mtlLoader.load(this.mtlPath, (materials) => {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load(this.objPath, (object) => {
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                this.scene.add(object);
                this.mesh = object;
                resolve(object);
            }, undefined, reject);
            });
        });
    }

    isLoaded() {
        return this.mesh !== undefined;
    }

    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
    }

}
