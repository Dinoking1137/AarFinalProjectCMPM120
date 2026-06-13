class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("pixel_tilemap_tiles", "pixel_tilemap_packed.png");
        this.load.image("industry_tilemap_tiles", "industry_tilemap_packed.png");
        this.load.image("final_tilemap_tiles", "final_project_tilemap_packed.png");

        this.load.spritesheet("pixel_sheet", "pixel_tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("industry_sheet", "industry_tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("final_sheet", "final_project_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("test-platformer", "test-platformer.tmj");   // Tilemap in JSON

        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 18,
                end: 19,
                suffix: ".png",
                zeroPad: 4,
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0018.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'crouch',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0020.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0019.png" }
            ],
        });

        //this.params = {
        //    frequency: 100,
        //    lifespan: 2000,
        //    quantity: 1,
        ///    speed: 200,
        //    emitting: true
        //};

         // ...and pass to the next Scene
        this.scene.start("platformerScene", {vfx: this.vfx});
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}