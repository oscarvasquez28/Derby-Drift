import Level from "./level.js";
import Socket from "./socket.js";
import AI from "./ai.js";

export default class Track extends Level {
    constructor() {
        // super('./public/models/Track/TrackHeightMap.png', 2);
        super('./public/textures/TrackHeightmap.png', 6);
        this.checkpoints = [];
        this.boxCollisions = [];
        this.sphereCollisions = [];
        this.ai = null;
        this.debug = false;
        this.laps = 3;
        this.hasStarted = false;
        this.TimeBetweenPowerUp = 5;
        this.lastNumPlayers = 0;
        this.initCountdown = 11;
        this.init();
    }

    step() {
        if (!this.hasStarted && Object.keys(this.players).length >= 2) {
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
            clearInterval(this.countdownInterval);
            this.countdown = null;
        }
        super.step();
        this.ai.update();
    }

    executePlayerInputFromJson(id, JSONinput) {
        if (!this.hasStarted) return false;
        let result = super.executePlayerInputFromJson(id, JSONinput);
        return result;
    }

    init() {
        // this.world.createCircularBoundary(325, 550);
        this.ai = new AI(this);
        this.createCheckpoints();
        this.createCollisions();
    }

    createCollisions() {
        this.boxCollisions.push(this.world.createCollisionBox({ x: -5, y: 0, z: 4 }, { x: 60, y: 10, z: 50}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: 150.79805503052074,
            y: 1.9277551449282462,
            z: 4.469723338616328
        }, { x: 80, y: 20, z: 50}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: -161.82016756852627,
            y: 1.9285579288985872,
            z: -0.8528500025085852
        }, { x: 80, y: 20, z: 60}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: 14.306935941748135,
            y: 1.9361880916840117,
            z: 112.06447552269364
        }, { x: 750, y: 100, z: 1}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: -2.765689678679029,
            y: 1.9442294043224613,
            z: -116.00879150452091
        }, { x: 750, y: 100, z: 1}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: 377.7650181799714,
            y: 1.9556531996241338,
            z: -6.883227161710862
        }, { x:1, y: 100, z: 225}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: -375.22885446718794,
            y: 1.9468755638128266,
            z: 2.1248737767451638
        }, { x:1, y: 100, z: 225}));

        this.boxCollisions.push(this.world.createCollisionBox({
            x: 320.6657487284849,
            y: 1.9334692438027425,
            z: 105.47632131982284
        }, { x:50, y: 100, z: 10}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: 366.8435615696857,
            y: 1.9296575744795632,
            z: 74.9487894552122
        }, { x:20, y: 100, z: 50}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: 347.68567206745576,
            y: 1.9441256902434172,
            z: 91.71008190795466
        }, { x:20, y: 100, z: 20}));
        
        this.boxCollisions.push(this.world.createCollisionBox({
            x: 320.6657487284849,
            y: 1.9334692438027425,
            z: -108.47632131982284
        }, { x:50, y: 100, z: 10}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: 366.8435615696857,
            y: 1.9296575744795632,
            z: -75.9487894552122
        }, { x:20, y: 100, z: 50}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: 347.68567206745576,
            y: 1.9441256902434172,
            z: -97.71008190795466
        }, { x:20, y: 100, z: 20}));
        
        this.boxCollisions.push(this.world.createCollisionBox({
            x: -320.6657487284849,
            y: 1.9334692438027425,
            z: 105.47632131982284
        }, { x:50, y: 100, z: 10}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: -366.8435615696857,
            y: 1.9296575744795632,
            z: 74.9487894552122
        }, { x:20, y: 100, z: 30}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: -347.68567206745576,
            y: 1.9441256902434172,
            z: 91.71008190795466
        }, { x:20, y: 100, z: 20}));

        this.boxCollisions.push(this.world.createCollisionBox({
            x: -320.6657487284849,
            y: 1.9334692438027425,
            z: -108.47632131982284
        }, { x:50, y: 100, z: 10}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: -366.8435615696857,
            y: 1.9296575744795632,
            z: -75.9487894552122
        }, { x:20, y: 100, z: 30}));
        this.boxCollisions.push(this.world.createCollisionBox({
            x: -347.68567206745576,
            y: 1.9441256902434172,
            z: -97.71008190795466
        }, { x:20, y: 100, z: 20}));

        this.sphereCollisions.push(this.world.createCollisionSphere({ x: -225.28408848883032, y: 1.9336560325685157, z: 11.197025432804969 }, 13));
        this.sphereCollisions.push(this.world.createCollisionSphere({
            x: -92.3619014719745,
            y: 1.9318125543009435,
            z: 13.155188202022526
        }, 13));
        this.sphereCollisions.push(this.world.createCollisionSphere({
            x: 55.320681774690705,
            y: 1.942554700486868,
            z: 13.110627058416075
        }, 13));
        this.sphereCollisions.push(this.world.createCollisionSphere({
            x: 240.9249711683649,
            y: 1.9248764311524063,
            z: 12.651747510424928
        }, 13));
    }

    spawnPowerUp() {
        const powerUp = this.powerUps.find(powerUp => !powerUp.spawned);
        const SpawnCenter = Math.random() < 0.5 ? { x: -240.28408848883032, y: 1.9336560325685157, z: 11.197025432804969 } : 
        {
            x: 260.9249711683649,
            y: 1.9248764311524063,
            z: 12.651747510424928
        };

        console.log("SpawnCenter selected: ", SpawnCenter);
        if (powerUp) {
            powerUp.spawn({
                spawnCenter:{
                 x: SpawnCenter.x
                ,y: SpawnCenter.y
                ,z: SpawnCenter.z},
                spawnRadius: 100,
                deadZone: 50,
            spawnHeight: 5});
            Socket.getIO().emit('powerUpSpawned', powerUp.getJson());
        }
    }

    createCheckpoints() {
        // this.createCheckpointsInCircle();
        const checkpointPositions = [
            { x: 335.076342528352, y: 1.933655356862873, z: -15.303009294870993 },
            { x: 19.666325769359897, y: 1.9336690050817276, z: -70.01400476204425 },
            { x: -335.467293219704, y: 1.933656039780768, z: 13.042975971854037 },
            { x: 14.47569892602831, y: 1.9336560325685481, z: 69.8014727949908 },
        ];

        const checkPointWidth = 40;
        const checkPointSize = 10;
        checkpointPositions.forEach((position, indexOf) => {
            const isPair = indexOf % 2 === 0;
            this.checkpoints.push(this.world.createTrigger(position, { x: isPair ? 60 : 10, y: 10, z: isPair ? 10 : 60 }, this.checkpointCallback.bind(this)));
        });
    }

    createCheckpointsInCircle(checkPointSize = 40) {
        const numCheckpoints = 4;
        const radius = 100;
        const angleStep = (2 * Math.PI) / numCheckpoints;
        for (let i = 0; i < numCheckpoints; i++) {
            const angle = i * angleStep;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const y = 0;
            this.checkpoints.push(this.world.createTrigger({ x, y, z }, { x: checkPointSize, y: checkPointSize, z: checkPointSize }, this.checkpointCallback.bind(this)));
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

    getBoxCollisionsJson() {
        return this.boxCollisions.map((boxCollision) => {
            return {
                position: boxCollision.position,
                size: {x: boxCollision.shapes[0].halfExtents.x * 2, y: boxCollision.shapes[0].halfExtents.y * 2, z: boxCollision.shapes[0].halfExtents.z * 2} 
            }
        });
    }

    getSphereCollisionsJson() {
        return this.sphereCollisions.map((sphereCollision) => {
            return {
                position: sphereCollision.position,
                radius: sphereCollision.shapes[0].radius
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
            checkpoints: this.getCheckpointsJson(),
            boxCollisions: this.getBoxCollisionsJson(),
            sphereCollisions: this.getSphereCollisionsJson()
        }
    }

    addPlayer(player) {

        const positions = [];
        const startX = 3.5356197222972665;
        const startY = 1.9337848382234415;
        const startZ = 50.050504574226814;
        const xIncrement = 16;
        const zIncrement = 13;
        const numPositionsX = 10; // Adjust the number of positions as needed
        const numPositionsZ = 4; // Adjust the number of positions as needed

        for (let i = 0; i < numPositionsX; i++) {
            for (let j = 0; j < numPositionsZ; j++) {
                positions.push({
                    x: startX - i * xIncrement,
                    y: startY,
                    z: startZ + j * zIncrement
                });
            }
        }

        const playerIndex = Object.keys(this.players).length;
        if (playerIndex < positions.length) {
            player.position.chassis.x = positions[playerIndex].x;
            player.position.chassis.y = positions[playerIndex].y;
            player.position.chassis.z = positions[playerIndex].z;
        } else {
            player.position.chassis.x = Math.random() * 300 - 150;
            player.position.chassis.y = startY;
            player.position.chassis.z = Math.random() * 300 - 150;
        }

        super.addPlayer(player);

    }

}