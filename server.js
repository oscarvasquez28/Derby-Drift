import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import Socket from './backend/socket.js';
import http from 'http';
import Level from './backend/level.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const FPS = 400;

const app = express();

const server = http.createServer(app);
Socket.initSocket(server);
const io = Socket.getIO();

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost:3306',
  user: 'root',
  password: '',
  database: 'derbyDrift'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL with id ' + db.threadId);
});

app.use(express.static(path.join(__dirname, 'frontend')));

// Definir ruta del servidor
app.get('/redirect', (_, res) => {
  res.sendFile(path.join(process.cwd(), "frontend", "index.html"));
});

// Ruta para obtener datos desde MySQL
app.get('/players', (req, res) => {
  db.query('SELECT * FROM players', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/setHighscore', (req, res) => {
  const { email, name, highscore } = req.body;

  if (!email || !name || !highscore) {
    return res.status(400).json({ error: 'Email, name, and highscore are required' });
  }

  db.query('SELECT * FROM players WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      db.query('UPDATE players SET highscore = ? WHERE email = ?', [highscore, email], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Highscore updated successfully' });
      });
    } else {
      db.query('INSERT INTO players (email, name, highscore) VALUES (?, ?, ?)', [email, name, highscore], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Player created and highscore set successfully' });
      });
    }
  });
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

const levelEnum = {
  0: 'colliseum',
  1: 'track',
}

const levels = [new Level(null, 3), new Level('./public/models/Track/TrackHeightMap.png', 2)];

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