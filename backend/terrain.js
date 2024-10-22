import { createCanvas, loadImage } from 'canvas';
import * as cannon from 'cannon-es';

export default class Terrain {

    constructor(world, heightmap = './public/textures/heightmap.jpg') {
        this.world = world;
        this.heightmap = heightmap ? heightmap : './public/textures/heightmap.jpg';
        this.terrain = this.initTerrain();
    }

    initTerrain() {
        return this.createComplexFloor(this.world);
    }

    // Función para cargar la textura del mapa de alturas y extraer los datos de altura
    async loadHeightmapTexture(filePath) {
        const image = await loadImage(filePath);
        const canvas = createCanvas(image.width, image.height);
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        const imageData = context.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        const matrix = [];

        for (let i = 0; i < image.height; i++) {
            const row = [];
            for (let j = 0; j < image.width; j++) {
            const index = (i * image.width + j) * 4;
            const height = (data[index] / 255) * 10; // Normalizar la altura a [0, 1]
            row.push(height);
            }
            matrix.push(row);
        }
        return matrix;
    }

    // Función principal para crear la forma del terreno y agregarla al cuerpo del suelo
    async createComplexFloor(world) {
        const heightmapPath = this.heightmap; // Reemplazar con la ruta de tu archivo de mapa de alturas
        const matrix = await this.loadHeightmapTexture(heightmapPath);
        const sideSize = 255; // Tamaño del lado
        const elementSize = 1 * sideSize / (matrix[0].length - 1); // Distancia entre puntos

        // Crear la forma del terreno
        const heightfieldShape = new cannon.Heightfield(matrix, {
            elementSize: elementSize
        });

        // Crear el cuerpo del suelo y agregar la forma del terreno
        const floor = new cannon.Body({ type: cannon.Body.STATIC, shape: heightfieldShape });

        floor.position.set(-sideSize / 2, 0, sideSize / 2); // Centrar el terreno
        floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotar el suelo -90 grados en el eje X
        world.bodies.at(0)?.pop();
        floor.id = 0;
        // Agregar el cuerpo del suelo al mundo
        world.addBody(floor);
        return floor;
    }

}
