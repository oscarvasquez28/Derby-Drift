import ObjModel from "../model.js"
import Level from './level.js';

export default class Track extends Level {

    constructor() {
        super('models/Track/TrackHeightMap.png', 0x136D15, 2);
        this.levelId = 1;
        this.initHeight = 30;
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
        
        this.Track = new ObjModel(this.levelScene, 'models/Track/Track.obj', 'models/Track/Track.mtl', false);
        
        this.Track.initModel().then((mesh) => {
          mesh.position.x = 0;
          mesh.position.y = 10;
          mesh.position.z = 0;
          mesh.scale.set(4, 4, 4);
          mesh.rotation.y = -125 * Math.PI;
        });

        this.models.push(this.dobeto);
        this.models.push(this.Track);
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