import * as THREE from 'three'
import ObjModel from '../model.js'
import NameTag from './nametag.js'

export default class Player {

  #position = {
    chassis: { x: 0, y: 0, z: 0 },
    wheels: {
      frontLeft: { x: 0, y: 0, z: 0 },
      frontRight: { x: 0, y: 0, z: 0 },
      backLeft: { x: 0, y: 0, z: 0 },
      backRight: { x: 0, y: 0, z: 0 }
    },
  };
  #rotation = {
    chassis: { x: 0, y: 0, z: 0 },
    wheels: {
      frontLeft: { x: 0, y: 0, z: 0, w: 0 },
      frontRight: { x: 0, y: 0, z: 0, w: 0 },
      backLeft: { x: 0, y: 0, z: 0, w: 0 },
      backRight: { x: 0, y: 0, z: 0, w: 0 }
    },
  };

  lookAt = { x: 0, y: 0, z: 0 };
  lookAtNormilized = { x: 0, y: 0, z: 0 };
  wheelScale = 2.4;

  debug = false; // Debug mode
  debugChassisScale = { x: 8, y: 1, z: 4 };

  constructor(scene) {

    this.name = "Incógnito";
    this.color = 0x000000;
    this.id = -1;
    this.mesh = {};
    this.scene = scene;

    this.nametag = new NameTag(this, scene);
  }

  async initPlayerFromJSON(data) {

    try {

      if (data.name)
        this.name = data.name;

      if (data.color)
        this.color = data.color;

      if (data.id)
        this.id = data.id;
      else
        throw "Cannot initialize player with an undefined id";

      if (data.position && typeof data.position === 'object') {
        if (data.position.chassis && typeof data.position.chassis === 'object')
          this.#position.chassis = data.position.chassis;
        if (data.position.wheels.frontLeft && typeof data.position.wheels.frontLeft === 'object')
          this.#position.wheels.frontLeft = data.position.wheels.frontLeft;
        if (data.position.wheels.frontRight && typeof data.position.wheels.frontRight === 'object')
          this.#position.wheels.frontRight = data.position.wheels.frontRight;
        if (data.position.wheels.backLeft && typeof data.position.wheels.backLeft === 'object')
          this.#position.wheels.backLeft = data.position.wheels.backLeft;
        if (data.position.wheels.backRight && typeof data.position.wheels.backRight === 'object')
          this.#position.wheels.backRight = data.position.wheels.backRight;
      }
      if (data.rotation && typeof data.rotation === 'object') {
        if (data.rotation.chassis && typeof data.rotation.chassis === 'object')
          this.#rotation.chassis = data.rotation.chassis;
        if (data.rotation.wheels.frontLeft && typeof data.rotation.wheels.frontLeft === 'object')
          this.#rotation.wheels.frontLeft = data.rotation.wheels.frontLeft;
        if (data.rotation.wheels.frontRight && typeof data.rotation.wheels.frontRight === 'object')
          this.#rotation.wheels.frontRight = data.rotation.wheels.frontRight;
        if (data.rotation.wheels.backLeft && typeof data.rotation.wheels.backLeft === 'object')
          this.#rotation.wheels.backLeft = data.rotation.wheels.backLeft;
        if (data.rotation.wheels.backRight && typeof data.rotation.wheels.backRight === 'object')
          this.#rotation.wheels.backRight = data.rotation.wheels.backRight;
      }
      console.log(this.#rotation);

      // Si se proporciona un modelo será utilizado, de lo contrario se mostrará una vehículo básico por defecto
      if (!data.mesh) {
        if (!this.debug) {
          const carModel = new ObjModel(this.scene, 'models/Car2/Car2.obj', 'models/Car2/Car2.mtl', false)
          await carModel.initModel().then((mesh) => {
            this.mesh.chassis = mesh;
            this.mesh.chassis.scale.set(2, 2, 2);
          });
        } else {
          this.mesh.chassis = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
          this.mesh.chassis.scale.set(this.debugChassisScale.x, this.debugChassisScale.y, this.debugChassisScale.z);
        }

        const material = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh.chassis.castShadow = true;
        this.mesh.chassis.recieveShadow = true;
        this.mesh.wheels = {
          frontLeft: null,
          frontRight: null,
          backLeft: null,
          backRight: null,
        };
        const FrontLeft = new ObjModel(this.scene, 'models/Wheel/Wheel.obj', 'models/Wheel/Wheel.mtl', false)
        await FrontLeft.initModel().then((mesh) => {
          this.mesh.wheels.frontLeft = mesh;
          this.mesh.wheels.frontLeft.scale.set(this.wheelScale, this.wheelScale, this.wheelScale);
        });
        const FrontRight = new ObjModel(this.scene, 'models/Wheel/Wheel.obj', 'models/Wheel/Wheel.mtl', false)
        await FrontRight.initModel().then((mesh) => {
          this.mesh.wheels.frontRight = mesh;
          this.mesh.wheels.frontRight.scale.set(this.wheelScale, this.wheelScale, this.wheelScale);
        });
        const BackLeft = new ObjModel(this.scene, 'models/Wheel/Wheel.obj', 'models/Wheel/Wheel.mtl', false)
        await BackLeft.initModel().then((mesh) => {
          this.mesh.wheels.backLeft = mesh;
          this.mesh.wheels.backLeft.scale.set(this.wheelScale, this.wheelScale, this.wheelScale);
        });
        const BackRight = new ObjModel(this.scene, 'models/Wheel/Wheel.obj', 'models/Wheel/Wheel.mtl', false)
        await BackRight.initModel().then((mesh) => {
          this.mesh.wheels.backRight = mesh;
          this.mesh.wheels.backRight.scale.set(this.wheelScale, this.wheelScale, this.wheelScale);
        });
        this.mesh.wheels.frontLeft.castShadow = true;
        this.mesh.wheels.frontLeft.recieveShadow = true;
        this.mesh.wheels.frontLeft.rotation.isEuler = false;
        this.mesh.wheels.frontRight.castShadow = true;
        this.mesh.wheels.frontRight.recieveShadow = true;
        this.mesh.wheels.frontRight.rotation.isEuler = false;
        this.mesh.wheels.backLeft.castShadow = true;
        this.mesh.wheels.backLeft.recieveShadow = true;
        this.mesh.wheels.backLeft.rotation.isEuler = false;
        this.mesh.wheels.backRight.castShadow = true;
        this.mesh.wheels.backRight.recieveShadow = true;
        this.mesh.wheels.backRight.rotation.isEuler = false;
      } else {
      }

      this.mesh.chassis.position.set(this.#position.chassis.x, this.#position.chassis.y, this.#position.chassis.z);
      this.mesh.chassis.quaternion.copy(this.#rotation.chassis);
      this.mesh.wheels.frontLeft.position.set(this.#position.wheels.frontLeft.x, this.#position.wheels.frontLeft.y, this.#position.wheels.frontLeft.z);
      this.mesh.wheels.frontLeft.quaternion.copy(this.#rotation.wheels.frontLeft);
      this.mesh.wheels.frontRight.position.set(this.#position.wheels.frontRight.x, this.#position.wheels.frontRight.y, this.#position.wheels.frontRight.z);
      this.mesh.wheels.frontRight.quaternion.copy(this.#rotation.wheels.frontRight);
      this.mesh.wheels.backLeft.position.set(this.#position.wheels.backLeft.x, this.#position.wheels.backLeft.y, this.#position.wheels.backLeft.z);
      this.mesh.wheels.backLeft.quaternion.copy(this.#rotation.wheels.backLeft);
      this.mesh.wheels.backRight.position.set(this.#position.wheels.backLeft.x, this.#position.wheels.backLeft.y, this.#position.wheels.backLeft.z);
      this.mesh.wheels.backRight.quaternion.copy(this.#rotation.wheels.backRight);

      this.scene.add(this.mesh.chassis);
      this.scene.add(this.mesh.wheels.frontLeft);
      this.scene.add(this.mesh.wheels.frontRight);
      this.scene.add(this.mesh.wheels.backLeft);
      this.scene.add(this.mesh.wheels.backRight);

      return true;

    } catch (error) {
      console.error("Something went wrong when initializing player:\n" + this.name + " ID:" + this.id + "\n" + error);
      return false;
    }

  }

  initPlayerAsCubeMesh() {

    try {

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({ color: this.color });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;

      this.mesh.cube = cube;

      this.scene.add(this.mesh.cube);
      return true;

    } catch (error) {
      console.log("Something went wrong when initializing player:\n" + this.name + " ID:" + this.id + "\n" + error);
      return false;
    }
  }

  updatePlayerFromJSON(data) {

    try {

      if (data.name)
        this.name = data.name;

      if (data.color)
        this.color = data.color;

      if (data.position && typeof data.position === 'object') {
        if (data.position.chassis && typeof data.position.chassis === 'object')
          this.#position.chassis = data.position.chassis;
        if (data.position.wheels.frontLeft && typeof data.position.wheels.frontLeft === 'object')
          this.#position.wheels.frontLeft = data.position.wheels.frontLeft;
        if (data.position.wheels.frontRight && typeof data.position.wheels.frontRight === 'object')
          this.#position.wheels.frontRight = data.position.wheels.frontRight;
        if (data.position.wheels.backLeft && typeof data.position.wheels.backLeft === 'object')
          this.#position.wheels.backLeft = data.position.wheels.backLeft;
        if (data.position.wheels.backRight && typeof data.position.wheels.backRight === 'object')
          this.#position.wheels.backRight = data.position.wheels.backRight;
      }
      if (data.rotation && typeof data.rotation === 'object') {
        if (data.rotation.chassis && typeof data.rotation.chassis === 'object')
          this.#rotation.chassis = data.rotation.chassis;
        if (data.rotation.wheels.frontLeft && typeof data.rotation.wheels.frontLeft === 'object')
          this.#rotation.wheels.frontLeft = data.rotation.wheels.frontLeft;
        if (data.rotation.wheels.frontRight && typeof data.rotation.wheels.frontRight === 'object')
          this.#rotation.wheels.frontRight = data.rotation.wheels.frontRight;
        if (data.rotation.wheels.backLeft && typeof data.rotation.wheels.backLeft === 'object')
          this.#rotation.wheels.backLeft = data.rotation.wheels.backLeft;
        if (data.rotation.wheels.backRight && typeof data.rotation.wheels.backRight === 'object')
          this.#rotation.wheels.backRight = data.rotation.wheels.backRight;
      }

      this.mesh.chassis.position.set(this.#position.chassis.x, this.#position.chassis.y, this.#position.chassis.z);
      this.mesh.chassis.quaternion.copy(this.#rotation.chassis);
      this.mesh.wheels.frontLeft.position.set(this.#position.wheels.frontLeft.x, this.#position.wheels.frontLeft.y, this.#position.wheels.frontLeft.z);
      this.mesh.wheels.frontLeft.quaternion.copy(this.#rotation.wheels.frontLeft);
      this.mesh.wheels.frontRight.position.set(this.#position.wheels.frontRight.x, this.#position.wheels.frontRight.y, this.#position.wheels.frontRight.z);
      this.mesh.wheels.frontRight.quaternion.copy(this.#rotation.wheels.frontRight);
      this.mesh.wheels.backLeft.position.set(this.#position.wheels.backLeft.x, this.#position.wheels.backLeft.y, this.#position.wheels.backLeft.z);
      this.mesh.wheels.backLeft.quaternion.copy(this.#rotation.wheels.backLeft);
      this.mesh.wheels.backRight.position.set(this.#position.wheels.backRight.x, this.#position.wheels.backRight.y, this.#position.wheels.backRight.z);
      this.mesh.wheels.backRight.quaternion.copy(this.#rotation.wheels.backRight);

      return true;

    } catch (error) {
      console.log("Something went wrong when updating player:\n" + this.name + " ID:" + this.id + "\n" + error);
      return false;
    }

  }

  update() {
    if (this.nametag)
      this.nametag.update();
    this.#generateLookAt();
  }

  setPlayerPosition(newPos = { x: 0, y: 0, z: 0 }) {
    this.#position.chassis = newPos;
    this.mesh.chassis.position.set(newPos.x, newPos.y, newPos.z);
  }

  getPlayerPosition() {
    return new THREE.Vector3(this.#position.chassis.x, this.#position.chassis.y, this.#position.chassis.z);
  }

  removePlayer() {
    this.scene.remove(this.mesh.chassis);
    this.scene.remove(this.mesh.wheels.frontLeft);
    this.scene.remove(this.mesh.wheels.frontRight);
    this.scene.remove(this.mesh.wheels.backLeft);
    this.scene.remove(this.mesh.wheels.backRight);
    this.nametag.remove();
  }

  #generateLookAt() {

    this.lookAt = new THREE.Vector3(
      (this.#position.wheels.frontLeft.x + this.#position.wheels.frontRight.x) / 2 - this.#position.chassis.x,
      (this.#position.wheels.frontLeft.y + this.#position.wheels.frontRight.y) / 2 - this.#position.chassis.y,
      (this.#position.wheels.frontLeft.z + this.#position.wheels.frontRight.z) / 2 - this.#position.chassis.z
    );
    this.lookAtNormilized = new THREE.Vector3().copy(this.lookAt).normalize().multiplyScalar(10);
  }

}