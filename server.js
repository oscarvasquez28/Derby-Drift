const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;

const Server = require('socket.io').Server;
const http = require('http');
const cannon = require('cannon-es');
const { createCanvas, loadImage } = require('canvas');
const FPS = 144;

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
const PLAYER_MAX_SPEED = 1000;
const PLAYER_WEGIHT = 150;
const PLAYER_WHEEL_WEGIHT = 1;
const MAX_STEER_VALUE = Math.PI / 8;
// const PLAYER_ACCELERATION = 500;
// const PLAYER_JUMP_HEIGHT = 10;

// Inicializar mundo de cannon js
const world = new cannon.World();
world.broadphase = new cannon.NaiveBroadphase();
world.gravity.set(0, -9.82 * 2, 0);
world.defaultContactMaterial.friction = 0;

var groundMaterial = new cannon.Material("groundMaterial");
var wheelMaterial = new cannon.Material("wheelMaterial");
var wheelGroundContactMaterial = new cannon.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
});

// We must add the contact materials to the world
world.addContactMaterial(wheelGroundContactMaterial);

function createPlayerCar(player) {
  const shape = new cannon.Box(new cannon.Vec3(4, 0.5, 2));
  // const shape = new cannon.Sphere(1);
  const carBody = new cannon.Body({
    mass: PLAYER_WEGIHT,
    shape: shape,
    position: new cannon.Vec3(player.position.chassis.x, player.position.chassis.y, player.position.chassis.z)
  });

  carBody.angularVelocity.set(0, 0, 0.5);

  const vehicle = new cannon.RaycastVehicle({ chassisBody: carBody, });

  addWheelsToVehicle(vehicle, -1.0, 1);

  vehicle.addToWorld(world);

  const body = {
    vehicle: vehicle,
    chassis: vehicle.chassisBody,
    wheels: {
      frontLeft: vehicle.getWheelTransformWorld(0),
      frontRight: vehicle.getWheelTransformWorld(1),
      backLeft: vehicle.getWheelTransformWorld(2),
      backRight: vehicle.getWheelTransformWorld(3),
    },
  }

  return body;
}

function addWheelsToVehicle(vehicle, wheelHeight = 0, wheelRadius = 0.5) {

  var options = {
    radius: wheelRadius,
    directionLocal: new cannon.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence:  0.01,
    axleLocal: new cannon.Vec3(0, 0, 1),
    chassisConnectionPointLocal: new cannon.Vec3(1, 1, 0),
    maxSuspensionTravel: 9999,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
  }

  options.chassisConnectionPointLocal.set(4, wheelHeight, 2);
  vehicle.isFrontWheel = true;
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(4, wheelHeight, -2);
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(-4, wheelHeight, -2);
  vehicle.isFrontWheel = false;
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(-4, wheelHeight, 2);
  vehicle.addWheel(options);
}

