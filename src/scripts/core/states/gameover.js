define(function () {
  'use strict';

  /**
   *
   */
  var GameOver = function (game) {
    this.game = game;
  };

  /**
   *
   */
  GameOver.prototype.preload = function() {
    this.game.load.image('gameOver', 'assets/game_over_final.png');
  };

  /**
   *
   */
  GameOver.prototype.create = function() {
    // Environment
    this.gameOver = this.game.add.sprite(0, 0, 'gameOver');
    this.gameOver.alpha = 0;
    this.isSwitchingScene = false;

    // Music
    this.MUSIC = {
      enter: this.game.add.audio('enter')
    };

    // Creates keys
    this.keys = {
      enter: this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
    };

    this.scoreText = this.game.add.text( //
      this.game.world.centerX, 236, "SCORE: " + (window.FINAL_SCORE ? window.FINAL_SCORE : 0), { font: '22px Arial', fill: 'white', fontWeight: 'bold' }
    );
    this.scoreText.anchor.set(0.5);

    this.game.add.tween(this.gameOver).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);

    this.tweenOut = this.game.add.tween(this.gameOver);
    this.tweenOut.to( { alpha: 0 }, 500, Phaser.Easing.Linear.None);
    this.tweenOut.onComplete.add(function() {
      this.game.state.start('Game');
    }, this);
  };

  /**
   * Updates on each frame
   */
  GameOver.prototype.update = function() {

    if (this.keys.enter.isDown && !this.isSwitchingScene) {
      this.isSwitchingScene = true;
      this.MUSIC.enter.play();
      this.tweenOut.start();
    }

  };

  return GameOver;
});
