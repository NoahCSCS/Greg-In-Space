var stageWidth = 10;
var stageHeight = 20;
var tileSize = 32;
var playerObject;
var player;
var movingObjects = [];
var framesBetweenMoves = 2;
var framesSinceMoved = framesBetweenMoves;
var inputQueue = new queue()
var assetsFile = "Sprint1/"


// Variable used to keep track of what keys were pressed last frame
// Used to make it so holding down buttons doesn't work.
var lastFrameDown = {
    right:false,
    left:false,
    up:false,
    down:false
};

// Converts pixel coords to grid coords
function pixelToGrid(x){
    return Math.floor(x/tileSize);
}

//Checks if sprite is inGrid
function inGrid(sprite){
    return (Math.floor(player.x % tileSize)  == tileSize/2)  && (Math.floor(player.y % tileSize)  == tileSize/2)
}

// Converts grid coords to pixel coords
function gridToPixel(x){
    return x*tileSize + Math.floor(tileSize/2);
}

// Creates the game matrix which stores the tile objects.
var gameMatrix = new Array(stageWidth);

for(var i = 0; i<stageWidth; i++){
    gameMatrix[i] = new Array(stageHeight);
}


// Checks if coordinates are in bounds.
function inBounds(x,y){
    return (0<= x) && (x < stageWidth) && (0<= y) && (y <stageHeight);
}

// Collects the executive
function collectExec(player, executive){
    executive.destroy();
    player.execsCollected += 1
}

// Queue used for button inputs
function queue(){
    this.list = [];
    this.enqueue = function(e){
        this.list.push(e);
    }
    this.dequeue = function(){
        return this.list.shift();
    }
    this.length = function(){
        return this.list.length;
    }
}

// Object with 4 attributes:
// x and y keep track of tileObject's location in gameMatrix
// foreground is sprite object used to indicate foreground object at x,y. null if no object in foregorund.
// background is string used to indicate background. "water" if water tile and null otherwise.

// Important methods:
// getTile(direction) returns tile in direction of "up", "down", "left", or "right". Also getTileAbove(), getTileBelow(), getTileRight(), and getTileLeft().
// moveDirection(direction) sets foreground of getTile(direction) to this.foreground, and this.foreground to null. Does not check for collision.
// moveUp(), moveDown(), moveLeft(), and moveRight() does similar thing.

function tileObject(x,y,foreground){
    this.x = x;
    this.y = y;
    this.foreground = foreground;
    this.background = null;
    
    this.getTileAbove =  function(){
        return inBounds(this.x,this.y-1) ? gameMatrix[this.x][this.y-1] : null;
    };
    this.getTileBelow =  function(){
        return inBounds(this.x,this.y+1) ? gameMatrix[this.x][this.y+1] : null;
    };
    this.getTileRight =  function(){
        return inBounds(this.x+1,this.y) ? gameMatrix[this.x+1][this.y] : null;
    };
    this.getTileLeft =  function(){
        return inBounds(this.x-1,this.y) ? gameMatrix[this.x-1][this.y] : null;
    };
    
    
    this.getTile = function(direction){
        if(direction == "up"){
            return this.getTileAbove()
        }
        if(direction == "down"){
            return this.getTileBelow()
        }
        if(direction == "left"){
            return this.getTileLeft()
        }
        if(direction == "right"){
            return this.getTileRight()
        }
    }
    
    this.moveDirection = function(direction){
        console.log(this.foreground);
        if(direction == "up"){ 
            movingObjects.push(this.foreground);
            this.foreground.body.velocity.y = -30;
            if(this.foreground.name == "player"){
                this.foreground.anims.play("up",true);
            }
        }
        if(direction == "down"){ 
            movingObjects.push(this.foreground);
            this.foreground.body.velocity.y = 30;
            if(this.foreground.name == "player"){
                this.foreground.anims.play("down",true);
            }}
        if(direction == "right"){
            movingObjects.push(this.foreground);
            this.foreground.body.velocity.x = 30;
            if(this.foreground.name == "player"){
                this.foreground.anims.play("right",true);
            }
        }
        if(direction == "left"){ 
            movingObjects.push(this.foreground);
            this.foreground.body.velocity.x = -30;
            if(this.foreground.name == "player"){
                this.foreground.anims.play("left",true);
            }}
        this.getTile(direction).foreground = this.foreground;
        this.foreground = null;
    }
    
    this.moveUp = function(){
        this.foreground.y += -tileSize;
        this.getTileAbove().foreground = this.foreground;
        this.foreground = null;
    };
    
    this.moveDown = function(){
        this.foreground.y += tileSize;
        this.getTileBelow().foreground = this.foreground;
        this.foreground = null;
    };
    
    this.moveRight = function(){
        this.foreground.x += tileSize;
        this.getTileRight().foreground = this.foreground;
        this.foreground = null;
    };
    
    this.moveLeft = function(){
        this.foreground.x += -tileSize;
        this.getTileLeft().foreground = this.foreground;
        this.foreground = null;
    };
}

