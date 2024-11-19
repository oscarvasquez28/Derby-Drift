import * as cannon from 'cannon-es';
import Missile from './missile.js';
import Socket from './socket.js';
import Database from './database.js';

export default class Player {

    PLAYER_MAX_SPEED = 10000;
    PLAYER_WEGIHT = 1000;
    BRAKE_FORCE = 50;
    MAX_STEER_VALUE = Math.PI / 8;
    isFlipping = false;

    constructor(level, world, player = null) {

        const defaultPlayer = {
            "email": 'playerEmailSetByServer',
            "name": 'playerNameSetByServer',
            "color": 0xFFFFFF * Math.random(),
            "id": 0,
            "health": 100,
            "score": 0,
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

        this.level = level;
        this.world = world;
        this.projectiles = [];
        this.db = Database.getDb();
        this.remove = false;
        this.shotProjectile = false;
        this.player = {
            json: player ? player : defaultPlayer,
            body: this.initPlayer(player ? player : defaultPlayer)
        };

    }

    initPlayer(player) {
        return this.createPlayerCar(player);
    }

    getJson() {
        return this.player.json;
    }

    getBody() {
        return this.player.body;
    }

    flipCar() {

        if (this.isFlipping) return;
        const upVector = new cannon.Vec3(0, 1, 0);
        const carUpVector = new cannon.Vec3();
        this.player.body.vehicle.chassisBody.quaternion.vmult(upVector, carUpVector);

        if (carUpVector.y > 0) {
            console.log('Car is not upside down, no need to flip.');
            return;
        }
        this.isFlipping = true;

        const vehicle = this.player.body?.vehicle;
        if (vehicle) {
            // Define the target rotation (upright position)
            const targetQuaternion = new cannon.Quaternion();
            targetQuaternion.setFromAxisAngle(new cannon.Vec3(0, 1, 0), Math.PI);

            vehicle.chassisBody.position.y += 2;

            // Define the duration for the flip (in milliseconds)
            const duration = 500; // 1 second
            const startTime = Date.now();

            const flipInterval = setInterval(() => {
                console.log('Flipping car id:', this.player.json.id);
                const elapsedTime = Date.now() - startTime;
                const t = Math.min(elapsedTime / duration, 1);

                // Interpolate between the current rotation and the target rotation
                vehicle.chassisBody.quaternion.slerp(targetQuaternion, t, vehicle.chassisBody.quaternion);

                // Stop the interval when the rotation is complete
                if (t === 1) {
                    clearInterval(flipInterval);
                    this.isFlipping = false;
                    // Optionally, reset the car's angular velocity to stop it from spinning
                    vehicle.chassisBody.angularVelocity.set(0, 0, 0);
                    vehicle.chassisBody.velocity.set(0, 0, 0);
                }
            }, 16); // Update every 16ms (~60fps)
        }
    }

    createPlayerCar(player) {
        const shape = new cannon.Box(new cannon.Vec3(4, 0.5, 2));
        const carBody = new cannon.Body({
            mass: this.PLAYER_WEGIHT,
            shape: shape,
            position: new cannon.Vec3(player.position.chassis.x, player.position.chassis.y, player.position.chassis.z)
        });

        carBody.tag = 'player';

        carBody.angularVelocity.set(0, 0, 0.5);

        const vehicle = new cannon.RaycastVehicle({ chassisBody: carBody, });

        this.addWheelsToVehicle(vehicle, -0.6, 1.2);

        vehicle.addToWorld(this.world);

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

        carBody.addEventListener('collide', (event) => {
            console.log('Collision detected!', event.body.tag);
            if (event.body.tag !== 'player') return;
            const relativeVelocity = event.contact.getImpactVelocityAlongNormal();
            Socket.getIO().emit('playerCollision', { id: player.id, relativeVelocity });
        });

        return body;
    }

    addWheelsToVehicle(vehicle, wheelHeight = 0, wheelRadius = 0.5) {

        var options = {
            radius: wheelRadius,
            directionLocal: new cannon.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new cannon.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new cannon.Vec3(1, 1, 0),
            maxSuspensionTravel: 9999,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        }

        options.chassisConnectionPointLocal.set(2.8, wheelHeight, 2.5);
        vehicle.isFrontWheel = true;
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(2.8, wheelHeight, -2.5);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-3.6, wheelHeight, -2.5);
        vehicle.isFrontWheel = false;
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-3.6, wheelHeight, 2.5);
        vehicle.addWheel(options);
    }

    getDirectionFromKeyboardInput(inputs) {
        const direction = new cannon.Vec3();
        if (inputs.left) direction.z += 1;
        if (inputs.right) direction.z += -1;
        if (inputs.down) direction.x += -1;
        if (inputs.up) direction.x += 1;
        return direction;
    }

    getDirectionFromGamepadInput(inputs) {
        const direction = new cannon.Vec3();
        if (inputs.foward) direction.x += 1;
        if (inputs.axes[0] < -0.1) direction.z += 1;
        if (inputs.axes[0] > 0.1) direction.z += -1;
        return direction;
    }

    runInputsFromJSON(data) {
        let result = true;
        const vehicle = this.player.body?.vehicle;
        let direction = data.type === 'gamepad' ? this.getDirectionFromGamepadInput(data.inputs) : this.getDirectionFromKeyboardInput(data.inputs);
        const force = new cannon.Vec3();
        const forcePosition = new cannon.Vec3(0, 0, 0);
        // const jumpImpulse = new cannon.Vec3(0, PLAYER_JUMP_HEIGHT, 0);

        if (vehicle) {

            vehicle.setBrake(0, 0);
            vehicle.setBrake(0, 1);
            vehicle.setBrake(0, 2);
            vehicle.setBrake(0, 3);

            if (direction.z < 0) vehicle.setSteeringValue(-this.MAX_STEER_VALUE, 0), vehicle.setSteeringValue(-this.MAX_STEER_VALUE, 1);
            else if (direction.z > 0) vehicle.setSteeringValue(this.MAX_STEER_VALUE, 0), vehicle.setSteeringValue(this.MAX_STEER_VALUE, 1);
            else vehicle.setSteeringValue(0, 0), vehicle.setSteeringValue(0, 1);
            if (direction.x < 0) {
                vehicle.applyEngineForce(-this.PLAYER_MAX_SPEED, 0);
                vehicle.applyEngineForce(-this.PLAYER_MAX_SPEED, 1);
            }
            else if (direction.x > 0) {
                vehicle.applyEngineForce(this.PLAYER_MAX_SPEED, 0);
                vehicle.applyEngineForce(this.PLAYER_MAX_SPEED, 1);
            }
            else vehicle.applyEngineForce(0, 0), vehicle.applyEngineForce(0, 1);

            if (data.inputs.brake) {
                vehicle.setBrake(this.BRAKE_FORCE, 0);
                vehicle.setBrake(this.BRAKE_FORCE, 1);
            }

            if (data.inputs.flip) {
                this.flipCar();
            }

            if (data.inputs.fire) {
                this.fireProjectile();
            }

            this.updateJson();


        } else {
            console.error('The player that submitted the input does not have a body!');
            result = false;
        }

        return result;

    }

    addScore(score = 1) {
        this.player.json.score += score;
    }

    takeDamage(damage = 10, cause = 'unknown') {
        this.player.json.health -= damage;
        if (this.player.json.health <= 0) {
            this.remove = true;
            Socket.getIO().emit('playerDestroyed', { id: this.player.json.id, cause: cause });
        }
    }

    updateJson() {

        const vehicle = this.player.body?.vehicle;

        if (!vehicle) return;

        // Update player JSON with player body's data
        const chassisPosition = vehicle.chassisBody.position;
        const chassisQuaternion = vehicle.chassisBody.quaternion;

        this.player.json.position.chassis = {
            x: chassisPosition.x,
            y: chassisPosition.y,
            z: chassisPosition.z
        };

        this.player.json.rotation.chassis = {
            x: chassisQuaternion.x,
            y: chassisQuaternion.y,
            z: chassisQuaternion.z,
            w: chassisQuaternion.w
        };

        for (let i = 0; i < vehicle.wheelInfos.length; i++) {
            const wheelTransform = vehicle.getWheelTransformWorld(i);
            const wheelPosition = wheelTransform.position;
            const wheelQuaternion = wheelTransform.quaternion;

            const wheelKey = i === 0 ? 'frontLeft' :
                i === 1 ? 'frontRight' :
                    i === 2 ? 'backLeft' : 'backRight';

            this.player.json.position.wheels[wheelKey] = {
                x: wheelPosition.x,
                y: wheelPosition.y,
                z: wheelPosition.z
            };

            this.player.json.rotation.wheels[wheelKey] = {
                x: wheelQuaternion.x,
                y: wheelQuaternion.y,
                z: wheelQuaternion.z,
                w: wheelQuaternion.w
            };
        }

    }

    fireProjectile() {
        console.log('Firing projectile from player id:', this.player.json.id);
        const missile = new Missile(this.level, this.world, this);
        this.projectiles.push(missile);
        this.shotProjectile = true;
    }

    hasShotProjectile() {
        const shotProjectile = this.shotProjectile;
        this.shotProjectile = false;
        return shotProjectile;
    }

    getLastProjectile() {
        return this.projectiles[this.projectiles.length - 1];
    }

    getCurrentProjectiles() {
        return this.projectiles;
    }

    getCurrentProjectilesJSON() {
        const projectilesJson = [];
        this.projectiles.forEach(projectile => {
            projectilesJson.push(projectile.getJSON());
        });
        return projectilesJson;
    }

    destroy() {
        if (this.db){
            const player = this.player.json;
            if(player.score > 0){
                if (player.email){
                    this.db.getConnection((err, connection) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        connection.query('SELECT * FROM players WHERE email = ?', [player.email], (err, results) => {
                            if (err) {
                                console.log(err);
                                connection.release();
                                return;
                            }
                            if (results.length > 0) {
                                results.forEach((dbPlayer) => {
                                    if (dbPlayer.highscore < player.score) {
                                        connection.query('UPDATE players SET highscore = ? WHERE email = ?', [player.score, player.email], (err) => {
                                            if (err) console.log(err);
                                            connection.release();
                                        });
                                    }
                                });
                            } else {
                                connection.query('INSERT INTO players (email, name, highscore) VALUES (?, ?, ?)', [player.email, player.name, player.score], (err) => {
                                    if (err) console.log(err);
                                    connection.release();
                                });
                            }
                        });
                    });
                }
                else {
                    this.db.getConnection((err, connection) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        connection.query('INSERT INTO players (name, highscore) VALUES (?, ?)', [player.name, player.score], (err) => {
                            if (err) console.log(err);
                            connection.release();
                        });
                    });
                }
            }

        }
        if (this.player.body?.vehicle) {
            this.player.body.vehicle.removeFromWorld(this.world);
        }
        this.player = null;
    }

}