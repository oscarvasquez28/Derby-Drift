import ObjModel from "../model.js"
import Level from './level.js';

export default class Colosseum extends Level {

    constructor() {
        super('textures/heightmap.jpg', 0x796B5C, 3);
        this.levelId = 0;
    }

    async initLevel() {
        super.initLevel();
        
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
    
        const scale = 10;        

        this.colosseum = {
          rails: new ObjModel(this.levelScene, 'models/Colliseum/ColliseumRails.obj', 'models/Colliseum/ColliseumRails.mtl', false),
          seats: new ObjModel(this.levelScene, 'models/Colliseum/ColliseumSeats.obj', 'models/Colliseum/ColliseumSeats.mtl', false),
          walls: new ObjModel(this.levelScene, 'models/Colliseum/ColliseumWalls.obj', 'models/Colliseum/ColliseumWalls.mtl', false),
        }
    
        this.colosseum.rails.initModel().then((mesh) => {
          mesh.position.x = 30;
          mesh.position.y = 13;
          mesh.position.z = 0;
          mesh.scale.set(scale, scale, scale);
        });
        this.colosseum.seats.initModel().then((mesh) => {
          mesh.position.x = 30;
          mesh.position.y = 13;
          mesh.position.z = 0;
          mesh.scale.set(scale, scale, scale);
        });
        this.colosseum.walls.initModel().then((mesh) => {
          mesh.position.x = 30;
          mesh.position.y = 13;
          mesh.position.z = 0;
          mesh.scale.set(scale, scale, scale);
        });
    
        this.models.push(this.dobeto);
        this.models.push(this.colosseum.rails);
        this.models.push(this.colosseum.seats);
        this.models.push(this.colosseum.walls);
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