var scene = {
    preload: preload,
    create: create,
    update: update
};

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: scene
};

//  here.adds a sprite with image image and name name at grid coords x and y.
//  Puts the sprite at gameMatrix[x][y]
function addObject(here,x,y,image,name){
    var a = here.physics.add.sprite(gridToPixel(x), gridToPixel(y), image);
    a.name = name;
    gameMatrix[x][y] = new tileObject(x,y,a);
    return a;
}


function preload ()
{
    this.load.image('flooring', assetsFile + 'tileset.png');
    this.load.image('rock', assetsFile + 'addwork.png');
    this.load.image('executive', assetsFile + 'EyeBall Monster-Sheet.png');
    this.load.spritesheet('character_right', assetsFile + 'Character_Right.png', { frameWidth: 32, frameHeight: 32 } );
    this.load.spritesheet('character_left', assetsFile + 'Character_Left.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('character_up', assetsFile + 'Character_Up.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('character_down', assetsFile + 'Character_Down.png', { frameWidth: 32, frameHeight: 32 });
    this.load.tilemapTiledJSON('tilemap', assetsFile + 'FinalLevel6.json');
    this.load.spritesheet('greg',"Sprint1/Character_Up.png",{frameWidth: 32, frameHeight:32});
    //this.load.image('water', "Sprint1/Water.png");
    this.load.spritesheet('wall', 'Sprint1/tileset.png',{frameWidth: 32, frameHeight:32});
    //this.load.image('exit', "Sprint1/exit.png");
    
    //loading music
    this.load.audio('lab_music', "Sprint1/lab_gameplay_music.mp3");

}


function create ()
{
    const map = this.make.tilemap({ key: "tilemap" });
    
    for(i = 0; i<stageWidth; i++){
        for(var j=0; j<stageHeight; j++){
            gameMatrix[i][j] = new tileObject(i,j,null);
        }
    }

    const floorTileSet = map.addTilesetImage("Flooring", "flooring");

    
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const blocksLayer = map.createStaticLayer("Black Blocks", floorTileSet, 0, 0);
    const backgroundLayer = map.createStaticLayer("Background", floorTileSet, 0, 0);
    const rocks = map.createFromObjects("Movable", "rock" , {key:"rock", frame:1} );
    console.log(this.physics.world.enable);
    this.physics.world.enable(rocks);
    
    for(var i = 0; i<rocks.length; i++){
        current = rocks[i];
        gameMatrix[pixelToGrid(current.x)][pixelToGrid(current.y)].foreground = current;
    }
    const executives = map.createFromObjects("Collectable", "executive" , {key: "executive"});
    for(var i = 0; i<executives.length; i++){
        current = executives[i];
        gameMatrix[pixelToGrid(current.x)][pixelToGrid(current.y)].foreground = current;
    }
    

    //backgroundLayer.setCollisionByProperty( {collides : true} );

    const spawnPoint = map.findObject("Movable", obj => obj.name === "spawnPoint");
    player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "character_right");
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('character_left', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn_left',
        frames: this.anims.generateFrameNumbers('character_left', { start: 0, end: 0 }),
        frameRate: 0,
    });

    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers("character_up", { start: 0, end: 3 } ),
        frameRate: 10
    });
    
    this.anims.create({
        key: 'turn_up',
        frames: this.anims.generateFrameNumbers('character_up', { start: 0, end: 0 }),
        frameRate: 0,
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('character_right', { start: 0, end: 3 } ),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn_right',
        frames: this.anims.generateFrameNumbers('character_right', { start: 0, end: 0 }),
        frameRate: 0,
    });

    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('character_down', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn_down',
        frames: this.anims.generateFrameNumbers('character_down', { start: 0, end: 0 }),
        frameRate: 0,
    });
    
    player = addObject(this,1,3,'greg',"player");
    player.execsCollected = 0;
    
    
    var music = this.sound.add("lab_music", musicConfig);
    
    var musicConfig = {
        
        mute: false,
        volume: 1,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0

    }

    music.play(musicConfig);
}

