import * as THREE from 'three';

export default class Nametag {
  constructor(player, scene) {
    this.player = player;
    this.scene = scene;

    // Create the name tag
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 1024;
    const nameContext = nameCanvas.getContext('2d');
    nameContext.font = 'Bold 50px Arial';
    nameContext.fillStyle = 'black';
    const text = this.player.name;
    const textWidth = nameContext.measureText(text).width;
    const x = (nameCanvas.width - textWidth) / 2;
    const y = nameCanvas.height / 1.2;
    nameContext.fillText(text, x, y);

    const nameTexture = new THREE.CanvasTexture(nameCanvas);
    const nameMaterial = new THREE.SpriteMaterial({ map: nameTexture });
    this.nameSprite = new THREE.Sprite(nameMaterial);
    this.nameSprite.scale.set(15, 2.5, 1);
    this.scene.add(this.nameSprite);

    // Create the health bar
    const healthCanvas = document.createElement('canvas');
    healthCanvas.width = 1024;
    healthCanvas.height = 50;
    this.healthContext = healthCanvas.getContext('2d');
    this.healthTexture = new THREE.CanvasTexture(healthCanvas);
    const healthMaterial = new THREE.SpriteMaterial({ map: this.healthTexture });
    this.healthSprite = new THREE.Sprite(healthMaterial);
    this.healthSprite.scale.set(10, 1, 1);
    this.scene.add(this.healthSprite);

    this.updateHealthBar();
  }

  update() {
    const playerPos = this.player.getPlayerPosition();
    this.nameSprite.position.set(
      playerPos.x,
      playerPos.y + 8,
      playerPos.z
    );
    this.healthSprite.position.set(
      playerPos.x,
      playerPos.y + 6,
      playerPos.z
    );

    this.updateHealthBar();
  }

  updateHealthBar() {
    const health = this.player.health;
    const missingHealth = this.player.initHealth - health;
    const maxHealth = this.player.initHealth;
    const healthPercentage = health / maxHealth;
    const missingHealthPercentage = missingHealth / maxHealth;

    this.healthContext.clearRect(0, 0, 1024, 50);
    this.healthContext.fillStyle = 'darkgreen';
    this.healthContext.fillRect(0, 0, 1024 * healthPercentage, 50);
    this.healthContext.fillStyle = 'darkred';
    this.healthContext.fillRect(1024 * healthPercentage, 0, 1024 * missingHealthPercentage, 50);
    this.healthContext.strokeStyle = 'black';
    this.healthContext.strokeRect(0, 0, 1024 , 50);

    this.healthTexture.needsUpdate = true;
  }

  remove() {
    this.scene.remove(this.nameSprite);
    this.scene.remove(this.healthSprite);
  }
}