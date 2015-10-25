require.config({
  paths: {
    'phaser': 'vendor/phaser-official/build/phaser'
  },
  shim: {
    phaser: {
      exports: 'Phaser'
    }
  }
});

/**
 *
 *
 */
define(['phaser', 'core/states/boot', 'core/states/game', 'core/states/gameover', 'core/states/menu'], function (Phaser, Boot, Game, GameOver, Menu) {
  'use strict';

  (function() {
    var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');
    game.state.add('Boot', Boot, true);
    game.state.add('Menu', Menu);
    game.state.add('Game', Game);
    game.state.add('GameOver', GameOver);
  })();

});
