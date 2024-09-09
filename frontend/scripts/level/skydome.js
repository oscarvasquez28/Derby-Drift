import * as THREE from 'three'

export default class Skydome {

    constructor(scene){
        this.scene = scene;
    }

    initSkydome(){
        const textureLoader = new THREE.TextureLoader();
        const skyTexture = textureLoader.load('textures/skydome.jpg');

        const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
        const skyMaterial = new THREE.MeshBasicMaterial({
        map: skyTexture,
        side: THREE.BackSide
        });

        const skydome = new THREE.Mesh(skyGeometry, skyMaterial);
        this.skydome = skydome;

        this.scene.add(skydome);
    }

}
