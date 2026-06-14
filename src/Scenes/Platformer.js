class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init(data) {
        // variables and settings
        //this.ACCELERATION = 400;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1750; // 2000
        this.physics.world.TILE_BIAS = 24;
        //this.JUMP_VELOCITY = -650;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 4.0;
        this.TILE_SIZE = 18;
        this.canDie = true;

        //this.vfx = data.vfx || {};
    }

    createParticles() {

        this.vfx = {};

        // Create emitter at center
        this.vfx.coin = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_07.png',
            speed: { min: 10, max: 50 },
            scale: { start: 0.05, end: 0.025 },
            alpha: { start: 1, end: 0 },
            angle: { min: 0, max: 360 },
            lifespan: 2000,
            frequency: -1,
            quantity: 10,
            blendMode: 'NORMAL',
        });

        this.vfx.coin.setDepth(3);
        //this.vfx.coin.setScale(0.1);

        this.vfx.bgParticles = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_01.png',
            //speed: { min: 10, max: 50 },
            speed: (Math.random() - 0.5) * 5,
            scaleX: { start: 2, end: 0.4 },
            scaleY: { start: 0.25, end: 0.05 },
            alpha: { start: 1, end: 0 },
            angle: { min: 0, max: 360 },
            rotation: {min: -360, max: 360},
            quantity: 1,
            lifespan: 2000,
            frequency: 100,
            blendMode: 'NORMAL',
        });

        this.vfx.bgParticles.setDepth(-5);
        //this.vfx.bgParticles.pause();
    }

    create() {

        this.createParticles();

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        //this.map = this.add.tilemap("platformer-level-1", 18, 18, 80, 16);

        this.map = this.add.tilemap("test-platformer", 16, 16, 32, 16);
        this.final_tileset = this.map.addTilesetImage("final_tilemap", "final_tilemap_tiles");

        /*

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.pixel_tileset = this.map.addTilesetImage("pixelplat_tilemap", "pixel_tilemap_tiles");
        this.industry_tileset = this.map.addTilesetImage("industry_tilemap", "industry_tilemap_tiles");
        this.final_tileset = this.map.addTilesetImage("final_tilemap", "final_tilemap_tiles");

        // Create a layer
        this.parallax2Layer = this.map.createLayer("Parallax2", [this.pixel_tileset, this.industry_tileset, this.final_tileset], 0, 0);
        this.parallax1Layer = this.map.createLayer("Parallax1", [this.pixel_tileset, this.industry_tileset, this.final_tileset], 0, 0);
        this.bgLayer = this.map.createLayer("BackGround", [this.pixel_tileset, this.industry_tileset, this.final_tileset], 0, 0); //16 * this.TILE_SIZE
        this.groundLayer = this.map.createLayer("Ground", [this.pixel_tileset, this.industry_tileset, this.final_tileset], 0, 0);
        this.lavaLayer = this.map.createLayer("Lava", [this.pixel_tileset, this.industry_tileset, this.final_tileset], 0, 0);

        this.parallaxify(this.parallax2Layer, 0.25, 1.0, 16 * this.TILE_SIZE, 0, 0.75, 0.75);
        this.parallaxify(this.parallax1Layer, 0.5, 1.0, 16 * this.TILE_SIZE, 0, 0.875, 0.875);
        this.parallaxify(this.lavaLayer, 1.25, 1.0, -6 * this.TILE_SIZE, -4 *this.TILE_SIZE, 1.25, 1.25);
        //console.log(this.lavaLayer.getPosition());

        //this.parallax2Layer.setTint(0x444444);
        //this.parallax1Layer.setTint(0x888888);

        */

        this.bgLayer = this.map.createLayer("BackGround", [this.final_tileset], 0, 0); //16 * this.TILE_SIZE
        this.groundLayer = this.map.createLayer("Ground", [this.final_tileset], 0, 0);
        this.lavaLayer = this.map.createLayer("Lava", [this.final_tileset], 0, 0);

        // Make it collidable
        //this.groundLayer.setCollisionByProperty({
        //    collides: true
        //});
        
        
        this.groundLayer.setCollisionByExclusion([-1]);
        
        
        //this.lavaLayer.setCollisionByExclusion([-1]);

        // Create coins from Objects layer in tilemap
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "pixel_sheet",
            frame: 151
        });

        this.coins.forEach(c => c.setDepth(2));

        this.spawns = this.map.createFromObjects("Objects", {
            name: "spawn",
            key: "final_sheet",
            frame: 56
        });

        this.spawns.forEach(s => s.setDepth(0));

        this.spikes = this.map.createFromObjects("Objects", {
            name: "spike",
            key: "final_sheet",
            frame: 0
        });

        this.spikes.forEach(s => s.setDepth(2));

        this.superspikes = this.map.createFromObjects("Objects", {
            name: "super_spike",
            key: "final_sheet",
            frame: 1
        });

        this.superspikes.forEach(s => s.setDepth(2));

        this.springs = this.map.createFromObjects("Objects", {
            name: "spring",
            key: "pixel_sheet",
            frame: 108
        });

        this.springs.forEach(s => s.setDepth(2));

        this.powerUps = this.map.createFromObjects("Objects", {
            name: "mushroom",
            key: "pixel_sheet",
            frame: 128
        });

        this.powerUps.forEach(p => p.setDepth(2));

        this.charges = this.map.createFromObjects("Objects", {
            name: "charge",
            key: "final_sheet",
            frame: 60
        });

        this.charges.forEach(c => c.setDepth(2));

        // Now we do physics based objects
        // ===============================

        this.shells = this.map.createFromObjects("GravObjects", {
            name: "shell",
            key: "final_sheet",
            frame: 68
        });

        this.shells.forEach(s => {s.setDepth(0); s.isGravObject = true;});

        this.gravSprings = this.map.createFromObjects("GravObjects", {
            name: "grav_spring",
            key: "final_sheet",
            frame: 48
        });

        this.gravSprings.forEach(g => {g.setDepth(0); g.isGravObject = true; });
        
        // Create the animations for animated objects
        // ==========================================

        // Create animation for coins created from Object layer
        this.anims.create({
            key: 'coinAnim', // Animation key
            frames: this.anims.generateFrameNumbers('pixel_sheet', 
                {start: 151, end: 152}
            ),
            duration: 250,
            //frameRate: 10,  // Higher is faster
            repeat: -1      // Loop the animation indefinitely
        });

        this.anims.create({
            key: 'spawnAnim', // Animation key
            frames: this.anims.generateFrameNumbers('final_sheet', 
                {start: 56, end: 57}
            ),
            duration: 250,
            //frameRate: 10,  // Higher is faster
            repeat: -1      // Loop the animation indefinitely
        });

        this.anims.create({
            key: 'springAnim', // Animation key
            frames: this.anims.generateFrameNumbers('pixel_sheet', 
                {start: 107, end: 108}
            ),
            duration: 50,
            //frameRate: 10,  // Higher is faster
            repeat: 0      // Loop the animation indefinitely
        });

        this.anims.create({
            key: 'chargeAnim', // Animation key
            frames: this.anims.generateFrameNumbers('final_sheet', 
                {start: 60, end: 63}
            ),
            duration: 500,
            //frameRate: 10,  // Higher is faster
            repeat: -1      // Loop the animation indefinitely
        });

        // Create animations for physics based objects
        // ===========================================

        this.anims.create({
            key: 'gravSpringAnim', // Animation key
            frames: this.anims.generateFrameNumbers('final_sheet', {
                frames: [48, 49, 50, 48]
            }),
            duration: 100,
            //frameRate: 10,  // Higher is faster
            repeat: 0      // Loop the animation indefinitely
        });

        // Play the same animation for every member of each group of animated objects
        this.anims.play('coinAnim', this.coins);
        this.anims.play('spawnAnim', this.spawns);
        this.anims.play('chargeAnim', this.charges);

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spawns, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.superspikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.powerUps, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.springs, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.charges, Phaser.Physics.Arcade.STATIC_BODY);

        // Enable physics for physics based objects
        // ========================================

        this.physics.world.enable(this.shells, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.physics.world.enable(this.gravSprings, Phaser.Physics.Arcade.DYNAMIC_BODY);

        this.shells.forEach(s => {s.body.setBounce(1.0, 0.0);});
        this.gravSprings.forEach(g => {g.body.setBounce(0.5, 0.0);});

        this.physics.add.collider(this.shells, this.groundLayer);
        this.physics.add.collider(this.gravSprings, this.groundLayer);

        // Fix hitboxes for static objects
        // ===============================

        this.spikes.forEach(spike => {

            const baseWidth = 8;
            const baseHeight = 4;
            const baseCenterX = 0;
            const baseCenterY = spike.height / 4;

            this.rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, spike);
        });

        this.superspikes.forEach(spike => {

            const baseWidth = 8;
            const baseHeight = 4;
            const baseCenterX = 0;
            const baseCenterY = spike.height / 4;

            this.rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, spike);
        });

        this.springs.forEach(spring => {

            const baseWidth = 12;
            const baseHeight = 8;
            const baseCenterX = 0;
            const baseCenterY = (spring.height - (baseHeight + 12)) / 2;

            this.rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, spring);
        });

        // Fix hitboxes for physics based objects
        // ======================================

        this.shells.forEach(shell => {

            const baseWidth = 16;
            const baseHeight = 12;
            const baseCenterX = 0;
            const baseCenterY = (shell.height - (baseHeight)) / 2;

            this.rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, shell);
        });

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.spawnGroup = this.add.group(this.spawns);
        this.spikeGroup = this.add.group(this.spikes);
        this.superspikeGroup = this.add.group(this.superspikes);
        this.powerUpsGroup = this.add.group(this.powerUps);
        this.springGroup = this.add.group(this.springs);
        this.chargeGroup = this.add.group(this.charges);
        this.shellGroup = this.add.group(this.shells);
        this.gravSpringGroup = this.add.group(this.gravSprings);

        this.spawn = this.spawnGroup.getChildren()[0]; // get the first spawn point (there's only one in this level)
        console.log(this.spawn);
        this.start = {x: this.spawn.x, y: this.spawn.y};

        // set up Phaser-provided cursor key input
        this.cursors = {};
        this.cursors.left = this.input.keyboard.addKey('A');
        this.cursors.right = this.input.keyboard.addKey('D');
        this.cursors.up = this.input.keyboard.addKey('W');
        this.cursors.down = this.input.keyboard.addKey('S');

        this.cursors.jump = this.input.keyboard.addKey('SPACE');
        this.cursors.twirl = this.input.keyboard.addKey('M');
        this.cursors.dash = this.input.keyboard.addKey('COMMA');
        this.cursors.grab = this.input.keyboard.addKey('PERIOD');
        this.cursors.spin = this.input.keyboard.addKey('L');

        this.rKey = this.input.keyboard.addKey('R');

        this.prevPadState = { jump: false, twirl: false, dash: false, grab: false, spin: false };
        this.padJumpJustPressed = false;
        this.padTwirlJustPressed = false;
        this.padDashJustPressed = false;
        this.padGrabJustPressed = false;
        this.padSpinJustPressed = false;

        this.padJumpHeld = false;
        this.padGrabHeld = false;
        this.padSpinHeld = false;

        // set up player avatar
        //my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player = new Player(this, this.start.x, this.start.y, "platformer_characters", "tile_0000.png", this.cursors);
        my.sprite.player.setDepth(1);

        // Enable collision handling
        //this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.physics.add.overlap(my.sprite.player, this.lavaLayer, (obj1, obj2) => {

            my.sprite.player.isRespawning = true;
            my.sprite.player.setPosition(this.start.x, this.start.y);
            my.sprite.player.setVelocity(0,0);

        }, (obj1, obj2) => {
            return obj2.index !== -1; // Ensures no empty collisions are getting fired
        });
        
        // Add interaction for coins with coin callback
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.vfx.coin.emitParticleAt(obj2.x, obj2.y);
            obj2.destroy(); // remove coin on overlap
        });

        this.physics.add.overlap(my.sprite.player, this.spawnGroup, (obj1, obj2) => {
            this.start = {x: obj2.x, y: obj2.y}; // update spawn point to current flag position
        });

        const handleKill = (obj1, obj2) => {
            if(!this.canDie) return;
            my.sprite.player.setPosition(this.start.x, this.start.y);
            my.sprite.player.setVelocity(0,0);
        }

        const handleBounceKill = (obj1, obj2) => { 
            if(!this.canDie) return;

            const playerBottom = my.sprite.player.body.y + my.sprite.player.body.height;
            const spikeTop = obj2.body.y;

            const aboveSpike = playerBottom <= spikeTop + 4;

            if(my.sprite.player.isSpin && aboveSpike){
                my.sprite.player.body.velocity.y = my.sprite.player.JUMP_VELOCITY * my.sprite.player.SPIN_MULTIPLIER;
            } else {
                my.sprite.player.setPosition(this.start.x, this.start.y);
                my.sprite.player.setVelocity(0,0);
            }
        };

        this.groundLayer.setCollisionByProperty({ isKill: true });
        this.groundLayer.setCollisionByProperty({ isBounce: true });

        this.physics.add.collider(my.sprite.player, this.groundLayer, (player, tile) => {
            
            if (!tile.properties) return;
            console.log(tile.properties);
            if (tile.properties.isBounce && tile.properties.isKill) {
                console.log("bounce kill");
                handleBounceKill(player, tile);
            } else if (tile.properties.isKill) {
                console.log("normal kill");
                handleKill(player, tile);
            }
        });

        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            handleBounceKill(obj1, obj2);
        });

        this.physics.add.overlap(my.sprite.player, this.superspikeGroup, (obj1, obj2) => {
            handleKill(obj1, obj2);
        });

        // Handle collision detection with power-ups
        this.physics.add.overlap(my.sprite.player, this.powerUpsGroup, (obj1, obj2) => {
            obj2.destroy(); // remove power-up on overlap
            this.isPoweredUp = true;
            let powerUpTween = this.tweens.add({
                targets: my.sprite.player,
                onComplete: () => {
                    this.isPoweredUp = false;
                    //my.sprite.player.set
                }
            });
        });

        this.physics.add.overlap(my.sprite.player, this.chargeGroup, (obj1, obj2) => {
            if (obj2.body.visible === false) return;
            my.sprite.player.isDash = true;
            obj2.body.visible = false;

            this.tweens.add({
                targets: obj2,
                alpha: 0.5,
                duration: 500,
                onComplete: () => {  
                    this.time.delayedCall(2000, () => {
                        this.tweens.add({
                            targets: obj2,
                            alpha: 1.0,
                            duration: 500,
                            onComplete: () => { obj2.body.visible = true; },
                        });
                    });
                },
            });
        });

        this.physics.add.overlap(my.sprite.player, this.springGroup, (obj1, obj2) => {

            const SPRING_FORCE = 500;

            let angle = Phaser.Math.DegToRad(obj2.angle - 90);

            let cos = Math.cos(angle);
            let sin = Math.sin(angle);

            my.sprite.player.body.setVelocity(cos * SPRING_FORCE, sin * SPRING_FORCE);
            my.sprite.player.isDash = true;

            this.anims.play('springAnim', obj2);
            //my.sprite.player.setVelocity(,0);
        });

        const omniDirectionalThrow = (obj1, obj2) => {

            const isPlayer = obj1 === my.sprite.player;

            if (isPlayer){
                if (my.sprite.player.isGrabInteractable == false) return;
                if (my.sprite.player.holdingSomething && my.sprite.player.grabbedObject == obj2) return;
            }

            const SPRING_FORCE = 250;

            let angle = Phaser.Math.DegToRad(obj2.angle - 90);

            let cos = Math.cos(angle);
            let sin = Math.sin(angle);

            let springCenterX = obj2.body.x + obj2.width/2;
            let springCenterY = obj2.body.y + obj2.height/2;
            let playerCenterX = obj1.body.x + obj1.body.width/2;
            let playerCenterY = obj1.body.y + obj1.body.height/2;

            let dx = playerCenterX - springCenterX;
            let dy = playerCenterY - springCenterY;

            let dot = dx * cos + dy * sin;

            const THRESHOLD = obj2.height / 8; // obj2.height / 4
            if (Math.abs(dot) < THRESHOLD) return;
            
            let dir = dot > 0 ? 1 : -1;

            obj1.body.setVelocity(dir * cos * SPRING_FORCE, dir * sin * SPRING_FORCE);
            if (isPlayer) obj1.isDash = true;

            this.anims.play('gravSpringAnim', obj2);
            if (dir > 0){
                obj2.flipX = false;
                obj2.flipY = false;
            } else {
                obj2.flipX = true;
                obj2.flipY = true;
            }
        };

        this.physics.add.overlap(my.sprite.player, this.gravSpringGroup, (player, gravSpring) => {
            omniDirectionalThrow(player, gravSpring);
        });

        this.physics.add.overlap(this.shellGroup, this.gravSpringGroup, (shell, gravSpring) => {
            omniDirectionalThrow(shell, gravSpring);
        });

        /*
        const playerBottom = my.sprite.player.body.y + my.sprite.player.body.height;
            const spikeTop = obj2.body.y;

            const aboveSpike = playerBottom <= spikeTop + 4;

            if(my.sprite.player.isSpin && aboveSpike){
                my.sprite.player.body.velocity.y = my.sprite.player.JUMP_VELOCITY * my.sprite.player.SPIN_MULTIPLIER;
            } else {
                my.sprite.player.setPosition(this.start.x, this.start.y);
                my.sprite.player.setVelocity(0,0);
            }
        */

        this.physics.add.overlap(my.sprite.player, this.shellGroup, (obj1, obj2) => {

            if (my.sprite.player.isGrabInteractable == false || obj2.cantCollide) return;

            if(my.sprite.player.holdingSomething && my.sprite.player.grabbedObject == obj2) return;

            let shellCenterX = obj2.body.x + obj2.width/2;
            let playerCenterX = my.sprite.player.body.x + my.sprite.player.body.width/2;

            let dx = playerCenterX - shellCenterX;

            const COLLISION_THRESHOLD = obj2.height * (2.0 / 4.0); // obj2.height / 2

            const shellTop = obj2.body.y;
            const playerBottom = my.sprite.player.body.y + my.sprite.player.body.height;
            const aboveShell = playerBottom <= shellTop + COLLISION_THRESHOLD;
            
            const THROW_STRENGTH = 250.0;

            /*if(obj2.body.blocked.down) {
                if (obj2.body.velocity.x === 0) {
                    let dir = dx > 0 ? 1 : -1;
                    obj2.body.setVelocityX(dir * THROW_STRENGTH);
                    return;
                }
            }*/

            if(Math.abs(obj2.body.velocity.x) < THROW_STRENGTH / 2.0) {
                let dir = dx < 0 ? 1 : -1;
                obj2.body.setVelocityX(dir * THROW_STRENGTH);
                obj2.noGroundDrag = true;
                obj2.body.setDragX(0);
            }

            else if(aboveShell){
                my.sprite.player.body.velocity.y = my.sprite.player.JUMP_VELOCITY * my.sprite.player.SPIN_MULTIPLIER;
                obj2.body.setVelocityX(0);

                my.sprite.player.shellJumpWindow = true;
                my.sprite.player.shellJumpTimer = my.sprite.player.SHELL_JUMP_WINDOW;
            } else {
                my.sprite.player.setPosition(this.start.x, this.start.y);
                my.sprite.player.setVelocity(0,0);
                console.log("failed shell jump");
            }

            obj2.cantCollide = true;
            this.time.delayedCall(500, () => { obj2.cantCollide = false; });
        });

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-CTRL', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            if(this.physics.world.debugGraphic){
                this.physics.world.debugGraphic.clear();
            }
            if (this.physics.world.drawDebug){
                this.physics.world.createDebugGraphic();
            }
        }, this);

        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        
        const cam = this.cameras.main;
        const camW = cam.width / cam.zoom;
        const camH = cam.height / cam.zoom;

        //this.vfx.bgparticles.clearEmitZones();
        this.vfx.bgParticles.addEmitZone({ 
            type: 'random', 
            source: new Phaser.Geom.Rectangle(-camW/2, -camH/2, camW, camH), 
        });

        this.map.layers.forEach(layerData => {
            layerData.data.forEach(row => {
                row.forEach((tile, i) => {
                    if(tile === null){
                        row[i] = new Phaser.Tilemaps.Tile(layerData, -1, 0, 0, this.map.tileWidth, this.map.tileHeight, this.map.tileWidth, this.map.tileHeight);
                    }
                });
            });
        });

        // Initialize the animated tiles plugin
        // This line needs to come *after* any line which creates a tilemap layer.
        // Putting this at the end of create() is a safe place
        this.animatedTiles.init(this.map);

    }

    update(time, delta) {

        let dt = delta / 1000;
        //let my = this.my;

        const pad = this.input.gamepad.getPad(0);

        if (pad) {
            const rawX = pad.leftStick.x;
            const rawY = pad.leftStick.y;
            const DEAD_ZONE = 0.35;

            my.sprite.player.stickX = Math.abs(rawX) > DEAD_ZONE ? rawX : 0;
            my.sprite.player.stickY = Math.abs(rawY) > DEAD_ZONE ? rawY : 0;

            //this.cursors.left.isDown = this.cursors.left.isDown || stickX < -DEAD_ZONE;
            //this.cursors.right.isDown = this.cursors.right.isDown || stickX > DEAD_ZONE;
            //this.cursors.up.isDown = this.cursors.up.isDown || stickY < -DEAD_ZONE;
            //this.cursors.down.isDown = this.cursors.down.isDown || stickY > DEAD_ZONE;

            //this.cursors.jump.isDown = this.cursors.jump.isDown || pad.buttons[0].pressed;
            //this.cursors.spin.isDown = this.cursors.spin.isDown || pad.buttons[5].pressed;
            //this.cursors.dash.isDown = this.cursors.dash.isDown || pad.buttons[7].pressed;
        
            const jumpPressed = pad.buttons[0].pressed;
            const twirlPressed = pad.buttons[5].pressed;
            const dashPressed = pad.buttons[7].pressed; // 2
            const grabPressed = pad.buttons[2].pressed;
            const spinPressed = pad.buttons[4].pressed; // 7

            this.padJumpJustPressed = jumpPressed && !this.prevPadState.jump;
            this.padTwirlJustPressed = twirlPressed && !this.prevPadState.twirl;
            this.padDashJustPressed = dashPressed && !this.prevPadState.dash;
            this.padGrabJustPressed = grabPressed && !this.prevPadState.grab;
            this.padSpinJustPressed = spinPressed && !this.prevPadState.spin;

            this.padJumpHeld = jumpPressed;
            this.padGrabHeld = grabPressed;
            this.padSpinHeld = spinPressed;
            
            this.prevPadState = { jump: jumpPressed, twirl: twirlPressed, dash: dashPressed, grab: grabPressed, spin: spinPressed};
        }

        const cam = this.cameras.main;

        // Lock particles to camera
        this.vfx.bgParticles.setPosition(cam.scrollX + cam.width / 2, cam.scrollY + cam.height / 2);

        /*
        this.shells.forEach(shell => {
            if (shell.active && shell.isGravObject){

                const gravObjectMultConst = 1 * (2.0 / 4.0);

                shell.body.setAccelerationY(this.physics.world.gravity.y * gravObjectMultConst);
                shell.body.setDragX(0);

                if (shell.body.blocked.left || shell.body.blocked.right) {
                    //console.log(`Velocity before: ${shell.body.velocity.x}`);
                    shell.body.setVelocityX(-shell.throwSpeed / 2);
                    //console.log(`Velocity after: ${shell.body.velocity.x}`);
                    console.log("SHELL BOUNCE");
                }
            }
        }); */

        /*this.gravSprings.forEach(gSpring => {
            if (gSpring.active && gSpring.isGravObject){

                const gravObjectMultConst = 1 * (2.0 / 4.0);

                gSpring.body.setAccelerationY(this.physics.world.gravity.y * gravObjectMultConst);
                gSpring.body.setAccelerationX(0);

            }
        }); */

        this.shells.forEach(shell => {
            if (shell.body.blocked.down && !shell.noGroundDrag) {
                shell.body.setDragX(this.DRAG);
                //console.log("SHELL DRAG");
            } else {
                shell.body.setDragX(0);
            }
        });
        this.gravSprings.forEach(gSpring => {
            if (gSpring.body.blocked.down) {
                gSpring.body.setDragX(this.DRAG);
                //console.log("GRAV SPRING DRAG");
            } else {
                gSpring.body.setDragX(0);
            }
        });

        my.sprite.player.update(time, delta);

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }

    rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, object){

        const angle = Phaser.Math.DegToRad(Math.round(object.angle));

        const centerX = object.width / 2;
        const centerY = object.height / 2;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const rotatedW = baseWidth * Math.abs(cos) + baseHeight * Math.abs(sin);
        const rotatedH = baseWidth * Math.abs(sin) + baseHeight * Math.abs(cos);
        const rotatedCenterX = baseCenterX * cos - baseCenterY * sin;
        const rotatedCenterY = baseCenterX * sin + baseCenterY * cos;

        const offsetX = centerX + rotatedCenterX - rotatedW / 2;
        const offsetY = centerY + rotatedCenterY - rotatedH / 2;

        object.body.setSize(rotatedW, rotatedH);
        object.body.setOffset(offsetX, offsetY);
    }

    parallaxify(layer, ratioX, ratioY, positionX = 0, positionY = 0, scaleX = 1, scaleY = 1){
        layer.setScrollFactor(ratioX, ratioY);
        layer.setScale(scaleX, scaleY);
        layer.setPosition(positionX, positionY);
    }
}