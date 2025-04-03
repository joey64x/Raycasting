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
        // stroke("red");
        // line(
        //      this.x, 
        //      this.y,
        //      this.x + Math.cos(this.rotationAngle) * 30,
        //      this.y + Math.sin(this.rotationAngle) * 30
        // );
    }
}

class Ray {
    constructor (rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distanceToWall = 0;

        // the angle increments clockwise, we want to know which way the ray is facing
        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;
        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

    cast(columnId) {
        var xStep, yStep;
        var xIntercept, yIntercept;

        //////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION //
        //////////////////////////////////////
        var foundHorizontalWallHit = false;
        var horizontalWallHitX = 0;
        var horizontalWallHitY = 0;
        var wasHitVertical = false;
        
        // Find the y-coordinate of the closest horizontal grid intersection
        yIntercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yIntercept += this.isRayFacingDown ? TILE_SIZE : 0;

        // Find the x-coordinate of the closest horizontal grid intersection
        xIntercept = player.x + (yIntercept - player.y) / Math.tan(this.rayAngle);
        
        //Calculate the increment yStep and xStep
        yStep = TILE_SIZE;
        yStep *= this.isRayFacingUp ? -1 : 1;

        xStep = yStep / Math.tan(this.rayAngle);
        xStep *= (this.isRayFacingLeft && xStep > 0) ? -1 : 1;
        xStep *= (this.isRayFacingRight && xStep < 0) ? -1 : 1;

        var nextHorizontalTouchX = xIntercept;
        var nextHorizontalTouchY = yIntercept;

        if (this.isRayFacingUp) {
            nextHorizontalTouchY--;
        }

        //increment xStep and yStep until we find a wall
        while(nextHorizontalTouchX >= 0 && nextHorizontalTouchX <= WINDOW_WIDTH && nextHorizontalTouchY >= 0 && nextHorizontalTouchY <= WINDOW_HEIGHT) {
            if (gameMap.hasWallAt(nextHorizontalTouchX, nextHorizontalTouchY)) {
                foundHorizontalWallHit = true;
                horizontalWallHitX = nextHorizontalTouchX;
                horizontalWallHitY = nextHorizontalTouchY;
                break;
            }

            nextHorizontalTouchX += xStep;
            nextHorizontalTouchY += yStep;
        }

        //////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION //
        //////////////////////////////////////

        var foundVerticalWallHit = false;
        var verticalWallHitX = 0;
        var verticalWallHitY = 0;

        // Find the x-coordinate of the closest vertical grid intersection
        xIntercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xIntercept += this.isRayFacingRight ? TILE_SIZE : 0;

        // find the y-coordinate of the closest vertical grid intersection
        yIntercept = player.y + (xIntercept - player.x) * Math.tan(this.rayAngle);

        //Calculate the increment yStep and xStep
        xStep = TILE_SIZE;
        xStep *= this.isRayFacingLeft ? -1 : 1;

        yStep = xStep * Math.tan(this.rayAngle);
        yStep *= (this.isRayFacingUp && yStep > 0) ? -1 : 1;
        yStep *= (this.isRayFacingDown && yStep < 0) ? -1 : 1;

        var nextVerticalTouchX = xIntercept;    
        var nextVerticalTouchY = yIntercept;

        if (this.isRayFacingLeft) {
            nextVerticalTouchX--;
        }

        //increment xStep and yStep until we find a wall
        while(nextVerticalTouchX >= 0 && nextVerticalTouchX <= WINDOW_WIDTH && nextVerticalTouchY >= 0 && nextVerticalTouchY <= WINDOW_HEIGHT) {
            if (gameMap.hasWallAt(nextVerticalTouchX, nextVerticalTouchY)) {
                foundVerticalWallHit = true;
                verticalWallHitX = nextVerticalTouchX;
                verticalWallHitY = nextVerticalTouchY;
                break;
            }

            nextVerticalTouchX += xStep;
            nextVerticalTouchY += yStep;
        }
        
        // Calculate both horizontal and vertical distances to the wall and choose the smallest value - that's the distance to the wall
        var distanceToHorizontalWall = 0;
        var distanceToVerticalWall = 0;

        distanceToHorizontalWall = (foundHorizontalWallHit) ? dist(player.x, player.y, horizontalWallHitX, horizontalWallHitY) : Number.MAX_VALUE;
        distanceToVerticalWall = (foundVerticalWallHit) ? dist(player.x, player.y, verticalWallHitX, verticalWallHitY) : Number.MAX_VALUE;

        // only use the smallest distance to the wall
        this.wallHitX = (distanceToHorizontalWall < distanceToVerticalWall) ? horizontalWallHitX : verticalWallHitX;
        this.wallHitY = (distanceToHorizontalWall < distanceToVerticalWall) ? horizontalWallHitY : verticalWallHitY;
        this.distanceToWall = (distanceToHorizontalWall < distanceToVerticalWall) ? distanceToHorizontalWall : distanceToVerticalWall;
        this.wasHitVertical = (distanceToHorizontalWall < distanceToVerticalWall);
    }

    render () {
        stroke("rgba(255, 0, 0, 0.3)");
        line(
             player.x,
             player.y,
             this.wallHitX,
             this.wallHitY
        );
    }
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle += 2 * Math.PI;
    }
    return angle;
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
    //for (let i = 0; i < 1; i++) {
        var ray = new Ray(rayAngle);
        ray.cast(columnId);
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
