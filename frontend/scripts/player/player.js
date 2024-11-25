import * as THREE from 'three'
import ObjModel from '../model.js'
import NameTag from './nametag.js'
import ParticleSystem from '../particles.js'

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
    }
  };

  lookAt = { x: 0, y: 0, z: 0 };
  lookAtNormilized = { x: 0, y: 0, z: 0 };
  wheelScale = 2.4;

  projectiles = []; // TODO Add projectiles from socket.on newProjectile method in level.js 

  debug = false; // Debug mode
  debugChassisScale = { x: 8, y: 1, z: 4 };

  constructor(scene) {

    this.name = "Incógnito";
    this.id = -1;
    this.currentCheckpoint = 0;
    this.currentLap = 0;
    this.initHealth = undefined;
    this.health = undefined;
    this.color = 0x000000;
    this.score = 0;
    this.levelId = -1;
    this.mesh = {};
    this.scene = scene;
    this.onFire = false;
    this.trail = {};
    this.fire = null;

  }

  async initPlayerFromJSON(data) {

    try {

      if (data.id)
        this.id = data.id;
      else
        throw "Cannot initialize player with an undefined id";

      if (data.levelId)
        this.levelId = data.levelId;

      if (data.name)
        this.name = data.name;

      if (data.email)
        this.email = data.email;

      if (data.currentLap != undefined)
        this.currentLap = data.currentLap;

      if (data.currentCheckpoint != undefined)
        this.currentCheckpoint = data.currentCheckpoint;

      if (data.ammo)
        this.ammo = data.ammo;

      if (data.hasShield != undefined)
        this.hasShield = data.hasShield;

      if (data.hasBoost != undefined)
        this.hasBoost = data.hasBoost;

      if (data.score)
        this.score = data.score;

      if (data.color)
        this.color = data.color;

      if (data.health) {
        this.initHealth = data.health;
        this.health = data.health;
      }

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
      console.log(data.mesh);
      // Si se proporciona un modelo será utilizado, de lo contrario se mostrará una vehículo básico por defecto
      if (data.mesh) {
        if (!this.debug) {
          const model = data.mesh === 1 ? 'Car1' : 'Car2';
          const scale = data.mesh === 1 ? 1.5 : 2;
          const carModel = new ObjModel(this.scene, 'models/' + model + '/' + model + '.obj', 'models/' + model + '/' + model + '.mtl', false)
          await carModel.initModel().then((mesh) => {
            this.mesh.chassis = mesh;
            this.mesh.chassis.scale.set(scale, scale, scale);
          });
        } else {
          this.mesh.chassis = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
          this.mesh.chassis.scale.set(this.debugChassisScale.x, this.debugChassisScale.y, this.debugChassisScale.z);
        }

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

        // Añadir la esfera que muestra los jugadores con escudo
        const sphereGeometry = new THREE.SphereGeometry(4.3, 8, 8);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5, depthWrite: false });
        const sphereWireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        this.mesh.shieldWireframe = new THREE.Mesh(sphereGeometry, sphereWireframeMaterial);
        this.mesh.shield = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.mesh.chassis.add(this.mesh.shield);
        this.mesh.chassis.add(this.mesh.shieldWireframe);
        const pointlight = new THREE.PointLight(0x00ffff, 5, 75, 4);
        this.mesh.shield.add(pointlight);
        this.hideShield();

        // this.mesh.wheels.frontLeft.rotation.isEuler = false;

        // this.mesh.wheels.frontRight.rotation.isEuler = false;

        // this.mesh.wheels.backLeft.rotation.isEuler = false;

        // this.mesh.wheels.backRight.rotation.isEuler = false;
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

      // Añadir un foco al frente del coche
      let spotlight = new THREE.SpotLight(0xffffff, .2);
      spotlight.position.set(3, 5, 3); // Ajustar la posición según sea necesario
      spotlight.target.position.set(10, 0, 0); // Apuntando hacia adelante
      spotlight.angle = Math.PI / 4; // Reducir el ángulo del cono de luz
      spotlight.penumbra = 0.1; // Ajustar la penumbra si es necesario
      spotlight.castShadow = true; // Activar las sombras
      this.mesh.chassis.add(spotlight);
      this.mesh.chassis.add(spotlight.target);
      // Repetimos para el otro lado
      spotlight = new THREE.SpotLight(0xffffff, .2);
      spotlight.position.set(3, 5, -3);
      spotlight.target.position.set(10, 0, 0);
      spotlight.angle = Math.PI / 4;
      spotlight.penumbra = 0.1;
      spotlight.castShadow = true;
      this.mesh.chassis.add(spotlight);
      this.mesh.chassis.add(spotlight.target);

      if (data.camera) {
        this.fire = new ParticleSystem({
          alwaysRender: true,
          parent: this.scene,
          spawnPosition: this.mesh.chassis.position,
          camera: data.camera,
          life: 2,
          velocity: { x: 0, y: 30, z: 0 },
          size: 5
        });
        this.trail[0] = new ParticleSystem({
          alwaysRender: true,
          parent: this.scene,
          spawnPosition: this.mesh.wheels.backRight.position,
          camera: data.camera,
          life: 2,
          velocity: { x: 0, y: 15, z: 0 },
          size: 2.5
        });
        this.trail[1] = new ParticleSystem({
          alwaysRender: true,
          parent: this.scene,
          spawnPosition: this.mesh.wheels.backLeft.position,
          camera: data.camera,
          life: 2,
          velocity: { x: 0, y: 15, z: 0 },
          size: 2.5
        });
      }

      this.nametag = new NameTag(this, this.scene);
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

      if (data.health) {
        this.health = data.health;
        if (this.health <= this.initHealth / 2) {
          this.onFire = true;
        }
      }

      if (data.currentLap != undefined)
        this.currentLap = data.currentLap;

      if (data.currentCheckpoint != undefined)
        this.currentCheckpoint = data.currentCheckpoint;

      if (data.ammo != undefined)
        this.ammo = data.ammo;

      if (data.hasShield != undefined)
        this.hasShield = data.hasShield;

      if (data.hasBoost != undefined)
        this.hasBoost = data.hasBoost;

      if (data.color)
        this.color = data.color;

      if (data.score)
        this.score = data.score;

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
    if (this.hasShield === true) {
      this.showShield();
      if (this.mesh.shield && this.mesh.shieldWireframe) {
        this.mesh.shield.rotation.y += 0.01;
        this.mesh.shield.rotation.x += 0.02;
        this.mesh.shield.rotation.z += 0.005;
        this.mesh.shieldWireframe.rotation.y += 0.01;
        this.mesh.shieldWireframe.rotation.x += 0.02;
        this.mesh.shieldWireframe.rotation.z += 0.005;
      }
    }
    else
      this.hideShield();

    this.#generateLookAt();

    if (this.hasBoost && this.trail) {
      for (let i = 0; i < 2; i++) {
        if (this.trail[i]) {
          this.trail[i].show();
          this.trail[i].Step((1 / ((localStorage.getItem('FPS')) || 60)));
        }
      }
    } else
      for (let i = 0; i < 2; i++) {
        if (this.trail[i])
          this.trail[i].hide();
      }

    if (this.onFire && this.fire)
      this.fire.Step((1 / ((localStorage.getItem('FPS')) || 60)));

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
    if (this.fire)
      this.fire.destroy();
  }

  showShield() {
    if (!this.mesh.shield || !this.mesh.shieldWireframe) return;
    this.mesh.shield.visible = true;
    this.mesh.shieldWireframe.visible = true;
  }

  hideShield() {
    if (!this.mesh.shield || !this.mesh.shieldWireframe) return;
    this.mesh.shield.visible = false;
    this.mesh.shieldWireframe.visible = false;
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