import World from "./world.js"
import Player from "../player/player.js"
import ClientPlayer from "../player/clientPlayer.js"
import Connection from "../../connection.js"
import Missile from "../player/Missile.js"

const FPS = localStorage.getItem('FPS') || 60;

export default class Level {

  constructor(heightMapPath = null, color = null, worldScale = 1) {
    this.world = new World(heightMapPath, color, worldScale);

    this.players = new Array().fill(0);

    this.models = new Array().fill(0);

    this.socket = Connection.getConnection();

    this.clientPlayer = null;

    this.levelId = -1;

    this.playerInitHealth = 100;

    this.initHeight = 10;

    this.projectiles = [];
  }

  async initLevel() {
    this.world.initWorld();

    this.levelCamera = this.world.camera;

    this.levelScene = this.world.scene;

    this.levelRenderer = this.world.renderer;

    this.#setUpSocketEvents();

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

    this.world.update();

    if (this.clientPlayer) {
      const playerPosition = this.clientPlayer.getPlayerPosition();
      const lookAtNorm = this.clientPlayer.getPlayerNormalizedLookAt();
      this.levelCamera.position.set(playerPosition.x - (lookAtNorm.x * 2), playerPosition.y + 12, playerPosition.z - (lookAtNorm.z * 2));
      this.levelCamera.lookAt(playerPosition.x, playerPosition.y + 10, playerPosition.z );
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

    if (newPlayer.levelId !== this.levelId) {
      return;
    }

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
      this.world.skydome.clientPlayer = this.clientPlayer;
    }
  }

  #setUpSocketEvents(){

    const socket = this.socket;

    socket.on('connect', () => {

      const playerInfo = {
        levelId: this.levelId,
        name: this.#genRandomName(),
        id: socket.id,
        health: this.playerInitHealth,
        score: 0,
        mesh: Math.random() < 0.5 ? 1 : undefined,
        position: {
        chassis: { x: 0, y: this.initHeight, z: 0 },
        wheels: {
              frontLeft: { x: 0, y: 0, z: 0 },
              frontRight: { x: 0, y: 0, z: 0 },
              backLeft: { x: 0, y: 0, z: 0 },
              backRight: { x: 0, y: 0, z: 0 }
          }
        },
        rotation: {
          chassis: { x: 0, y: 0, z: 0, w: 0 },
          wheels: {
              frontLeft: { x: 0, y: 0, z: 0, w: 0 },
              frontRight: { x: 0, y: 0, z: 0, w: 0 },
              backLeft: { x: 0, y: 0, z: 0, w: 0 },
              backRight: { x: 0, y: 0, z: 0, w: 0 }
          }
        }
      };

      socket.emit('playerInfo', playerInfo);

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
            console.error("Recieved message from server: currentPlayers\nPlayer: " + playersData[id].name + " ID:" + id + " is already in the scene");
          }
        });
      });

      socket.on('playerDestroyed', (data) => {
        console.log("Recieved message from server: playerDestroyed\nPlayer: " + data.id + " was destroyed");
        const destroyedPlayer = this.players.find(obj => obj.id === data.id);
        if (destroyedPlayer) {
          if (destroyedPlayer.id === this.clientPlayer.player.id) {
            alert("You have been destroyed");
            this.clientPlayer = null;
          }
          destroyedPlayer.removePlayer();
          this.players = this.players.filter(obj => obj.id !== destroyedPlayer.id);
          console.log("Player: " + destroyedPlayer.name + " ID:" + destroyedPlayer.id + " was removed from the scene");
        }
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
            console.error("Recieved message from server: update\nPlayer " + id + " is not in the scene");
          }
        });
      });

      socket.on('newProjectile', (projectileData) => {
        // console.log("Recieved message from server: newProjectile\nRecieved new projectile from player: " + projectileData.id);
        const newProjectile = new Missile(this.levelScene, this.players.find(player => player.id === projectileData.id), projectileData.id);
        newProjectile.updateMissileFromJSON(projectileData);
        this.projectiles.push(newProjectile);
      });

      socket.on('missileCollision', (data) => {
        this.removeMissile(data);
      });

      socket.on('missileRemoved', (data) => {
        console.log("Recieved message from server: missileRemoved\nRecieved removed missile: " + data.id);
        this.removeMissile(data);
      });

      socket.on('updateMissiles', (missilesData) => {
        console.log("Recieved message from server: updateMissiles\nRecieved updated missiles: " + missilesData.id);
        this.updateMissiles(missilesData);
      });

      socket.on('playerCollision', (data) => {
        if (this.clientPlayer){
          console.log("Recieved message from server: playerCollision\nRecieved player collision: " + data.id);
          this.clientPlayer.collided();
        }
      });

      socket.on('disconnect', () => {
        console.error('Disconnected from server');
        window.location.reload();
        // this.restartScene();
      });

    });

  }

  updateMissiles(missilesData) {
    Object.keys(missilesData).forEach(id => {
      const missileData = missilesData[id];
      const missile = this.projectiles.find(missile => missile.id === missileData.id);
      if (missile) {
        missile.updateMissileFromJSON(missileData);
      }
      else {
        console.error("Recieved message from server: updateMissiles\nMissile " + missileData.id + " is not in the scene");
      }
    });
  }

  removeMissile(data) {
    const removingMissile = this.projectiles.find(missile => missile.id === data.id);
    if (removingMissile) {
      removingMissile.removeMissile();
      this.projectiles = this.projectiles.filter(missile => missile.id !== data.id);
    }
    else {
      console.error("There was an error removing the a missile\nMissile " + data.id + " is not in the scene");
    }
  }

  #genRandomName() {
    const userName = sessionStorage.getItem('userName');
    if (userName) {
      return userName;
    }
    const names = [
      "SmashMaster", "CrashKing", "DerbyDominator", "WreckWizard",
      "BumperBasher", "FenderBender", "GrillCrusher", "HoodHammer",
      "TireTerror", "AxleAnnihilator", "RimRipper", "ChassisCrusher"
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return randomName;
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