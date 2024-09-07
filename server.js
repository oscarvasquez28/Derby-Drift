const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;

const Server = require('socket.io').Server;
const http = require('http');
const cannon = require('cannon-es');
const { createCanvas, loadImage } = require('canvas');
const FPS = 60;

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: "*",
    },
});

app.use(express.static(path.join(__dirname, 'frontend')));

// Definir ruta del servidor
app.get('/redirect', (req, res) => {
  res.sendFile(path.join(process.cwd(), "frontend", "index.html"));
});

app.get('/*.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/')[0], req.params['0'].split('/')[1] + ".jpg"), {
    headers: {
      'Content-Type': 'image/jpeg'
    }
  });
});

app.get('/*.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/')[0], req.params['0'].split('/')[1] + ".png"), {
    headers: {
      'Content-Type': 'image/png'
    }
  });
});

app.get('/*.obj', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/')[0], req.params['0'].split('/')[1] + ".obj"), {
    headers: {
      'Content-Type': 'model/obj'
    }
  });
});

app.get('/*.mtl', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/')[0], req.params['0'].split('/')[1] + ".mtl"), {
    headers: {
      'Content-Type': 'model/mtl'
    }
  });
});

// Inicializar las variables del mundo de juego
let players = {};
let cannonPlayerBody = {};
const PLAYER_MAX_SPEED = 100;
const PLAYER_ACCELERATION = 50;
const PLAYER_JUMP_HEIGHT = 10;

// Inicializar mundo de cannon js
const world = new cannon.World();
world.broadphase = new cannon.NaiveBroadphase();
world.gravity.set(0, -9.82, 0);
world.solver.iterations = 10;
world.defaultContactMaterial.contactEquationStiffness = 1e9;
world.defaultContactMaterial.contactEquationRegularizationTime = 4;

function createPlayerBody(player) {
    const shape = new cannon.Box(new cannon.Vec3(1, 1, 1));
    // const shape = new cannon.Sphere(1);
    const body = new cannon.Body({ 
      mass: 1, 
      shape: shape, 
      linearDamping: 0.9, 
      angularDamping: 0.9,
      position: new cannon.Vec3(player.position.x, player.position.y, player.position.z)
    });
    return body;
}

// Manejar las conexiones de socket.io
io.on('connection', (socket) => {
  console.log('User ' + socket.id + ' connected');
  socket.on('disconnect', () => {
    console.log('User ' + socket.id + ' disconnected');
    delete players[socket.id];
    delete cannonPlayerBody[socket.id];
    io.emit('playerDisconnected', socket.id);
  });

  players[socket.id] = {
    "name": 'tests',
    "color": 0xFFFFFF * Math.random(),
    "id" : socket.id,
    // "position":  {x: 20 * Math.random() - 10, y: 5 * Math.random() + 20, z: 5 * Math.random()} ,
    "position":  {x: 0, y: 15, z: 0} ,
  }

  cannonPlayerBody[socket.id] = {};

  cannonPlayerBody[socket.id].body = createPlayerBody(players[socket.id]);
  world.addBody(cannonPlayerBody[socket.id].body);

  io.emit(
    'newPlayer', 
    players[socket.id],
  )

  socket.emit(
    'currentPlayers', 
    players,
  )

  socket.on('input', (data) => {

    const playerBody = cannonPlayerBody[data.id];
    const force = new cannon.Vec3();
    const forcePosition = new cannon.Vec3(0, 0, 0);
    const jumpImpulse = new cannon.Vec3(0, PLAYER_JUMP_HEIGHT, 0);

    if (playerBody?.body){
      if (data.inputs.up) playerBody.body.velocity.z > -PLAYER_MAX_SPEED ? force.z = -PLAYER_ACCELERATION : playerBody.body.velocity.z = -PLAYER_MAX_SPEED;
      if (data.inputs.down) playerBody.body.velocity.z < PLAYER_MAX_SPEED ? force.z = PLAYER_ACCELERATION : playerBody.body.velocity.z = PLAYER_MAX_SPEED;
      if (data.inputs.left) playerBody.body.velocity.x > -PLAYER_MAX_SPEED ? force.x = -PLAYER_ACCELERATION : playerBody.body.velocity.x = -PLAYER_MAX_SPEED;
      if (data.inputs.right) playerBody.body.velocity.x < PLAYER_MAX_SPEED ? force.x = PLAYER_ACCELERATION : playerBody.body.velocity.x = PLAYER_MAX_SPEED;
      if (data.inputs.jump && playerBody.body.velocity.y <= 0.1 && playerBody.body.position.y <= 2) playerBody.body.applyImpulse(jumpImpulse, forcePosition);
      playerBody.body.applyForce(force, forcePosition);
      

      console.log('Player ' + data.id + ' moved');
      console.log('Player\'s new X: ' + players[data.id].position.x);
      console.log('Player\'s new Y: ' + players[data.id].position.y);
      console.log('Player\'s new Z: ' + players[data.id].position.z);
    } else{
      console.error('The player that submitted the input does not exist!');
    }

      
  
  })

});

function quaternionToEuler(q) {
  const ysqr = q.y * q.y;

  const t0 = 2.0 * (q.w * q.x + q.y * q.z);
  const t1 = 1.0 - 2.0 * (q.x * q.x + ysqr);
  const roll = Math.atan2(t0, t1);

  let t2 = 2.0 * (q.w * q.y - q.z * q.x);
  t2 = t2 > 1.0 ? 1.0 : t2;
  t2 = t2 < -1.0 ? -1.0 : t2;
  const pitch = Math.asin(t2);

  const t3 = 2.0 * (q.w * q.z + q.x * q.y);
  const t4 = 1.0 - 2.0 * (ysqr + q.z * q.z);
  const yaw = Math.atan2(t3, t4);

  return {
      x: roll,
      y: pitch,
      z: yaw
  };
}

// Función para cargar la textura del mapa de alturas y extraer los datos de altura
async function loadHeightmapTexture(filePath) {
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
async function createComplexFloor(world) {
  const heightmapPath = './public/textures/heightmap.jpg'; // Reemplazar con la ruta de tu archivo de mapa de alturas
  const matrix = await loadHeightmapTexture(heightmapPath);
  const sideSize = 255; // Tamaño del lado
  const elementSize = 1 *  sideSize / (matrix[0].length - 1); // Distancia entre puntos

  // Crear la forma del terreno
  const heightfieldShape = new cannon.Heightfield(matrix, {
    elementSize: elementSize
  });

  floorShape = heightfieldShape;

  // Crear el cuerpo del suelo y agregar la forma del terreno
  const floor = new cannon.Body({ type: cannon.Body.STATIC, shape: heightfieldShape });

  floor.position.set(-sideSize / 2, 0, sideSize / 2); // Centrar el terreno
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotar el suelo -90 grados en el eje X

  // Agregar el cuerpo del suelo al mundo
  world.addBody(floor);
}

// Actualizar las físicas
function updatePhysics(world) {
  setInterval(() => {
      world.step(1 / FPS);// Avanzar el mundo de cannon js

      for (const id in players) {
          const player = players[id];
          player.position = cannonPlayerBody[player.id].body.position;
          player.rotation = quaternionToEuler(cannonPlayerBody[player.id].body.quaternion);
      }

      io.emit('update', players);
  }, 1000 / FPS);
}

const floor = createComplexFloor(world);
updatePhysics(world);

//Inciar servidor
server.listen(3000, () => {
  console.log('listening on *:3000');
});