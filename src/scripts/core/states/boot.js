define(['core/states/menu'], function (Menu) {
  'use strict';

  /**
   *
   */
  var Boot = function (game) {
    this.game = game;
  };

  /**
   *
   */
  Boot.prototype.preload = function() {
    this.game.load.image('menu', 'assets/menu_final.png');

    // Sounds
    this.game.load.audio('explosion1', ['assets/Explosion.mp3', 'assets/Explosion.ogg']);
    this.game.load.audio('explosion2', ['assets/Explosion13.mp3', 'assets/Explosion13.ogg']);
    this.game.load.audio('explosion3', ['assets/Explosion14.mp3', 'assets/Explosion14.ogg']);
    this.game.load.audio('dead', ['assets/dead.mp3', 'assets/dead.ogg']);
    this.game.load.audio('enter', ['assets/enter.mp3', 'assets/enter.ogg']);
    this.game.load.audio('scene', ['assets/karete.mp3', 'assets/karete.ogg']);
  };

  /**
   *
   */
  Boot.prototype.create = function() {
    this.game.state.start('Menu');
  };

  return Boot;
});
