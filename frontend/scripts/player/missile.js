import * as THREE from 'three';
import ObjModel from '../model.js';
import ParticleSystem from '../particles.js';

export default class Missile {

    constructor(scene, player, camera, id) {
        this.id = id;
        this.scene = scene;
        this.player = player;
        this.camera = camera;
        this.fire = null;
        this.createMissile().then(mesh => {
            this.body = mesh;
            this.attatchParticles();
        });
    }

    async createMissile() {
        const missileBody = new ObjModel(this.scene, 'models/Rocket/Rocket.obj', 'models/Rocket/Rocket.mtl', false);
        
        let missileMesh = null
        
        await missileBody.initModel().then((mesh) => {
            missileMesh = mesh;
            missileMesh.scale.set(2.5, 2.5, 2.5);
        });


        return missileMesh;
        // const missileBody = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        // this.scene.add(missileBody);
        // return missileBody;
    }

    attatchParticles() {
        this.fire = new ParticleSystem({ 
            alwaysRender: true,
            parent: this.scene,
            spawnPosition: this.body.position,
            camera: this.camera,
            life: 5,
            velocity: {x: 0, y: 8, z: 0},
            size: 5
        });
    }

    updateMissileFromJSON(missileJSON) {
        this.body?.position.copy(missileJSON?.position ? missileJSON.position : new THREE.Vector3(0, 0, 0));
        this.body?.quaternion.copy(missileJSON?.quaternion ? missileJSON.quaternion : new THREE.Quaternion(0, 0, 0, 1));
    }

    removeMissile() {
        this.scene.remove(this.body);
        this.fire?.destroy();
    }

    update() {
        if (this.fire) {
            this.fire.Step(1 / (localStorage.getItem('FPS') || 60));
        }
    }

}
