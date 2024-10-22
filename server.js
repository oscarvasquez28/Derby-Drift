import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';
import Level from './backend/level.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
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
app.get('/redirect', (_, res) => {
  res.sendFile(path.join(process.cwd(), "frontend", "index.html"));
});

app.get('/*.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/').slice(0, -1).join('/'), req.params['0'].split('/')[req.params['0'].split('/').length - 1] + ".jpg"), {
    headers: {
      'Content-Type': 'image/jpeg'
    }
  });
});

app.get('/*.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/').slice(0, -1).join('/'), req.params['0'].split('/')[req.params['0'].split('/').length - 1] + ".png"), {
    headers: {
      'Content-Type': 'image/png'
    }
  });
});

app.get('/*.obj', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/').slice(0, -1).join('/'), req.params['0'].split('/')[req.params['0'].split('/').length - 1] + ".obj"), {
    headers: {
      'Content-Type': 'model/obj'
    }
  });
});

app.get('/*.mtl', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/').slice(0, -1).join('/'), req.params['0'].split('/')[req.params['0'].split('/').length - 1] + ".mtl"), {
    headers: {
      'Content-Type': 'model/mtl'
    }
  });
});

const levels = [new Level(), new Level('./public/models/Track/TrackHeightMap.png')];

// Manejar las conexiones de socket.io
io.on('connection', (socket) => {
  console.log('User ' + socket.id + ' connected');
  socket.on('disconnect', () => {
    console.log('User ' + socket.id + ' disconnected');
    levels.forEach(level => {
      level.removePlayer(socket.id);
    });
    io.emit('playerDisconnected', socket.id);
  });

  socket.on('playerInfo', (data) => {
    if(data.id == socket.id){
      levels[data.levelId].addPlayer(data);
    }else{
      console.log('Error: id mismatch');
    }

    io.emit(
      'newPlayer',
      levels[data.levelId].getPlayerJson(socket.id),
    )

    socket.emit(
      'currentPlayers',
      levels[data.levelId].getPlayersJSON(),
    )

    socket.on('input', (inputData) => {
      levels[data.levelId].executePlayerInputFromJson(inputData.id, inputData);
    })

  });

});

function updateLevel(){
    setInterval(() => {
        levels.forEach(level => {
            level.step();
            io.emit('update', level.getPlayersJSON());
        });
    }, 1000 / FPS);
}

updateLevel();

const blue = '\x1b[34m'; // Código de color azul
const reset = '\x1b[37m'; // Código para restablecer el color a blanco

//Inciar servidor
server.listen(3000, () => {
  console.log(`listening on ${blue}http://localhost:${PORT}${reset}`);
});