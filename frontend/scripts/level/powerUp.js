import * as THREE from 'three';

export default class PowerUp {

    constructor(params) {
        this.id = params.id;
        this.scene = params.scene;
        this.type = params.type;
        this.position = params.position || new THREE.Vector3(0, 0, 0);
        this.quaternion = params.quaternion || new THREE.Quaternion();
        this.radius = params.radius || 1;
        this.mesh = this.createPowerUpMesh();
    }

    createPowerUpMesh() {
        const sphereGeometry = new THREE.SphereGeometry(4.3, 8, 8);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5, depthWrite: false });
        const sphereWireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

        const shieldWireframe = new THREE.Mesh(sphereGeometry, sphereWireframeMaterial);
        const shield = new THREE.Mesh(sphereGeometry, sphereMaterial);

        this.scene.add(shield);
        shield.add(shieldWireframe);

        shield.position.copy(this.position);
        shield.quaternion.copy(this.quaternion);

        return {
            shield: shield,
            shieldWireframe: shieldWireframe  
        };
    }

    getJSON() {
        return {
            position: this.position,
            quaternion: this.quaternion,
            type: this.type,
            mesh: this.mesh
        }
    }

    getBody() {
        return this.body;
    }

    destroy() {
        this.scene.remove(this.mesh.shield);
        this.scene.remove(this.mesh.shieldWireframe);
    }

    setPos(position = this.position) {  
        this.position = position;
        this.mesh.shield.position.copy(position);
    }

    setQuaternion(quaternion = this.quaternion) {
        this.quaternion = quaternion;
        this.mesh.shield.quaternion.copy(quaternion);
    }

    update() {
        this.setQuaternion();
        this.setPos();
        this.mesh.shield.rotation.y += 0.01;
        this.mesh.shieldWireframe.rotation.y += 0.01;
    }
}