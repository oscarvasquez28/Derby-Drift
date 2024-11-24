import Level from "./level.js";
import Socket from "./socket.js";

export default class Track extends Level {
    constructor() {
        super('./public/models/Track/TrackHeightMap.png', 2);
        this.checkpoints = [];
        this.debug = true;
        this.laps = 3;
        this.hasStarted = false;
        this.lastNumPlayers = 0;
        this.initCountdown = 10;
        this.init();
    }

    step() {
        if (!this.hasStarted && Object.keys(this.players).length > 1) {
            if (!this.countdown) {
                this.countdown = this.initCountdown;
                this.countdownInterval = setInterval(() => {
                    this.countdown--;
                    this.lastNumPlayers = Object.keys(this.players).length;
                    Socket.getIO().emit('countdown', this.countdown);
                    if (this.countdown <= 0) {
                        clearInterval(this.countdownInterval);
                        this.hasStarted = true;
                    }
                }, 1000);
            } else if (this.countdown > 0 && Object.keys(this.players).length !== this.lastNumPlayers) {
                this.countdown = this.initCountdown;
            }
        }
        else if (Object.keys(this.players).length < 2) {
            this.hasStarted = false;
            Socket.getIO().emit('countdown', this.countdown);
            clearInterval(this.countdownInterval);
            this.countdown = null;
        }
        super.step();
    }

    executePlayerInputFromJson(id, JSONinput) {
        if (!this.hasStarted) return false;
        let result = super.executePlayerInputFromJson(id, JSONinput);
        return result;
    }

    init() {
        this.world.createCircularBoundary(325, 550);
        this.createCheckpoints();
    }

    createCheckpoints() {
        const numCheckpoints = 2;
        const radius = 100;
        const angleStep = (2 * Math.PI) / numCheckpoints;
        for (let i = 0; i < numCheckpoints; i++) {
            const angle = i * angleStep;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const y = 10;
            this.checkpoints.push(this.world.createTrigger({ x, y, z }, { x: 10, y: 10, z: 10 }, this.checkpointCallback.bind(this)));
        }
    }

    getCheckpointsJson() {
        return this.checkpoints.map((checkpoint) => {
            return {
                position: checkpoint.position,
                size: checkpoint.size
            }
        });
    }

    checkpointCallback(event) {
        if (Object.values(this.players).length === 0) return;
        const player = Object.values(this.players).find(player => player.getBody().chassis === event.body);
        if (player) {
            const newCheckpointIndex = this.checkpoints.indexOf(event.trigger);
            if (newCheckpointIndex === player.getJson().currentCheckpoint) {
                player.getJson().currentCheckpoint = newCheckpointIndex + 1;
                if (newCheckpointIndex === this.checkpoints.length - 1) {
                    player.getJson().currentLap++;
                    player.getJson().currentCheckpoint = 0;
                    if (player.getJson().currentLap >= this.laps) {
                        Object.values(this.players).forEach(otherPlayer => {
                            if (otherPlayer !== player) {
                                otherPlayer.takeDamage(9000, player.getJson().name + " ha ganado la carrera");
                            }
                        });
                    }
                }
            }
        }
    }

    getDebugInfo() {
        return {
            checkpoints: this.getCheckpointsJson()
        }
    }

}