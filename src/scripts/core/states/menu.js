define(function () {
  'use strict';

  /**
   *
   */
  var Menu = function (game) {
    this.game = game;
  };

  /**
   *
   */
  Menu.prototype.preload = function() {
  };

  /**
   *
   */
  Menu.prototype.create = function() {
    // Environment
    this.menu = this.game.add.sprite(0, 0, 'menu');
    this.menu.alpha = 0;
    this.isSwitchingScene = false;

    // Music
    this.MUSIC = {
      enter: this.game.add.audio('enter')
    };

    // Creates keys
    this.keys = {
      enter: this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
    };

    this.game.add.tween(this.menu).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);

    this.tweenOut = this.game.add.tween(this.menu);
    this.tweenOut.to( { alpha: 0 }, 500, Phaser.Easing.Linear.None);
    this.tweenOut.onComplete.add(function() {
      document.getElementById('who-made-what').style.display = 'none';
      this.game.state.start('Game');
    }, this);
  };

  /**
   * Updates on each frame
   */
  Menu.prototype.update = function() {

    if (this.keys.enter.isDown && !this.isSwitchingScene) {
      this.isSwitchingScene = true;
      this.MUSIC.enter.play();
      this.tweenOut.start();
    }

  };

  return Menu;
});
