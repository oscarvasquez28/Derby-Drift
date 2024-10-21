import World from "./world.js"
import Player from "../player/player.js"
import ClientPlayer from "../player/clientPlayer.js"
import Connection from "../../connection.js"
import ObjModel from "../model.js"

const FPS = 60;

export default class Level {

  constructor() {
    this.world = new World();

    this.players = new Array().fill(0);

    this.models = new Array().fill(0);

    this.socket = Connection.getConnection();

    this.clientPlayer = null;
  }

  async initLevel() {
    this.world.initWorld();

    this.levelCamera = this.world.camera;

    this.levelScene = this.world.scene;

    this.levelRenderer = this.world.renderer;

    this.#setUpSocketEvents();

    // Inicializar con valores por defecto
    // this.dobeto = new ObjModel(this.levelScene, 'models/PORFAVOR.obj', 'models/PORFAVOR.mtl');

    // Inicializar con rotación y posición en personalizadas
    this.dobeto = new ObjModel(this.levelScene, 'models/PORFAVOR.obj', 'models/PORFAVOR.mtl', false);
    await this.dobeto.initModel().then((mesh) => {
      mesh.position.y = 25;
      mesh.position.x = -135;
      mesh.position.z = -135;
      mesh.scale.set(15, 15, 15);
      mesh.rotation.y = -125 * Math.PI / 180;
    });

    this.colliseum = {
      rails: new ObjModel(this.levelScene, 'models/Colliseum/ColliseumRails.obj', 'models/Colliseum/ColliseumRails.mtl', false),
      seats: new ObjModel(this.levelScene, 'models/Colliseum/ColliseumSeats.obj', 'models/Colliseum/ColliseumSeats.mtl', false),
      walls: new ObjModel(this.levelScene, 'models/Colliseum/ColliseumWalls.obj', 'models/Colliseum/ColliseumWalls.mtl', false),
    }

    this.colliseum.rails.initModel().then((mesh) => {
      mesh.position.x = 10;
      mesh.position.y = 13;
      mesh.position.z = 0;
      mesh.scale.set(3.3, 3.3, 3.3);
    });
    this.colliseum.seats.initModel().then((mesh) => {
      mesh.position.x = 10;
      mesh.position.y = 13;
      mesh.position.z = 0;
      mesh.scale.set(3.3, 3.3, 3.3);
    });
    this.colliseum.walls.initModel().then((mesh) => {
      mesh.position.x = 10;
      mesh.position.y = 13;
      mesh.position.z = 0;
      mesh.scale.set(3.3, 3.3, 3.3);
    });

    this.models.push(this.dobeto);
  }

  begin() {
    const fps = FPS;
    const interval = 1000 / fps;
    let lastTime = 0;

    const animate = (time) => {
      if (time - lastTime >= interval) {
        lastTime = time;
        this.levelRenderer.render(this.levelScene, this.levelCamera);
        this.update();
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  update() {

    if (this.clientPlayer) {
      const playerPosition = this.clientPlayer.getPlayerPosition();
      const lookAtNorm = this.clientPlayer.getPlayerNormalizedLookAt();
      this.levelCamera.position.set(playerPosition.x - (lookAtNorm.x * 2), playerPosition.y + 12, playerPosition.z - (lookAtNorm.z * 2));
      this.levelCamera.lookAt(playerPosition.x, playerPosition.y + 10, playerPosition.z );
    }

    // Manejar modelos
    if (this.dobeto.isLoaded()){
      // this.dobeto.mesh.rotation.y += 0.01;
      // this.dobeto.mesh.position.y += 0.01;
    }

    this.players.forEach(player => {
      player.update();
    });

  }

  updatePlayers(updatedPlayers) {
    this.players = updatedPlayers;
  }

  currentPlayers(currentPlayers) {
    return this.players = currentPlayers;
  }

  addPlayer(newPlayer) {

    let result = true;
    let addedPlayer = null;

    if (!newPlayer) {
      addedPlayer = new Player(this.world.scene);
      result = addedPlayer.initPlayerAsCubeMesh();
    }
    else if (typeof newPlayer === 'Player') {
      addedPlayer = newPlayer;
      addedPlayer.color = Math.random() * 0xFFFFFF;
      result = addedPlayer.initPlayerAsCubeMesh();
    }
    else if (typeof newPlayer === 'object') {
      addedPlayer = new Player(this.world.scene);
      result = addedPlayer.initPlayerFromJSON(newPlayer);
    }

    this.players.push(addedPlayer);

    if (this.players.length == 1) this.#setClientPlayer();

    if (result)
      console.log("Player: " + addedPlayer.name + " ID:" + addedPlayer.id + " successfully added to the scene");

    return addedPlayer;

  }

  getClientPlayer() {
    return this.clientPlayer;
  }

  #setClientPlayer() {
    const clientPlayer = this.players.find(obj => obj.id === this.socket.id);
    if (clientPlayer) {
      this.clientPlayer = new ClientPlayer(clientPlayer);
    }
  }

  #setUpSocketEvents(){

    const socket = this.socket;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('newPlayer', (player) => {
      console.log("Recieved message from server: newPlayer\nPlayer: " + player.name + " ID:" + player.id + ' connected');
      this.addPlayer(player);
    });

    socket.on('currentPlayers', (playersData) => {
      Object.keys(playersData).forEach((id) => {
        if (!this.players.find(obj => obj.id === id)) {
          this.addPlayer(playersData[id]);
          console.log("Recieved message from server: currentPlayers\nRecieved new player: " + id);
        }
        else {
          console.log("Recieved message from server: currentPlayers\nPlayer: " + playersData[id].name + " ID:" + id + " is already in the scene");
        }
      });
    });

    socket.on('playerDisconnected', (id) => {
      console.log("Recieved message from server: playerDisconnected");
      const disconnectedPlayer = this.players.find(obj => obj.id === id);
      if (disconnectedPlayer) {
        disconnectedPlayer.removePlayer();
        this.players = this.players.filter(obj => obj.id !== disconnectedPlayer.id);
        console.log("Player: " + disconnectedPlayer.name + " ID:" + disconnectedPlayer.id + " disconnected");
      }
    });

    socket.on('update', (playersData) => {
      Object.keys(playersData).forEach((id) => {
        const updatedPlayer = this.players.find(obj => obj.id === id);
        if (updatedPlayer) {
          updatedPlayer.updatePlayerFromJSON(playersData[id]);
        }
        else {
          console.log("Recieved message from server: update\nPlayer " + id + " is not in the scene");
        }
      });
    });

    socket.on('disconnect', () => {
      console.error('Disconnected from server');
      window.location.reload();
      // this.restartScene();
    });

  }

  restartScene() {

    delete this.players;
    this.players = new Array().fill(0);

    while (this.levelScene.children.length > 0) {
      this.levelScene.remove(this.levelScene.children[0]);
    }

    this.initLevel();

  }


}