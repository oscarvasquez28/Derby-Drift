import ObjModel from "../model.js"
import { GlbModel } from "../model.js";
import Level from './level.js';

export default class Track extends Level {

  constructor() {
    // super('models/Track/TrackHeightMap.png', 0x136D15, 2);
    super('textures/TrackHeightmap.png', 0x136D15, 6);
    this.levelId = 1;
    this.showLap = true;
    // this.initHeight = 30;
  }

  async initLevel() {
    super.initLevel();
    
    // Inicializar con rotación y posición en personalizadas
    this.dobeto = new GlbModel (this.levelScene, 'models/Dobeto/DobetoAnimations.glb', false);
    await this.dobeto.initModel().then((mesh) => {
      mesh.position.x = 0;
      mesh.position.y = 0;
      mesh.position.z = 50;
      mesh.scale.set(2.3, 2.3, 2.3);
      mesh.prevPosition = mesh.position.clone();
      this.dobeto.actions[0].play();
    });

    this.Track = new ObjModel(this.levelScene, 'models/CityWorld/CityWorld.obj', 'models/CityWorld/CityWorld.mtl', false);

    this.Track.initModel().then((mesh) => {
      mesh.position.x = 0;
      mesh.position.y = 0.1;
      mesh.position.z = 0;
      mesh.scale.set(1.5, 1.5, 1.5);
    });

    this.glbModels.push(this.dobeto);
    this.models.push(this.Track);
  }

  update() {
    super.update();
    
    if (this.dobeto.isLoaded()) {
      this.dobeto.update(1 / 60);
    }
  }

  updateAI(aiData) {
    if (this.dobeto?.isLoaded()) {
      this.dobeto.mesh.prevPosition = this.dobeto.mesh.position.clone();
      this.dobeto.mesh.position.set(aiData.position.x, aiData.position.y - 1.5, aiData.position.z);
      if (this.dobeto.mesh.prevPosition.distanceTo(this.dobeto.mesh.position) > 4) {
        this.dobeto.actions[0].stop();
        this.dobeto.actions[1].play();
      } else {
        this.dobeto.actions[1].stop();
        this.dobeto.actions[0].play();
        this.dobeto.mesh.lookAt(
          this.dobeto.mesh.position.x + (this.dobeto.mesh.position.x - this.dobeto.mesh.prevPosition.x),
          this.dobeto.mesh.position.y + (this.dobeto.mesh.position.y - this.dobeto.mesh.prevPosition.y),
          this.dobeto.mesh.position.z + (this.dobeto.mesh.position.z - this.dobeto.mesh.prevPosition.z)
        );
        this.dobeto.mesh.rotateY(-Math.PI / 2);
      } 
    }
  }

  updateCountdown() {
    const numPlayersElement = document.getElementById('connected-players');
    const waitScreenElement = document.getElementById('wait-screen');
    const waitScreenMessageElement = document.getElementById('wait-screen-message');

    if (numPlayersElement) {
      numPlayersElement.textContent = "Jugadores conectados: " + this.players.length;
    }

    if (waitScreenMessageElement) {
      waitScreenMessageElement.textContent = this.countdown === null ? "Esperando a otros jugadores..." : "El juego empezará en " + this.countdown + " segundos";
    }

    if (this.countdown != null && this.countdown <= 0 && waitScreenElement) {
      waitScreenElement.hidden = true;
    } else {
      waitScreenElement.hidden = false
    }

  }

}