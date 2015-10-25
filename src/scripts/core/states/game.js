define(['core/states/gameover'], function (GameOver) {
  'use strict';

  /**
   *
   */
  var Game = function (game) {
    this.game = game;
  };

  /**
   * Preloads assets
   */
  Game.prototype.preload = function() {
    this.game.load.image('background', 'assets/bg_final.png');
    this.game.load.spritesheet('player', 'assets/granny_tileset_752_118_final.png', 94, 118);
    this.game.load.spritesheet('balls', 'assets/balls_final_96_32.png', 32, 32);
    this.game.load.spritesheet('explosion', 'assets/explosion.png', 128, 128);
    this.game.load.image('ground', 'assets/ground_640_64.png');
  };

  /**
   * Creates this state
   */
  Game.prototype.create = function() {

    // Constants
    this.GROUND_HEIGHT = 64;
    this.GROUND_Y = this.game.height - this.GROUND_HEIGHT;

    this.PLAYER_WIDTH = 94;
    this.PLAYER_HEIGHT = 118;
    this.PLAYER_X = this.game.width / 2 - this.PLAYER_WIDTH / 2;
    this.PLAYER_Y = this.game.height - this.GROUND_HEIGHT - this.PLAYER_HEIGHT;

    this.GAME_MIN_X = 32;
    this.GAME_MAX_X = this.game.width - this.PLAYER_WIDTH - 32;

    this.BOUNCE_AREA_WIDTH = 12;
    this.BOUNCE_AREA_HEIGHT = 118;
    this.BOUNCE_AREA_LEFT_X = this.PLAYER_X;
    this.BOUNCE_AREA_LEFT_Y = this.PLAYER_Y;
    this.BOUNCE_AREA_RIGHT_X = this.PLAYER_X + this.PLAYER_WIDTH - this.BOUNCE_AREA_WIDTH;
    this.BOUNCE_AREA_RIGHT_Y = this.PLAYER_Y;

    this.GRAVITY = 1000;
    this.JUMP_SPEED = -600;
    this.VELOCITY = 250;

    this.BALL_TYPES = {
      0: {
        score: 150
      },
      1: {
        score: 0
      },
      2: {
        score: 275
      }
    };

    // Game state related variables
    this.gameState = {
      score: 0,
      timeToSpawn: 1750,
      isAttacking: false,
      isAttackingLeft: false,
      isAttackingRight: false
    };

    // Environment
    this.backgroundImage = this.game.add.sprite(0, 0, 'background');
    this.backgroundImage.alpha = 0;

    // Player
    this.player = this.game.add.sprite(this.PLAYER_X, this.PLAYER_Y, 'player');
    this.player.animations.add('left', [7, 6], 10, false);
    this.player.animations.add('right', [0, 1], 10, false);
    this.player.animations.add('leftJump', [5], 1, false);
    this.player.animations.add('rightJump', [2], 1, false);
    this.player.animations.add('leftAttack', [4, 7], 10, false);
    this.player.animations.add('rightAttack', [3, 0], 10, false);
    this.player.animations.play('left');
    // Swap to use on jump event complete?
    this.player.events.onAnimationComplete.add(function() {
      if(this.player.animations.currentAnim.name.indexOf('Jump') > -1) {
        if(this.player.animations.currentAnim.name.indexOf('left') > -1) {
          this.player.animations.play('left');
        } else {
          this.player.animations.play('right');
        }
      } //else if(this.player.animations.currentAnim.name.indexOf('Attack') > -1) {
        //if(this.player.animations.currentAnim.name.indexOf('left') > -1) {
        //  this.player.animations.play('left');
        //} else {
        //  this.player.animations.play('right');
        //}
      // }
    }, this);

    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    // this.player.anchor.set(0.5);
    // this.player.body.enable = false;
    this.player.body.setSize(74, 110, 10, 8);

    // Balls
    this.balls = this.game.add.group();
    this.balls.enableBody = true;
    this.balls.physicsBodyType = Phaser.Physics.ARCADE;

    // Ball explosions
    this.ballExplosions = this.game.add.group();

    // var ball = this.balls.create(100, 100, 'balls', 0); // game.add.sprite(x, y, "tilesetname", frameIndex)
    // ball.body.bounce.set(1);
    // ball.body.velocity.y = -500;
    // ball.body.velocity.x = 0;
    // ball.body.immovable = true;
    // ball.anchor.set(0.5);
    // ball.checkWorldBounds = true;
    // ball.body.collideWorldBounds = true;

    // this.game.physics.enable(ball, Phaser.Physics.ARCADE);
    // this.balls.add(ball); -- should not be needed

    // Music
    this.MUSIC = {
      explosion: [
        this.game.add.audio('explosion1'),
        this.game.add.audio('explosion2'),
        this.game.add.audio('explosion3')
      ],
      dead: this.game.add.audio('dead'),
      scene: this.game.add.audio('scene')
    };

    // Ground
    this.ground = this.game.add.sprite(0, this.GROUND_Y, 'ground');
    this.game.physics.enable(this.ground, Phaser.Physics.ARCADE);
    this.ground.body.immovable = true;
    this.ground.body.allowGravity = false;
    this.ground.visible = false;

    // Enables gravity for jumping
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    // Captures keys which should not be propagated to browser
    this.game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.LEFT,
      Phaser.Keyboard.RIGHT,
      Phaser.Keyboard.UP,
      Phaser.Keyboard.DOWN
    ]);

    // Creates keys
    this.keys = {
      left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
      right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
      jump: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
      attack: this.game.input.keyboard.addKey(Phaser.Keyboard.S)
    };

    // Shows FPS
    /*
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
      20, 40, 'FPS 0', { font: '14px Arial', fill: '#ffffff' }
    );
    */
    this.scoreText = this.game.add.text(
      20, 20, 'SCORE: 0', { font: '16px Arial', fill: 'brown', fontWeight: 'bold' }
    );

    this.tweenIn = this.game.add.tween(this.backgroundImage);
    this.tweenIn.to( { alpha: 1 }, 500, Phaser.Easing.Linear.None);
    this.tweenIn.start();

    this.game.time.events.add(this.gameState.timeToSpawn, this.onSpawnBall, this);
    this.MUSIC.scene.play();
  };

  /**
   * Updates on each frame
   */
  Game.prototype.update = function() {
    //if (this.game.time.fps !== 0) {
    //  this.fpsText.setText('FPS ' + this.game.time.fps);
    //}
    this.scoreText.setText('SCORE: ' + this.gameState.score);

    // Collides balls with the players
    this.game.physics.arcade.collide(this.player, this.balls, null, this.collidePlayerToBall, this);

    // Collides the player with the ground
    this.game.physics.arcade.collide(this.player, this.ground);

    // Collides balls with the ground
    this.game.physics.arcade.collide(this.balls, this.ground);

    // Movement
    if (this.keys.left.isDown && this.player.x > this.GAME_MIN_X) {
      this.setPlayerVelocityX(-this.VELOCITY);

      if(!this.player.body.touching.down) {
        this.player.animations.play('leftJump');
      } else {
        this.player.animations.play('left');
      }
    } else if (this.keys.right.isDown && this.player.x < this.GAME_MAX_X) {
      this.setPlayerVelocityX(this.VELOCITY);

      if(!this.player.body.touching.down) {
        this.player.animations.play('rightJump');
      } else {
        this.player.animations.play('right');
      }
    } else {
      // Stops the player from moving horizontally
      this.setPlayerVelocityX(0);
    }

    // Jumping
    if (this.keys.jump.isDown && this.player.body.touching.down) {
      // Jump when the player is touching the ground and the up arrow is pressed
      this.setPlayerVelocityY(this.JUMP_SPEED);

      // Swaps to use correct jump animation
      if(this.player.animations.currentAnim.name.indexOf('left') > -1) {
        this.player.animations.play('leftJump');
      } else {
        this.player.animations.play('rightJump');
      }
    }

    // Attacking
    if (this.keys.attack.isDown && this.player.body.touching.down &&
        this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0 &&
        !this.gameState.isAttacking) {

      this.gameState.isAttacking = true;
      this.game.time.events.add(150, this.onAttackTimerEnd, this);

      // Swaps to use correct attack animation
      if(this.player.animations.currentAnim.name.indexOf('left') > -1) {
        this.gameState.isAttackingLeft = true;
        this.player.animations.play('leftAttack');
        this.player.x -= 10;
      } else {
        this.gameState.isAttackingRight = true;
        this.player.animations.play('rightAttack');
        this.player.x += 10;
      }

      // Find closest ball from position the player is looking, and destroy it
      var closest = undefined;

      this.balls.forEach(function(_ball) {
        // Pick always closest matching criteria
        if(this.gameState.isAttackingLeft &&
          (_ball.x > this.player.x - 40 && _ball.x < this.player.x)) {
          if(!closest || _ball.x > closest.x) {
            closest = _ball;
          }
        } else if(this.gameState.isAttackingRight &&
          (_ball.x < this.player.x + this.PLAYER_WIDTH + 40 && _ball.x > this.player.x)) {
          if(!closest || _ball.x < closest.x) {
            closest = _ball;
          }
        }
      }, this, true);

      if(closest) {
        this.getExplosion(closest.x, closest.y);

        if(closest.ballType !== 1) {
          this.gameState.score += closest.ballScore;
        } else {
          this.MUSIC.dead.play();
          window.FINAL_SCORE = this.gameState.score;
          this.MUSIC.scene.stop();
          this.game.state.start('GameOver');
        }

        closest.kill();
        this.destroyBall();
      }
    }

  };

  /**
   *
   */
  Game.prototype.setPlayerVelocityX = function(velocity) {
    this.player.body.velocity.x = velocity;
  };

  /**
   *
   */
  Game.prototype.setPlayerVelocityY = function(velocity) {
    this.player.body.velocity.y = velocity;
  };

  /**
   *
   */
  Game.prototype.playRndExplosion = function() {
    this.MUSIC.explosion[this.game.rnd.integerInRange(0, 2)].play();
  };

  /**
   *
   */
  Game.prototype.onSpawnBall = function() {

    // Randomize which side to appear from (0 = left, 1 = right)
    var side = this.game.rnd.integerInRange(0, 1),
        ballX = side ? 608 : 32,
        ballY = this.game.rnd.integerInRange(128, 380),
        // Modify ?
        velocity = side ? -150 : 150;

    // Randomize the ball type (0 - 2)
    var ballType = this.game.rnd.integerInRange(1, 10);

    if(ballType > 7) {
      ballType = 0;
    } else if(ballType > 3) {
      ballType = 2;
    } else {
      ballType = 1;
    }

    var ball = this.balls.create(ballX, ballY, 'balls', ballType);
    ball.body.bounce.set(1);
    ball.body.velocity.x = velocity;
    ball.checkWorldBounds = true;
    ball.outOfBoundsKill = true;
    ball.anchor.set(0.5);
    ball.ballType = ballType;
    ball.ballScore = this.BALL_TYPES[ballType].score;
    ball.events.onOutOfBounds.add(this.destroyBall, this);
    this.gameState.timeToSpawn = this.gameState.timeToSpawn - 50;
    this.gameState.timeToSpawn = this.gameState.timeToSpawn < 600 ? 600 : this.gameState.timeToSpawn;
    this.game.time.events.add(this.gameState.timeToSpawn, this.onSpawnBall, this);
  };

  /**
   *
   */
  Game.prototype.onAttackTimerEnd = function() {
    this.gameState.isAttacking = false;
    this.gameState.isAttackingLeft = false;
    this.gameState.isAttackingRight = false;
  };

  /**
   *
   */
  Game.prototype.destroyBall = function(_ball) {
    this.balls.remove(_ball, false);
  };

  /**
   *
   */
  Game.prototype.collidePlayerToBall = function(_player, _ball) {
    // if collides with something other than red ball, its game over
    if(_ball.ballType !== 1) {
      this.MUSIC.dead.play();
      window.FINAL_SCORE = this.gameState.score;
      this.MUSIC.scene.stop();
      this.game.state.start('GameOver');
    }

    return false;
  };

  Game.prototype.getExplosion = function(x, y) {
    var explosion = this.ballExplosions.getFirstDead();

    if (explosion === null) {
        explosion = this.game.add.sprite(0, 0, 'explosion');
        explosion.anchor.setTo(0.5, 0.5);

        // Add an animation for the explosion that kills the sprite when the
        // animation is complete
        var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
        animation.killOnComplete = true;
        this.game.add.tween(explosion.scale).to( {
          x: this.game.rnd.integerInRange(1, 2),
          y: this.game.rnd.integerInRange(1, 2)
        }, 200, Phaser.Easing.Linear.None, true);

        // Add the explosion sprite to the group
        this.ballExplosions.add(explosion);
    }

    explosion.revive();

    // Move the explosion to the given coordinates
    explosion.x = x;
    explosion.y = y;

    // Set rotation of the explosion at random for a little variety
    explosion.angle = this.game.rnd.integerInRange(0, 360);

    // Play the animation
    explosion.animations.play('boom');
    this.playRndExplosion();

    // Return the explosion itself in case we want to do anything else with it
    return explosion;
  };

  return Game;
});
