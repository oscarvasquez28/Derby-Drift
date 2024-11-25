import ObjModel from "../model.js"
import Level from './level.js';

export default class Mountain extends Level {

    constructor() {
        super('models/ExplorableWorld/HeightMap.png', 0x796B5C, 3);
        this.levelId = 2;
        this.initHeight = 30;
    }

    async initLevel() {
        super.initLevel();
        
        this.defaultPlayer.position.chassis.x = Math.random() * 300 - 150;
        this.defaultPlayer.position.chassis.z = Math.random() * 300 - 150;

        // Inicializar con valores por defecto
        // this.dobeto = new ObjModel(this.levelScene, 'models/PORFAVOR.obj', 'models/PORFAVOR.mtl');
    
        // Inicializar con rotación y posición en personalizadas
        this.dobeto = new ObjModel(this.levelScene, 'models/PORFAVOR.obj', 'models/PORFAVOR.mtl', false);
        await this.dobeto.initModel().then((mesh) => {
          mesh.position.y = 50;
          mesh.position.x = -350;
          mesh.position.z = -350;
          mesh.scale.set(50, 50, 50);
          mesh.rotation.y = -125 * Math.PI / 180;
        });
        
        this.worldMesh = new ObjModel(this.levelScene, 'models/ExplorableWorld/World.obj', 'models/ExplorableWorld/World.mtl', false);
        this.worldMesh.initModel().then((mesh) => {
          mesh.position.x = 5;
          mesh.position.y = 9;
          mesh.position.z = -8;
          mesh.scale.set(4.5, 4.5, 4.5);
        });
    
        this.models.push(this.dobeto);
        this.models.push(this.worldMesh);
    }

    update() {
        super.update();

        // Manejar modelos
        if (this.dobeto.isLoaded()){
          // this.dobeto.mesh.rotation.y += 0.01;
          // this.dobeto.mesh.position.y += 0.01;
        }
    }

}