// Manejar las conexiones de socket.io
io.on('connection', (socket) => {
  console.log('User ' + socket.id + ' connected');
  socket.on('disconnect', () => {
    console.log('User ' + socket.id + ' disconnected');
    delete players[socket.id];
    cannonPlayerBody[socket.id].vehicle.vehicle.removeFromWorld(world);
    delete cannonPlayerBody[socket.id];
    io.emit('playerDisconnected', socket.id);
  });

  players[socket.id] = {
    "name": 'tests',
    "color": 0xFFFFFF * Math.random(),
    "id": socket.id,
    // "position":  {x: 20 * Math.random() - 10, y: 5 * Math.random() + 20, z: 5 * Math.random()} ,
    "position": {
      chassis: { x: 0, y: 20, z: 0 },
      wheels: {
        frontLeft: { x: 0, y: 0, z: 0 },
        frontRight: { x: 0, y: 0, z: 0 },
        backLeft: { x: 0, y: 0, z: 0 },
        backRight: { x: 0, y: 0, z: 0 }
      }
    },
    "rotation": {
      chassis: { x: 0, y: 0, z: 0, w: 0 },
      wheels: {
        frontLeft: { x: 0, y: 0, z: 0, w: 0 },
        frontRight: { x: 0, y: 0, z: 0, w: 0 },
        backLeft: { x: 0, y: 0, z: 0, w: 0 },
        backRight: { x: 0, y: 0, z: 0, w: 0 },
      }
    }
  }

  cannonPlayerBody[socket.id] = {};

  cannonPlayerBody[socket.id].vehicle = createPlayerCar(players[socket.id]);

  io.emit(
    'newPlayer',
    players[socket.id],
  )

  socket.emit(
    'currentPlayers',
    players,
  )

  socket.on('input', (data) => {
    runInputsFromJSON(data);
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
  const elementSize = 1 * sideSize / (matrix[0].length - 1); // Distancia entre puntos

  // Crear la forma del terreno
  const heightfieldShape = new cannon.Heightfield(matrix, {
    elementSize: elementSize
  });

  floorShape = heightfieldShape;

  // Crear el cuerpo del suelo y agregar la forma del terreno
  const floor = new cannon.Body({ type: cannon.Body.STATIC, shape: heightfieldShape });

  floor.position.set(-sideSize / 2, 0, sideSize / 2); // Centrar el terreno
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotar el suelo -90 grados en el eje X
  world.bodies.at(0)?.pop();
  floor.id = 0;
  // Agregar el cuerpo del suelo al mundo
  world.addBody(floor);
}

// Actualizar las físicas
function updatePhysics(world) {
  setInterval(() => {
    world.step(1 / FPS);// Avanzar el mundo de cannon js

    for (const id in players) {
      const player = players[id];
      player.position.chassis = cannonPlayerBody[player.id].vehicle.chassis.position;
      player.position.wheels.frontLeft = cannonPlayerBody[player.id].vehicle.wheels.frontLeft.position;
      player.position.wheels.frontRight = cannonPlayerBody[player.id].vehicle.wheels.frontRight.position;
      player.position.wheels.backLeft = cannonPlayerBody[player.id].vehicle.wheels.backLeft.position;
      player.position.wheels.backRight = cannonPlayerBody[player.id].vehicle.wheels.backRight.position;
      player.rotation.chassis = cannonPlayerBody[player.id].vehicle.chassis.quaternion;
      player.rotation.wheels.frontLeft = cannonPlayerBody[player.id].vehicle.wheels.frontLeft.quaternion;
      player.rotation.wheels.frontRight = cannonPlayerBody[player.id].vehicle.wheels.frontRight.quaternion;
      player.rotation.wheels.backLeft = cannonPlayerBody[player.id].vehicle.wheels.backLeft.quaternion;
      player.rotation.wheels.backRight = cannonPlayerBody[player.id].vehicle.wheels.backRight.quaternion;
    }

    io.emit('update', players);
  }, 1000 / FPS);
}

const floor = createComplexFloor(world);
updatePhysics(world);

function getDirectionFromKeyboardInput(inputs) {
  const direction = new cannon.Vec3();
  if (inputs.left) direction.z += 1;
  if (inputs.right) direction.z += -1;
  if (inputs.down) direction.x += -1;
  if (inputs.up) direction.x += 1;
  return direction;
}

function getDirectionFromGamepadInput(inputs) {
  const direction = new cannon.Vec3();
  if (inputs.axes[1] < -0.1) direction.z += -1;
  if (inputs.axes[1] > 0.1) direction.z += 1;
  if (inputs.axes[0] < -0.1) direction.x += -1;
  if (inputs.axes[0] > 0.1) direction.x += 1;
  return direction;
}

function runInputsFromJSON(data) {

  const vehicle = cannonPlayerBody[data.id]?.vehicle.vehicle;
  let direction = data.type === 'gamepad' ? getDirectionFromGamepadInput(data.inputs) : getDirectionFromKeyboardInput(data.inputs);
  const force = new cannon.Vec3();
  const forcePosition = new cannon.Vec3(0, 0, 0);
  // const jumpImpulse = new cannon.Vec3(0, PLAYER_JUMP_HEIGHT, 0);

  if (vehicle) {
    if (direction.z < 0) vehicle.setSteeringValue(-MAX_STEER_VALUE, 0), vehicle.setSteeringValue(-MAX_STEER_VALUE, 1);
    else if (direction.z > 0) vehicle.setSteeringValue(MAX_STEER_VALUE, 0), vehicle.setSteeringValue(MAX_STEER_VALUE, 1);
    else vehicle.setSteeringValue(0, 0), vehicle.setSteeringValue(0, 1);
    if (direction.x < 0) {
      vehicle.applyEngineForce(-PLAYER_MAX_SPEED, 0);
      vehicle.applyEngineForce(-PLAYER_MAX_SPEED, 1);
    }
    else if (direction.x > 0) {
      vehicle.applyEngineForce(PLAYER_MAX_SPEED, 0);
      vehicle.applyEngineForce(PLAYER_MAX_SPEED, 1);
    }
    else vehicle.applyEngineForce(0, 0), vehicle.applyEngineForce(0, 1);
  } else {
    console.error('The player that submitted the input does not exist!');
  }

}

const blue = '\x1b[34m'; // Código de color azul
const reset = '\x1b[37m'; // Código para restablecer el color a blanco

//Inciar servidor
server.listen(3000, () => {
  console.log(`listening on ${blue}http://localhost:${PORT}${reset}`);
});