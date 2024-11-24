import ObjModel from "../model.js"
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
    this.dobeto = new ObjModel(this.levelScene, 'models/PORFAVOR.obj', 'models/PORFAVOR.mtl', false);
    await this.dobeto.initModel().then((mesh) => {
      mesh.position.y = 25;
      mesh.position.x = -135;
      mesh.position.z = -135;
      mesh.scale.set(15, 15, 15);
      mesh.rotation.y = -125 * Math.PI / 180;
    });

    this.Track = new ObjModel(this.levelScene, 'models/CityWorld/CityWorld.obj', 'models/CityWorld/CityWorld.mtl', false);

    this.Track.initModel().then((mesh) => {
      mesh.position.x = 0;
      mesh.position.y = 0.1;
      mesh.position.z = 0;
      mesh.scale.set(1.5, 1.5, 1.5);
    });

    this.models.push(this.dobeto);
    this.models.push(this.Track);
  }

  update() {
    super.update();

    // Manejar modelos
    if (this.dobeto.isLoaded()) {
      // this.dobeto.mesh.rotation.y += 0.01;
      // this.dobeto.mesh.position.y += 0.01;
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