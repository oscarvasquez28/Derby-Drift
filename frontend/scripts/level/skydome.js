import * as THREE from 'three'

export default class Skydome {

    constructor(scene){
        this.scene = scene;
        this.clientPlayer = null;
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

    update(){
        this.skydome.rotation.y += 0.0001;
        if (this.clientPlayer) {
            const playerPosition = this.clientPlayer.getPlayerPosition();
            this.skydome.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
        }
    }

}
