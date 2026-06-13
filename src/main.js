// Jim Whitehead
// Created: 5/18/2025
// Phaser: 3.70.0
//
// Animated Tiles Example
//
// An example platformer layer with animated tiles. Demonstrates use
// of the animated tiles plugin for Phaser.
//


// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    input: {
        gamepad: true,
    },
    plugins: {
        scene:[{
            key: 'AnimatedTiles',
            plugin: AnimatedTiles,
            mapping: 'animatedTiles'
        }]
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1600,
    height: 800,
    scene: [Load, Platformer]
}

var cursors;
var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);