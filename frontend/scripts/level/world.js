import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Skydome from "./skydome.js";

const SUN_LIGHT_COLOR = 0xfcffb5;
const FLOOR_COLOR = 0x796B5C;

export default class World {

  constructor(heightmapPath = 'textures/heightmap.jpg', color = FLOOR_COLOR, scale = 1) {
    // Creamos la escena (mundo) que contendrá todos los objetos que se mostrarán
    this.scene = new THREE.Scene();

    this.color = color;

    this.scale = scale;
    
    this.heightmapPath = heightmapPath;

    // Creamos la cámara desde la que se verá el mundo
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    
    // Creamos el renderizador que graficará toda la lógica de three.js en nuestra página
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.antialias = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = localStorage.getItem('showShadows') != undefined ? JSON.parse(localStorage.getItem('showShadows')) : true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Creamos el skydome
    this.skydome = new Skydome(this.scene);

    this.sun = new THREE.DirectionalLight(SUN_LIGHT_COLOR, 1);

    this.ambientLight = new THREE.AmbientLight(0xb3b3b3);
    
    // Propiedad para el ciclo día-noche
    this.elapsedTime = 30;
    this.FPS = parseFloat(localStorage.getItem('FPS')) || 60;
  }

  initWorld(){      
    const scene = this.scene;
    const camera = this.camera;
    const renderer = this.renderer;
    const sun = this.sun;
    const light = this.ambientLight;
    
    this.skydome.initSkydome();
    
    camera.position.set(0, 1, 15);
    camera.lookAt(0, 0, 0);

    // Creamos los controles orbitales de la cámara
    this.controls = new OrbitControls( camera, renderer.domElement );    
    this.skydome.camera = camera;
    
    // Juntamos el renderizador a nuestro documento html
    document.body.appendChild(renderer.domElement);
    
    // Inicializamos la luz direccional (sol)
    sun.position.set(400, 400, 400);
    sun.angle = Math.PI;
    sun.penumbra = 0.1;
    sun.castShadow = true;
  
    sun.shadow.mapSize.height = 8192;
    sun.shadow.mapSize.width = 8192;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 950;
    sun.shadow.camera.left = -1000;
    sun.shadow.camera.right = 1000;
    sun.shadow.camera.top = 1000;
    sun.shadow.camera.bottom = -1000;
    
    scene.add(sun);
    scene.add(sun.target);
    
    // Agregamos la luz ambiental
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
    function applyHeightmapToGeometry(geometry, heightData, width, height, scale = 1) {
      const vertices = geometry.attributes.position.array;
      const widthSegments = geometry.parameters.widthSegments;
      const heightSegments = geometry.parameters.heightSegments;
    
      for (let i = 0; i <= heightSegments; i++) {
      for (let j = 0; j <= widthSegments; j++) {
        const vertexIndex = (i * (widthSegments + 1) + j) * 3;
        const x = j / widthSegments * (width - 1);
        const y = i / heightSegments * (height - 1);
        const heightValue = heightData[Math.floor(y)][Math.floor(x)];
        vertices[vertexIndex] *= scale; // Scale the x position
        vertices[vertexIndex + 1] *= scale; // Scale the y position
        vertices[vertexIndex + 2] = heightValue * 10; // Scale the height as needed
      }
      }
    
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    
    // Cargamos la textura del mapa de altura y la aplicamos a la geometría del suelo
    loadHeightmapTexture(this.heightmapPath, (heightData, width, height) => {
      const floorGeometry = new THREE.PlaneGeometry(255, 255, width - 1, height - 1);
      applyHeightmapToGeometry(floorGeometry, heightData, width, height, this.scale);
      const floorMaterial = new THREE.MeshPhongMaterial({ color: this.color });
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

  setClientPlayer(player){
    this.clientPlayer = player;
    this.skydome.clientPlayer = player;
  }

  update(){
    this.skydome.update();
    if(!this.clientPlayer?.alive){
      this.controls.update();
    }

    // Actualizamos el tiempo transcurrido
    const deltaTime = 1 / this.FPS;
    this.elapsedTime += deltaTime;

    // Calculamos la intensidad del sol basado en el tiempo transcurrido
    const dayDuration = 60; // Duración de un día en segundos
    const sunIntensity = Math.abs(Math.sin((this.elapsedTime / dayDuration) * Math.PI));
    this.sun.intensity = sunIntensity;
    this.ambientLight.intensity = 0.5 + 0.5 * sunIntensity;

    // Calculamos la posición del sol basado en el tiempo transcurrido
    const sunAngle = (this.elapsedTime / dayDuration) * Math.PI;
    const sunX = 400 * Math.cos(sunAngle);
    const sunY = 400 * Math.sin(sunAngle);
    const sunZ = 400 * Math.sin(sunAngle);
    this.sun.position.set(sunX, sunY, sunZ);
    this.sun.target.position.set(0, 0, 0);
    this.sun.target.updateMatrixWorld();

    // Si el sol está por debajo del horizonte, no ilumina la escena
    if (sunY < 0) {
      this.sun.intensity = 0;
      this.ambientLight.intensity = 0.5;
      this.skydome.setColor(0x000000); // Set skydome to black
    } else {
      // Adjust skydome color based on sun intensity
      const skydomeColor = new THREE.Color(0x87CEEB).lerp(new THREE.Color(0x000000), 1 - sunIntensity);
      this.skydome.setColor(skydomeColor);
    }
  }

}
