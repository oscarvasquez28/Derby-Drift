import express from 'express';
import bodyParser from 'body-parser';
import Database from './backend/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Socket from './backend/socket.js';
import http from 'http';
import Colosseum from './backend/colosseum.js';
import Track from './backend/track.js';
import Mountain from './backend/mountain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const FPS = 500;

const app = express();

const server = http.createServer(app);
Socket.initSocket(server);
const io = Socket.getIO();

// Configuración de la base de datos MySQL
const db = Database.initConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'derbyDrift',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Definir ruta del servidor
app.get('/redirect', (_, res) => {
  res.sendFile(path.join(process.cwd(), "frontend", "index.html"));
});

// Ruta para obtener datos desde MySQL
app.get('/players', (req, res) => {
  db.query('SELECT * FROM players ORDER BY highscore DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/setHighscore', async (req, res) => {
  console.log(req);
  const { email, name, highscore } = req.body;

  if (!email || !name || !highscore) {
    return res.status(400).json({ error: 'Email, name, and highscore are required' });
  }

  try {
    const [results] = await pool.query('SELECT * FROM players WHERE email = ?', [email]);

    if (results.length > 0) {
      const player = results[0];
      if (player.highscore >= parseInt(highscore)) {
        return res.json({ message: 'Highscore not updated' });
      } else {
        await pool.query('UPDATE players SET highscore = ? WHERE email = ?', [highscore, email]);
        res.json({ message: 'Highscore updated successfully' });
      }
    } else {
      await pool.query('INSERT INTO players (email, name, highscore) VALUES (?, ?, ?)', [email, name, highscore]);
      res.json({ message: 'Player created and highscore set successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/*.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/').slice(0, -1).join('/'), req.params['0'].split('/')[req.params['0'].split('/').length - 1] + ".jpg"), {
    headers: {
      'Content-Type': 'image/jpeg'
    }
  });
});

app.get('/*.glb', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params['0'].split('/').slice(0, -1).join('/'), req.params['0'].split('/')[req.params['0'].split('/').length - 1] + ".glb"), {
    headers: {
      'Content-Type': 'model/glb'
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

const levels = [new Colosseum(), new Track(), new Mountain()];

// Manejar las conexiones de socket.io
io.on('connection', (socket) => {
  console.log('User ' + socket.id + ' connected');
  socket.on('disconnect', () => {
    console.log('User ' + socket.id + ' disconnected');
    let levelId = -1;
    levels.forEach(level => {
      levelId = level.getPlayerJson(socket.id)?.levelId??levelId;
      level.removePlayer(socket.id);
    });
    
    io.emit('playerDisconnected', socket.id);
    
    if (levelId == 1) {
      io.emit(
        'countdown',
        null,
      )
    }

  });

  socket.on('playerInfo', (data) => {
    if (data.id == socket.id) {
      levels[data.levelId].addPlayer(data);
    } else {
      console.log('Error: id mismatch');
    }

    io.emit(
      'newPlayer',
      levels[data.levelId].getPlayerJson(socket.id),
    )

    if (levels[data.levelId].debug) {
      socket.emit(
        'debugInfo',
        levels[data.levelId].getDebugInfo(),
      )
    }

    if (data.levelId == 1) {
      socket.emit(
        'countdown',
        levels[data.levelId].countdown,
      )
    }

    socket.emit(
      'currentPlayers',
      levels[data.levelId].getPlayersJSON(),
    )

    socket.emit(
      'currentProjectiles',
      levels[data.levelId].getLevelProjectilesJSON(),
    )

    socket.emit(
      'currentPowerUps',
      levels[data.levelId].getActivePowerUpsJSON(),
    )

    socket.on('input', (inputData) => {
      levels[data.levelId].executePlayerInputFromJson(inputData.id, inputData);
    })

  });

});

function updateLevel() {
  setInterval(() => {
    levels.forEach(level => {
      level.step();
      io.emit('update', level.getPlayersJSON());
      if(level.ai)
        io.emit('updateAI', level.ai.getJsonData());
    });
  }, 1000 / FPS);
}

updateLevel();

const blue = '\x1b[34m'; // Código de color azul
const reset = '\x1b[37m'; // Código para restablecer el color a blanco

//Inciar servidor
server.listen(PORT, () => {
  console.log(`listening on ${blue}http://localhost:${PORT}${reset}`);
});