// Tries to move playerTile in direction direction.
// Does check for collision.
// Where win condition contained.
function playerMoveTo(playerTile,direction){
    var toTile = playerObject.getTile(direction);
    if( toTile != null){
        if(toTile.foreground == null){
            playerTile.moveDirection(direction);
        } else if(toTile.foreground.name == "rock"){
            rockPush(toTile,direction);
        } else if(toTile.foreground.name == "executive"){
            collectExec(playerObject.foreground,toTile.foreground);
            playerObject.moveDirection(direction);
        } else if(toTile.foreground == "exit"){
            if(player.execsCollected == 2){
                this.add.text(0, 0, 'You Won', { font: '"Press Start 2P"' });
                playerTile.moveDirection(direction);
            }
        }
        
    }
}

// Tries to move the Rock to tile Rock. Does check for collision.
function rockPush(rockTile,direction){
    var toTile = rockTile.getTile(direction);
    if(toTile != null){
        if(toTile.foreground == null && toTile.background != "water"){
            rockTile.moveDirection(direction);
        }
    }
}

function update ()
{
    var cursors = this.input.keyboard.createCursorKeys();
    playerObject = gameMatrix[Math.floor(player.x/32)][Math.floor(player.y/32)];

    if(movingObjects.length > 0){
        for(var i = 0; i<movingObjects.length; i++){
            console.log(current);
            current = movingObjects[i];
            console.log(inGrid(current));
            if(inGrid(current)){
                current.body.velocity.x = 0;
                current.body.velocity.y = 0;
                movingObjects.splice(i, 1);
                i+= -1;
                player.anims.stop();
            }
        }
    }
    
    if(inputQueue.length() != 0 && movingObjects.length == 0){
        direction = inputQueue.dequeue(); 
        player.anims.play("turn_" + direction);
        playerMoveTo(playerObject,direction);
        framesSinceMoved = 0;
    }
    framesSinceMoved += 1;
    
    
    //move Right
    if (cursors.right.isDown && !lastFrameDown.right){
        inputQueue.enqueue("right");
        lastFrameDown.right = true;
    } else if(cursors.right.isDown == false){
        lastFrameDown.right = false;
    }
    
    //move Left
    if (cursors.left.isDown && !lastFrameDown.left){
        inputQueue.enqueue("left");
        lastFrameDown.left = true;
    } else if(cursors.left.isDown == false){
        lastFrameDown.left = false;
    }
    
    //move Up
    if (cursors.up.isDown && !lastFrameDown.up){
        inputQueue.enqueue("up");
        lastFrameDown.up = true;
    } else if(cursors.up.isDown == false){
        lastFrameDown.up = false;
    }
    
    //move Down    
    if (cursors.down.isDown && !lastFrameDown.down){
        inputQueue.enqueue("down");
        lastFrameDown.down = true;
    } else if(cursors.down.isDown == false){
        lastFrameDown.down = false;
    }

}


// starts game
var game = new Phaser.Game(config);