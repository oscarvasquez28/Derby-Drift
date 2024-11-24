import * as THREE from 'three';
import World from "./world.js"
import Player from "../player/player.js"
import ClientPlayer from "../player/clientPlayer.js"
import Connection from "../../connection.js"
import Missile from "../player/missile.js"
import Stats from 'three/addons/libs/stats.module.js'
import PowerUp from "./powerUp.js"
import Shield from "./shield.js"
import Ammo from "./ammo.js"
import Boost from "./boost.js"

const FPS = localStorage.getItem('FPS') * 1.5 || 60 * 1.5;

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

    this.powerUps = [];

    this.gameEnded = false;

    this.showLap = false;

    this.countdown = null;
  }

  async initLevel() {
    this.world.initWorld();

    this.defaultPlayer = {
      levelId: this.levelId,
      email: sessionStorage.getItem('userEmail') || undefined,
      name: this.#genRandomName(),
      id: null,
      health: this.playerInitHealth,
      currentCheckpoint: 0,
      currentLap: 0,
      ammo: 0,
      hasShield: false,
      hasBoost: false,
      score: 0,
      mesh: Math.random() < 0.5 ? 1 : 2,
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

    this.levelCamera = this.world.camera;

    this.levelScene = this.world.scene;

    this.levelRenderer = this.world.renderer;

    if (localStorage.getItem('showFPS') != undefined ? JSON.parse(localStorage.getItem('showFPS')) : false) {
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    }

    this.#setUpSocketEvents();

  }

  begin() {
    const fps = FPS;
    const interval = 1000 / fps;
    let lastTime = 0;

    const animate = (time) => {
      if (time - lastTime >= interval) {
        lastTime = time;
        this.update();
        this.levelRenderer.render(this.levelScene, this.levelCamera);
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  update() {

    this.world.update();
    this.stats?.update();

    if (this.clientPlayer && this.clientPlayer.alive) {
      const playerPosition = this.clientPlayer.getPlayerPosition();
      const lookAtNorm = this.clientPlayer.getPlayerNormalizedLookAt();
      this.levelCamera.position.set(playerPosition.x - (lookAtNorm.x * 2), playerPosition.y + 12, playerPosition.z - (lookAtNorm.z * 2));
      this.levelCamera.lookAt(playerPosition.x, playerPosition.y + 10, playerPosition.z);
      this.clientPlayer.update();
    }

    this.players.forEach(player => {
      player.update();
    });

    if (this.gameEnded) return;

    this.powerUps.forEach(powerUp => {
      powerUp.update();
    });

    this.projectiles.forEach(missile => {
      missile.update();
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
      newPlayer.camera = this.levelCamera;
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
      this.clientPlayer.showLap = this.showLap;
      this.clientPlayer.init();
      this.world.setClientPlayer(this.clientPlayer);
    }
  }

  #setUpSocketEvents() {

    const socket = this.socket;

    socket.on('connect', () => {

      this.defaultPlayer.id = socket.id;
      const playerInfo = this.defaultPlayer;

      socket.emit('playerInfo', playerInfo);

      socket.on('newPlayer', (player) => {
        console.log("Recieved message from server: newPlayer\nPlayer: " + player.name + " ID:" + player.id + ' connected');
        if (this.gameEnded) return;
        this.addPlayer(player);
      });

      socket.on('currentPlayers', (playersData) => {
        if (this.gameEnded) return;
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
        if (this.gameEnded) return;
        console.log("Recieved message from server: playerDestroyed\nPlayer: " + data.id + " was destroyed");
        const destroyedPlayer = this.players.find(obj => obj.id === data.id);
        if (destroyedPlayer) {
          if (destroyedPlayer.id === this.clientPlayer.player.id) {
            // alert("You have been destroyed: " + data.cause);
            this.clientPlayer.alive = false;
            this.showLostScreen(data.cause);
          }
          destroyedPlayer.removePlayer();
          this.players = this.players.filter(obj => obj.id !== destroyedPlayer.id);
          console.log("Player: " + destroyedPlayer.name + " ID:" + destroyedPlayer.id + " was removed from the scene");
        }
      });

      socket.on('playerWon', (data) => {
        if (this.gameEnded) return;
        console.log("Recieved message from server: playerWon\nPlayer: " + data.id + " won the game");
        const winningPlayer = this.players.find(obj => obj.id === data.id);
        if (winningPlayer.id === this.clientPlayer.getPlayer().id) {
          // alert("Player: " + winningPlayer.name + " ID:" + winningPlayer.id + " won the game");
          this.showWinScreen();
        }
        this.gameEnded = true;
      });

      socket.on('playerDisconnected', (id) => {
        if (this.gameEnded) return;
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
        if (this.gameEnded) return;
        // console.log("Recieved message from server: newProjectile\nRecieved new projectile from player: " + projectileData.id);
        const newProjectile = new Missile(this.levelScene, this.players.find(player => player.id === projectileData.id), this.levelCamera, projectileData.id);
        newProjectile.updateMissileFromJSON(projectileData);
        this.projectiles.push(newProjectile);
      });

      socket.on('missileCollision', (data) => {
        if (this.gameEnded) return;
        this.removeMissile(data);
      });

      socket.on('missileRemoved', (data) => {
        if (this.gameEnded) return;
        console.log("Recieved message from server: missileRemoved\nRecieved removed missile: " + data.id);
        this.removeMissile(data);
      });

      socket.on('updateMissiles', (missilesData) => {
        if (this.gameEnded) return;
        console.log("Recieved message from server: updateMissiles\nRecieved updated missiles: " + missilesData.id);
        this.updateMissiles(missilesData);
      });

      socket.on('playerCollision', (data) => {
        if (this.gameEnded) return;
        if (this.clientPlayer) {
          console.log("Recieved message from server: playerCollision\nRecieved player collision: " + data.id);
          this.clientPlayer.collided();
        }
      });

      socket.on('currentPowerUps', (data) => {
        if (this.gameEnded) return;
        console.log("Recieved message from server: currentPowerUps\nRecieved power ups: " + data);
        Object.keys(data).forEach(id => {
          if (!this.powerUps.find(powerUp => powerUp.id === id)) {
            const powerUp = data[id];
            powerUp.scene = this.levelScene;
            this.spawnPowerUp(powerUp);
          }
        });
      });

      socket.on('powerUpSpawned', (data) => {
        if (this.gameEnded) return;
        console.log("Recieved message from server: powerUpSpawned\nRecieved power up: " + data.id);
        data.scene = this.levelScene;
        this.spawnPowerUp(data);
      });

      socket.on('powerUpCollected', (data) => {
        if (this.gameEnded) return;
        const collectedPowerUp = this.powerUps.find(powerUp => powerUp.id === data.id);
        if (collectedPowerUp) {
          collectedPowerUp.destroy();
          this.powerUps = this.powerUps.filter(powerUp => powerUp.id !== data.id);
        } else {
          console.error("PowerUp with ID " + data.id + " not found in the scene");
        }
      });

      socket.on('countdown', (countdown) => {
        if (this.gameEnded) return;
        console.log("Recieved message from server: countdown\nCountdown: " + countdown);
        this.countdown = countdown;
        this.updateCountdown();
      });

      socket.on('debugInfo', (data) => {
        if (this.gameEnded) return;
        console.log("Recieved message from server: debugInfo\nRecieved debug info: " + data);
        if (data.checkpoints) {
          data.checkpoints.forEach((checkpoint, index) => {
            const isPair = index % 2 === 0;
            const geometry = new THREE.BoxGeometry(isPair ? 60 : 10, 10, isPair ? 10 : 60);
            const colorValue = 0xff0000 / (index);
            const material = new THREE.MeshBasicMaterial({ color: colorValue, transparent: true, opacity: 0.5 });
            const checkpointBox = new THREE.Mesh(geometry, material);
            checkpointBox.position.set(checkpoint.position.x, checkpoint.position.y, checkpoint.position.z);
            this.levelScene.add(checkpointBox);
          });
        }

        console.log("Recieved message from server: newCheckpoint\nRecieved new checkpoint: " + data);
      });

      socket.on('disconnect', () => {
        console.error('Disconnected from server');
        window.location.reload();
        // this.restartScene();
      });

    });

  }

  updateCountdown() {
    return true;
  }

  showLostScreen(cause = "Banned") {
    const lostScreen = document.getElementById('lost-screen');
    const spectateBtn = document.getElementById('spectate-button');
    const restartBtn = document.getElementById('restart-button');
    const homeBtn = document.getElementById('menu-button');
    const score = document.getElementById('score');
    const causeText = document.getElementById('cause');
    const highscoreText = document.getElementById('highscore');

    if (this.clientPlayer.getPlayer().email) {
      const email = this.clientPlayer.getPlayer().email;
      const score = this.clientPlayer.getPlayer().score;
      fetch('/players')
        .then(res => res.json())
        .then(data => {
          console.log(data);
          const player = data.find(player => player.email === email);
          if (this.clientPlayer.getPlayer().score > player.highscore) {
            highscoreText.style.display = 'block';
          }
        })
        .catch(err => {
          console.error(err);
        });
    }

    score.textContent = this.clientPlayer.getPlayer().score;
    causeText.textContent = cause;

    lostScreen.style.display = 'flex';
    spectateBtn.addEventListener('click', () => {
      lostScreen.style.display = 'none';
    });
    restartBtn.addEventListener('click', () => {
      this.restartScene();
      lostScreen.style.display = 'none';
      window.location.reload();
    });
    homeBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  showWinScreen() {
    const lostScreen = document.getElementById('lost-screen');
    const spectateBtn = document.getElementById('spectate-button');
    const restartBtn = document.getElementById('restart-button');
    const homeBtn = document.getElementById('menu-button');
    const score = document.getElementById('score');
    const causeText = document.getElementById('cause');
    const lostScreenText = document.getElementById('lost-screen-message');
    const highscoreText = document.getElementById('highscore');
    lostScreenText.textContent = "¡Ganaste!";

    if (this.clientPlayer.getPlayer().email) {
      const email = this.clientPlayer.getPlayer().email;
      const score = this.clientPlayer.getPlayer().score + 1;
      fetch('/players')
        .then(res => res.json())
        .then(data => {
          console.log(data);
          const player = data.find(player => player.email === email);
          if (score > player.highscore) {
            highscoreText.hidden = false;
          }
        })
        .catch(err => {
          console.error(err);
        });
    }

    score.textContent = this.clientPlayer.getPlayer().score + 1;

    lostScreen.style.display = 'flex';
    spectateBtn.hidden = true;
    restartBtn.addEventListener('click', () => {
      this.restartScene();
      lostScreen.style.display = 'none';
      window.location.reload();
    });
    homeBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  spawnPowerUp(powerUpData) {
    powerUpData.scene = this.levelScene;

    let powerUp;

    switch (powerUpData.type) {
      case 'ammo':
        powerUp = new Ammo(powerUpData);
        break;
      case 'shield':
        powerUp = new Shield(powerUpData);
        break;
      case 'boost':
        powerUp = new Boost(powerUpData);
        break;
      default:
        powerUp = new PowerUp(powerUpData);
        break;
    }
    this.powerUps.push(powerUp);

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