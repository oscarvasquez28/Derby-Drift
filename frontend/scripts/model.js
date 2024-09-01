import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export default class ObjModel {

    constructor(scene, objPath, mtlPath) {
        this.mesh = null;

        const mtlLoader = new MTLLoader();
        mtlLoader.load(mtlPath, (materials) => {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
                objPath,
                (object) => {
                    this.mesh = object;
                    object.rotateY(Math.PI)
                    object.position.set(0, 5, -15)
                    scene.add(object);
                },
                (xhr) => {
                    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    // console.error('An error happened', error);
                }
            );
        });
        console.log(this.mesh)
    }
}
