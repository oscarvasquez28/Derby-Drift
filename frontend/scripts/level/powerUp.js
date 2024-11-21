import * as THREE from 'three';

export default class PowerUp {

    constructor(params) {
        this.id = params.id;
        this.scene = params.scene;
        this.type = params.type;
        this.position = params.position || new THREE.Vector3(0, 0, 0);
        this.quaternion = params.quaternion || new THREE.Quaternion();
        this.rotation = params.rotation || new THREE.Euler();
        this.useEuler = params.useEuler || true;
        this.radius = params.radius || 1;
        this.mesh = this.createPowerUpMesh();
    }

    createPowerUpMesh() {
        const sphereGeometry = new THREE.SphereGeometry(4.3, 8, 8);
        const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

        const dev = new THREE.Mesh(sphereGeometry, sphereMaterial);

        dev.receiveShadow = true;

        this.scene.add(dev);

        dev.position.copy(this.position);
        dev.quaternion.copy(this.quaternion);

        return dev;
    }

    getJSON() {
        return {
            position: this.position,
            quaternion: this.quaternion,
            type: this.type,
            mesh: this.mesh
        }
    }

    destroy() {
        this.scene.remove(this.mesh);
    }

    setPos(position = this.position) {  
        this.position = position;
        if (this.mesh)
            this.mesh.position.copy(position);
    }

    setQuaternion(quaternion = this.quaternion) {
        this.quaternion = quaternion;
        if (this.mesh)
            this.mesh.quaternion.copy(quaternion);
    }

    setRotation(rotation = this.rotation) {
        this.rotation = rotation;
        if (this.mesh)
            this.mesh.rotation.copy(rotation);
    }

    update() {
        this.useEuler ? this.setRotation() : this.setQuaternion();
        this.setPos();
    }
}