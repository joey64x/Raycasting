const TILE_SIZE = 32
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE; 

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 9;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
    constructor() {
        this.grid = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
            [1,1,1,1,1,1,0,0,0,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,0,0,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ]
    }   

    render() {
        for (let i = 0; i < MAP_NUM_ROWS; i++) {
            for (let j = 0 ; j < MAP_NUM_COLS; j++) {
                let tileX = j * TILE_SIZE;
                let tileY = i * TILE_SIZE;
                let tileColor = this.grid[i][j] == 1 ? "#222" : "#FFF";
                stroke("#222");
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    hasWallAt(x, y) {
        return (this.grid[Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)]
                || x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT);
    }
}


class Player {
    constructor(grid) {
        this.grid = grid;
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 3;
        this.turnDirection = 0; // -1 = left; +1 = right
        this.walkDirection = 0; // -1 = back; +1 = forward
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 1.5;
        this.rotationSpeed = 2 * (Math.PI / 180);
    }

    update() {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        
        var moveStep = this.walkDirection * this.moveSpeed;
        var newX = this.x + Math.cos(this.rotationAngle) * moveStep;
        var newY = this.y + Math.sin(this.rotationAngle) * moveStep;

        if (!this.grid.hasWallAt(newX, newY))  {
            this.x = newX;
            this.y = newY;
        } else if (!this.grid.hasWallAt(newX, this.y)) {
            this.x = newX;
        } else if (!this.grid.hasWallAt(this.x, newY)) {
            this.y = newY;
        }
    }

    render() {
        noStroke();
        fill("red");
        circle(this.x, this.y, this.radius);
        stroke("red");
        line(
             this.x, 
             this.y,
             this.x + Math.cos(this.rotationAngle) * 30,
             this.y + Math.sin(this.rotationAngle) * 30
        );
    }
}

class Ray {
    constructor (rayAngle) {
        this.rayAngle = rayAngle;
    }

    render () {
        stroke("blue");
        line(
             player.x,
             player.y,
             player.x + Math.cos(this.rayAngle) * 30,
             player.y + Math.sin(this.rayAngle) * 30
        );
    }
}

let gameMap = new Map();
let player = new Player(gameMap);
let rays = [];

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 1;    
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    }

    if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW && player.walkDirection == 1) {
        player.walkDirection = 0;    
    } else if (keyCode == DOWN_ARROW && player.walkDirection == -1) {
        player.walkDirection = 0;
    }
 
    if (keyCode == RIGHT_ARROW && player.turnDirection == 1) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW && player.turnDirection == -1) {
        player.turnDirection = 0;
    }
}

function castAllRays() {
    let columnId = 0;
    
    // start the first ray by subtracting half of the field of view
    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
    rays = [];

    for (let i = 0; i < NUM_RAYS; i++) {
        var ray = new Ray(rayAngle);
        rays.push(ray);
        
        rayAngle += FOV_ANGLE / NUM_RAYS;
    
        columnId++;
    }
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
    castAllRays(); 
}

function draw() {
	update();
    gameMap.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}
