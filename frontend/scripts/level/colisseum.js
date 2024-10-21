import ObjModel from "../model.js"
import Level from './level.js';

export default class Colisseum extends Level {

    constructor() {
        super('textures/heightmap.jpg');
    }

    async initLevel() {
        super.initLevel();
        
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
        this.models.push(this.colliseum.rails);
        this.models.push(this.colliseum.seats);
        this.models.push(this.colliseum.walls);
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