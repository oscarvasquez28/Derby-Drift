import * as THREE from 'three'
import Skydome from "./skydome.js";

const SUN_LIGHT_COLOR = 0xfcffb5;
const FLOOR_COLOR = 0x796B5C;

export default class World {

  constructor(){
    // Creamos la escena (mundo) que contendrá todos los objetos que se mostrarán
    this.scene = new THREE.Scene();
    
    // Creamos la cámara desde la que se verá el mundo
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Creamos el renderizador que graficará toda la lógica de three.js en nuestra página
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Creamos el skydome
    this.skydome = new Skydome(this.scene);

    this.sun = new THREE.SpotLight(SUN_LIGHT_COLOR, 1);

  }

  initWorld(){      
    const scene = this.scene;
    const camera = this.camera;
    const renderer = this.renderer;
    const sun = this.sun;
    this.skydome.initSkydome();
    
    camera.position.set(0, 1, 15);
    camera.lookAt(0, 0, 0);
    
    // Juntamos el renderizador a nuestro documento html
    document.body.appendChild(renderer.domElement);
    
    // Inicializamos la luz direccional (sol)
    sun.position.set(100, 100, 100);
    sun.target.position.set(0, 0, 0);
    sun.angle = Math.PI / 4;
    sun.penumbra = 0.1;
    sun.castShadow = true;
  
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 500;
    
    scene.add(sun);
    scene.add(sun.target);
    
    // Inicializamos la luz ambiental
    const light = new THREE.AmbientLight(0xb3b3b3);
    scene.add(light);
    
    // Inicializamos la geometría del suelo, en este caso empezamos con un plano
    function loadHeightmapTexture(filePath, onLoad) {
      const loader = new THREE.TextureLoader();
      loader.load(filePath, (texture) => {
        const canvas = document.createElement('canvas');
        canvas.width = texture.image.width;
        canvas.height = texture.image.height;
        const context = canvas.getContext('2d');
        context.drawImage(texture.image, 0, 0);
    
        const imageData = context.getImageData(0, 0, texture.image.width, texture.image.height);
        const data = imageData.data;
        const heightData = [];
    
        for (let i = 0; i < texture.image.height; i++) {
          const row = [];
          for (let j = 0; j < texture.image.width; j++) {
            const index = (i * texture.image.width + j) * 4;
            const height = data[index] / 255; // Normalizamos la altura a [0, 1]
            row.push(height);
          }
          heightData.push(row);
        }
    
        onLoad(heightData, texture.image.width, texture.image.height);
      });
    }
    
    // Función para modificar la geometría del plano basado en los datos de altura
    function applyHeightmapToGeometry(geometry, heightData, width, height) {
      const vertices = geometry.attributes.position.array;
      const widthSegments = geometry.parameters.widthSegments;
      const heightSegments = geometry.parameters.heightSegments;
    
      for (let i = 0; i <= heightSegments; i++) {
        for (let j = 0; j <= widthSegments; j++) {
          const vertexIndex = (i * (widthSegments + 1) + j) * 3;
          const x = j / widthSegments * (width - 1);
          const y = i / heightSegments * (height - 1);
          const heightValue = heightData[Math.floor(y)][Math.floor(x)];
          vertices[vertexIndex + 2] = heightValue * 10; // Escalamos la altura según sea necesario
        }
      }
    
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    
    // Cargamos la textura del mapa de altura y la aplicamos a la geometría del suelo
    loadHeightmapTexture('textures/heightmap.jpg', (heightData, width, height) => {
      const floorGeometry = new THREE.PlaneGeometry(255, 255, width - 1, height - 1);
      applyHeightmapToGeometry(floorGeometry, heightData, width, height);
    
      const floorMaterial = new THREE.MeshStandardMaterial({ color: FLOOR_COLOR });
      const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    
      // Rotamos el plano para alinearlo con el horizonte
      floorMesh.position.set(0, 0, 0);
      floorMesh.rotateX(-Math.PI / 2);
      floorMesh.rotateZ(Math.PI / 2);
      floorMesh.receiveShadow = true;
    
      scene.add(floorMesh);
    });
    
    // Manejamos el cambio del tamaño de la ventana
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }   

}
