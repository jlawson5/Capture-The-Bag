    ///////////////////////////////////////////////////////////////
    //Game: Capture the Bag                                      //
    //
    ///////////////////////////////////////////////////////////////

    window.onload = function() {

        var game = new Phaser.Game(600, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.spritesheet('player', 'assets/PlayerCat.png', 32, 16);//The player's cat//
    game.load.spritesheet('tackleCat', 'assets/TackleCat.png', 32, 16);//Enemy cat: will occasionally move towards the player, taking one life on successful collision//
    game.load.spritesheet('laserCat', 'assets/LaserCat.png', 32, 16);//Enemy cat: will occasionally shoot a laser at the player//
    game.load.spritesheet('magnetCat', 'assets/MagnetCat.png', 32, 16);//Enemy cat: will occasionally pull the player towards it, cannot kill the player. Does not fully work as intended (you warp instead of sliding)//
    game.load.image('bag', 'assets/PaperBag.png');//The bag you must capture//
    game.load.image('flag', 'assets/PlayerFlag.png');//flag you must return the bag to//
    game.load.image('laser', 'assets/laser.png');//laser shot by laserCat, travels towards player at a high velocity//
    game.load.image('bg', 'assets/bg.png');
    game.load.audio('meow', 'assets/Cat_Meow_2-Cat_Stevens-2034822903.mp3');
    game.load.audio('magnet', 'assets/flyby-Conor-1500306612.mp3');
    game.load.audio('laserShoot', 'assets/ray_gun-Mike_Koenig-1169060422.mp3');
    game.load.audio('bagSecure', 'assets/Robot_blip-Marianne_Gagnon-120342607.mp3');
    game.load.audio('lose', 'assets/Sad_Trombone-Joe_Lamb-665429450.mp3');
    game.load.audio('music', 'assets/GameMusic.mp3');
}

var player;
var facing = 'right';
var cursors;
var bg;
var numBags = 0;//number of bags obtained; effectively your score//
var numBagsString;
var bagText;
var gameText;
var hasStarted = false;
var numLives = 9;
var livesText;
var livesString;
var tackleTimer;//timer to activate tackleCat's dash//
var tackleFacing = 'left';//direction tackleCat is facing//
var laserTimer;//timer to shoot laser//
var magnetTimer;//timer to activate magnet//
var hasBag = false;//if the player has the bag//
var tackleCat;
var laserCat;
var magnetCat;
var flag;
var bag;
var laserGroup;
var hasBag = false;
var meowSFX;
var magnetSFX;
var laserSFX;
var bagSFX;
var loseSFX;
var music;

        
function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#ffffff';

    bg = game.add.sprite(0, 0, 'bg');

    player = game.add.sprite(300, 500, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.collideWorldBounds = true;
    player.body.setSize(32, 16, 0, 0);

    player.animations.add('left', [2, 3], 8, true);
    player.animations.add('right', [0, 1], 8, true);
    player.frame = 0;
    
    tackleCat = game.add.sprite(150, 200, 'tackleCat');
    game.physics.enable(tackleCat, Phaser.Physics.ARCADE);
    tackleCat.body.collideWorldBounds = true;
    tackleCat.body.setSize(32, 16, 0, 0);
    
    tackleCat.animations.add('left', [2, 3], 8, true);
    tackleCat.animations.add('right', [0, 1], 8, true);
    
    laserCat = game.add.sprite(450, 200, 'laserCat');
    game.physics.enable(laserCat, Phaser.Physics.ARCADE);
    laserCat.body.setSize(32, 16, 0, 0);
    laserCat.frame = 2;
    
    magnetCat = game.add.sprite(300, 200, 'magnetCat');
    game.physics.enable(magnetCat, Phaser.Physics.ARCADE);
    magnetCat.body.setSize(32, 16, 0, 0);
    
    flag = game.add.sprite(300, 550, 'flag');
    game.physics.enable(flag, Phaser.Physics.ARCADE);
    flag.body.setSize(16, 32, 0, 0);
    
    bag = game.add.sprite(300, 50, 'bag');
    game.physics.enable(bag, Phaser.Physics.ARCADE);
    bag.body.setSize(18, 19, 0, 0);
    
    numBagsString = 'Bags: ';
    bagText = game.add.text(10, 10, numBagsString + numBags, {font: '34px Arial', fill: '#000'});
    
    livesString = 'Lives: ';
    livesText = game.add.text(10, 50, livesText + numLives, {font: '34px Arial', fill: '#000'});
    
    gameText = game.add.text(200, 200, 'click to play!', {font: '34px Arial', fill: '#000'});
    
    laserGroup = game.add.group();
    
    meowSFX = game.add.audio('meow');
    magnetSFX = game.add.audio('magnet');
    laserSFX = game.add.audio('laserShoot');
    bagSFX = game.add.audio('bagSecure');
    loseSFX = game.add.audio('lose');
    
    meowSFX.addMarker('meow', 0.3, 1);
    magnetSFX.addMarker('magnet', 0, 1);
    laserSFX.addMarker('laser', 0.5, 2);
    bagSFX.addMarker('bag', 0, 1);
    loseSFX.addMarker('lose', 0, 4);
    
    music = game.add.audio('music');
    music.loop = true;
    music.addMarker('play', 0, 162);
    music.play('play');

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {

    if(hasStarted)
    {
        if (cursors.left.isDown)
        {
            player.body.velocity.x = -150;
            player.body.velocity.y = 0;
            player.animations.play('left');
            facing = 'left';
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 150;
            player.body.velocity.y = 0;
            player.animations.play('right');
            facing = 'right';
        }
        else if (cursors.up.isDown)
        {
            player.body.velocity.y = -150;
            player.body.velocity.x = 0;
            if(facing == 'left')
                player.animations.play('left');
            else
                player.animations.play('right');
        }
        else if (cursors.down.isDown)
        {
            player.body.velocity.y = 150;
            player.body.velocity.x = 0;
            if(facing == 'left')
                player.animations.play('left');
            else
                player.animations.play('right');
        }
        else
        {
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 2;
            }
            else if(facing == 'right')
            {
                player.frame = 0;
            }
        }
        
        if(game.time.now > tackleTimer)
        {
            game.physics.arcade.moveToXY(tackleCat, player.body.x, player.body.y, 250);
            tackleTimer = game.time.now + 2500;
            meowSFX.play('meow');
        }
        
        if(tackleCat.body.velocity.x > 0)
        {
            tackleCat.animations.play('right');
            tackleFacing = 'right';
        }
        else if(tackleCat.body.velocity.x < 0)
        {
            tackleCat.animations.play('left');
            tackleFacing = 'left';
        }
        else
        {
            if(tackleFacing == 'left')
                tackleCat.frame = 2;
            else
                tackleCat.frame = 0;
        }
        
        if(game.time.now > laserTimer)
        {
            var laser = laserGroup.create(laserCat.body.x, laserCat.body.y, 'laser');
            game.physics.enable(laser, Phaser.Physics.ARCADE);
            game.physics.arcade.moveToObject(laser, player, 500);
            laserSFX.play('laser');
            
            laserTimer = game.time.now + 2500;
        }
        
        if(game.time.now > magnetTimer)
        {
            game.physics.arcade.moveToXY(player, magnetCat.body.x, magnetCat.body.y, 60, 50);
            magnetSFX.play('magnet');
            magnetTimer = game.time.now + 4000;
        }
        
        game.physics.arcade.overlap(tackleCat, player, tackleCollision, null, this);
        game.physics.arcade.overlap(player, laserGroup, laserCollision, null, this);
        game.physics.arcade.overlap(player, bag, bagPickup, null, this);
        
        if(hasBag)
        {
            bag.body.x = player.body.x;
            bag.body.y = player.body.y;
            game.physics.arcade.overlap(bag, flag, secureBag, null, this);
        }
    }
    
    else
        game.input.onTap.addOnce(startGame,this);
    
    if(numLives <= 0)
    {
        gameText.visible = true;
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        if(hasStarted)
            loseSFX.play('lose');
        hasStarted = false;
        game.input.onTap.addOnce(startGame,this);
    }
    
    bagText.text = numBagsString + numBags;
    livesText.text = livesString + numLives;
}
        
function tackleCollision(tackleCat, player)
{
    numLives--;
    player.body.x = 300;
    player.body.y = 500;
    tackleCat.body.x = 150;
    tackleCat.body.y = 200;
    tackleTimer = game.time.now + 2500;
    hasBag = false;
}
        
function laserCollision(player, laser)
{
    numLives--;
    player.body.x = 300;
    player.body.y = 500;
    laser.kill();
    laserTimer = game.time.now + 2500;
    hasBag = false;
}
        
function secureBag(bag, flag)
{
    bag.body.x = 300;
    bag.body.y = 100;
    numBags++;
    hasBag = false;
    bagSFX.play('bag');
}
        
function bagPickup(player, bag)
{
    hasBag = true;
}
        
function startGame()//Starts the game//
{
    gameText.visible = false;
    gameText.text = 'Gameover\n Click to restart!';
    hasStarted = true;
    tackleTimer = game.time.now + 2500;
    laserTimer = game.time.now + 4000
    magnetTimer = game.time.now + 10000;
    numLives = 9;
    numBags = 0;
    player.body.x = 300;
    player.body.y = 500;
    tackleCat.body.x = 150;
    tackleCat.body.y = 200;
    bag.body.x = 300;
    bag.body.y = 100;
}

function render () {}

    };