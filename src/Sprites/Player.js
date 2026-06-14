class Player extends Phaser.Physics.Arcade.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, cursors, showHitboxes = false) {
        super(scene, x, y, texture, frame);
        
        this.cursors = cursors;
        this.stickX = 0;
        this.stickY = 0;

        this.score = 0;
        //this.bulletSpeed = -1000;
        //this.isActive = true;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        //this.body.setSize(20, 40);
        //this.body.setOffset(5, 8);

        this.bodyW = this.width * (1/2);
        this.bodyH = this.height * (4/8)
        this.bodyOffX = this.bodyW / 2;
        this.bodyOffY = this.height - this.bodyH;


        this.body.setSize(this.bodyW, this.bodyH);
        this.body.setOffset(this.bodyOffX, this.bodyOffY);

        this.init();
        return this;
    }

    init() {

        // Movement
        this.ACCELERATION = 400;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.MAX_VELOCITY_X = 250;
        this.MAX_VELOCITY_Y = 500;

        // Jump
        this.JUMP_VELOCITY = -500;
        this.JUMP_CUT_MULTIPLIER = 0.35;
        this.isJumping = false;

        // Coyote time
        this.COYOTE_TIME = 100; 
        this.coyoteTimer = 0;

        // Jump Buffer
        this.JUMP_BUFFER_TIME = 100;
        this.jumpBufferTimer = 0;

        // Dash
        this.canDash = true;
        this.DASH_DIRECTIONAL_VELOCITY = 500;
        this.DASH_DURATION = 200;

        // Twirl
        this.canTwirl = true;
        this.TWIRL_MULTIPLIER = 0.35;

        // Spin
        this.SPIN_FLIP_INTERVAL = 50; // ms between spin flips
        this.spinFlipTimer = 0;
        this.isSpinning = false;

        // Shell Jump
        this.shellJumpWindow = false;
        this.shellJumpTimer = 0;
        this.SHELL_JUMP_WINDOW = 200; //ms after shell jump to press jump

        this.SHELL_JUMP_BUMP_VELOCITY = -150;
        this.SHELL_SPIN_BUMB_VELOCITY = -75;

        // Grab
        this.holdingSomething = false;
        this.grabbedObject = null;
        this.isGrabInteractable = true;

        // FlipLock
        this.isFlipLocked = false;

        this.setMaxVelocity(this.MAX_VELOCITY_X, this.MAX_VELOCITY_Y);

        this.current_state = 'IDLE';
        this.states = {
            IDLE: {update: this.update_IDLE.bind(this)},
            WALK: {update: this.update_WALK.bind(this)},
            JUMP: {update: this.update_JUMP.bind(this)},
            SPIN_JUMP : {update: this.update_SPIN_JUMP.bind(this)},
            FALL: {update: this.update_FALL.bind(this)},
            CROUCH: {update: this.update_CROUCH.bind(this)},
            DASH: {update: this.update_DASH.bind(this)},
            TWIRL: {update: this.update_TWIRL.bind(this)},
            WALL_SLIDE: {update: this.update_WALL_SLIDE.bind(this)},
        };

    }

    // Handle states

    transitionTo(newState) {
        if (this.current_state === newState) return;

        const exitFn = this[`exit_${this.current_state}`];
        if (exitFn) exitFn.call(this);

        const prevState = this.current_state;
        this.current_state = newState;

        const enterFn = this[`enter_${newState}`];
        if (enterFn) enterFn.call(this, prevState);

        console.log(`Transitioned from ${prevState} to ${newState}`);
    }

    // Shared Input Helper Functions

    gatherInput() {
        return {
            inputX: this.getInputX(),
            inputY: this.getInputY(),
            jumpJustDown: Phaser.Input.Keyboard.JustDown(this.cursors.jump) || this.scene.padJumpJustPressed,
            twirlJustDown: Phaser.Input.Keyboard.JustDown(this.cursors.twirl) || this.scene.padTwirlJustPressed,
            grabJustDown: Phaser.Input.Keyboard.JustDown(this.cursors.grab) || this.scene.padGrabJustPressed,
            dashJustDown: Phaser.Input.Keyboard.JustDown(this.cursors.dash) || this.scene.padDashJustPressed,
            grabHeld: this.cursors.grab.isDown || this.scene.padGrabHeld,
            spinHeld: this.cursors.spin.isDown || this.scene.padSpinHeld,
            jumpHeld: this.cursors.jump.isDown || this.scene.padJumpHeld,
        };
    }

    getInputX() {
        let x = 0;
        if (this.cursors.left.isDown) x -= 1;
        if (this.cursors.right.isDown) x += 1;
        if (Math.abs(this.stickX) > Math.abs(x)) x = this.stickX;
        return x;
    }

    getInputY() {
        let y = 0;
        if (this.cursors.up.isDown) y -= 1;
        if (this.cursors.down.isDown) y += 1;
        if (Math.abs(this.stickY) > Math.abs(y)) y = this.stickY;
        return y;
    }

    // Reusable Functions

    applyHorizontalMovement(inputX) {
        if (inputX !== 0) {
            this.setAccelerationX(inputX * this.ACCELERATION);
            if(!this.isFlipLocked) this.setFlip(inputX > 0);
        } else {
            this.setAccelerationX(0);
            this.setDragX(this.DRAG);
        }
    }

    updateCoyoteTimer(delta) {
        if (!this.body.blocked.down) {
            this.coyoteTimer += delta;
        } else {
            this.coyoteTimer = 0;
        }
    }

    updateJumpBufferTimer(delta, jumpJustDown) {
        if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= delta;
        if (jumpJustDown) this.jumpBufferTimer = this.JUMP_BUFFER_TIME;
    }

    // Jump Helpers

    tryConsumeJump() {
        if (this.jumpBufferTimer > 0 && this.coyoteTimer < this.COYOTE_TIME) {
            this.jumpBufferTimer = 0;
            this.body.setVelocityY(this.JUMP_VELOCITY);
            this.clearGroundedFlags();
            this.coyoteTimer = this.COYOTE_TIME; // Reset coyote timer
            this.isJumping = true;
            return true;
        }
        return false;
    }

    tryWallJump(inputX) {
        if(this.holdingSomething) return false;
        if (this.jumpBufferTimer > 0 && (this.body.blocked.left || this.body.blocked.right)) {
            const wallDir = this.body.blocked.left ? 1 : -1;
            this.body.setVelocityX(wallDir * this.MAX_VELOCITY_X * (3.0 / 4.0));
            this.body.setVelocityY(this.JUMP_VELOCITY);
            this.clearGroundedFlags(true);
            this.jumpBufferTimer = 0;
            this.isJumping = true;
            return true;
        }
        return false;
    }

    applyJumpCut(jumpHeld) {
        if (this.isJumping && !jumpHeld && this.body.velocity.y < 0) {
            this.body.setVelocityY(this.body.velocity.y * this.JUMP_CUT_MULTIPLIER);
            this.isJumping = false;
            return true;
        }
        return false;
    }

    // Shell Jump Helper Functions
    triggerShellJumpWindow(isSpin = false) {
        const bump = isSpin ? this.SHELL_SPIN_BUMP_VELOCITY : this.SHELL_JUMP_BUMB_VELOCITY;
        this.body.setVelocityY(bump);

        this.coyoteTimer = 0; // Reset so that variable jump height can be done

        this.shellJumpWindow = true;
        this.shellJumpIsSpin = isSpin;
        this.shellJumpTimer = this.SHELL_JUMP_WINDOW;
    }

    updateShellJumpWindow(delta, jumpJustDown, spinHeld) {
        if (!this.shellJumpWindow) return false;

        this.shellJumpTimer -= delta;

        if (jumpJustDown) {
            if (this.shellJumpIsSpin || spinHeld) {
                this.body.setVelocityY(this.JUMP_VELOCITY * this.TWIRL_MULTIPLIER * 1.5);
                this.clearGroundedFlags();
                this.isJumping = true;
                this.shellJumpWindow = false;
                this.transitionTo('SPIN_JUMP');
            } else {
                this.body.setVelocityY(this.JUMP_VELOCITY);
                this.clearGroundedFlags();
                this.isJumping = true;
                this.shellJumpWindow = false;
                this.transitionTo('JUMP');
            }
            
            return true;
        }

        if (this.shellJumpTimer <= 0) {
            this.shellJumpWindow = false;
        }
        
        return false;
    }

    // Clear Flags
    
    clearGroundedFlags(clearWalls = false){
        this.body.blocked.down = false;
        this.body.touching.down = false;
        if (clearWalls) {
            this.body.blocked.left = false;
            this.body.blocked.right = false;
            this.body.touching.left = false;
            this.body.touching.right = false;
        }

    }

    // SPIN

    applySpinFlip(delta, spinHeld) {
        if (spinHeld && !this.body.blocked.down) {
            this.spinFlipTimer += delta;
            this.isFlipLocked = true;
            if (this.spinFlipTimer >= this.SPIN_FLIP_INTERVAL) {
                this.spinFlipTimer = 0;
                this.setFlipX(!this.flipX);
            }
        } else {
            //this.isFlipLocked = false;
            this.spinFlipTimer = 0;
        }
    }

    // Grab Shenanigans

    updateGrab(inputX, inputY, grabHeld, grabJustDown) {
        if (grabHeld && !this.holdingSomething && this.isGrabInteractable) {
            const grabOffsetX = this.flipX ? -this.body.width / 2 : this.body.width / 2;
            const grabbed = this.scene.physics.overlapCirc(this.x + grabOffsetX, this.y, 20, true, true)
                .filter(body => body.gameObject !== this && body.gameObject.isGravObject)
                .map(body => body.gameObject);
            if (grabbed.length > 0 && Math.abs(grabbed[0].body.velocity.x) < 125) {
                this.holdingSomething = true;
                this.grabbedObject = grabbed[0];
                this.grabbedObject.body.enable = false;
            }
        }

        if (this.holdingSomething && this.grabbedObject) {
            const grabOffsetX = this.flipX ? this.body.width / 2 : -this.body.width / 2;
            this.grabbedObject.setPosition(this.x + grabOffsetX, this.y);
            this.grabbedObject.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
        }

        if (!grabHeld && this.holdingSomething) {
            this.releaseGrabbedObject(inputX, inputY);
        }
    }

    releaseGrabbedObject(inputX, inputY) {
        if(!this.grabbedObject) return;

        this.grabbedObject.body.enable = true;
        this.grabbedObject.body.reset(this.grabbedObject.x, this.grabbedObject.y);

        const releaseStrength = 250;
        const dx = inputX !== 0 ? inputX : (this.flipX ? 1 : -1);

        if (inputY < -0.5) {
            this.grabbedObject.body.setVelocity(dx * releaseStrength / 4, -releaseStrength * 3);
            this.grabbedObject.noGroundDrag = false;
        } else if (inputY > 0.5) {
            this.grabbedObject.body.setVelocity(dx * releaseStrength * (3.0 / 8.0), -releaseStrength/2);
            this.grabbedObject.noGroundDrag = false;
        } else {
            this.grabbedObject.body.setVelocity(dx * releaseStrength, -releaseStrength/2);
            if (this.grabbedObject.name === "shell"){
                this.grabbedObject.noGroundDrag = true;
                this.grabbedObject.body.setDragX(0);
            }
        }
        
        this.grabbedObject = null;
        this.holdingSomething = false;
        this.isGrabInteractable = false;

        this.scene.time.delayedCall(100, () => {
            this.isGrabInteractable = true;
        });

    }

    update(time, delta) {
        const state = this.states[this.current_state];
        this.applySpinFlip(delta, this.isSpinning);
        if (state) state.update(time, delta);

        if(this.isSpinning){
            console.log('SPINNING');
        }
    }

    // ==========
    // IDLE State
    // ==========

    enter_IDLE() {
        this.anims.play('idle');
        this.canDash = true;
        this.canTwirl = true;
        this.isSpinning = false;
        this.isJumping = false;
        this.isFlipLocked = false;
        this.body.setSize(this.bodyW, this.bodyH);
        this.body.setOffset(this.bodyOffX, this.bodyOffY);
    }

    update_IDLE(time, delta) {
        const inp = this.gatherInput();
        this.updateCoyoteTimer(delta);
        this.updateJumpBufferTimer(delta, inp.jumpJustDown);
        this.applyHorizontalMovement(inp.inputX);
        this.updateGrab(inp.inputX, inp.inputY, inp.grabHeld, inp.grabJustDown);

        if (!this.body.blocked.down) {
            this.transitionTo('FALL');
        } else if (inp.inputY > 0.5) {
            this.transitionTo('CROUCH');
        } else if (inp.dashJustDown && this.canDash) {
            this.transitionTo('DASH');
        } else if (inp.twirlJustDown && this.canTwirl) {
            this.transitionTo('TWIRL');
        } else if (this.tryConsumeJump()) {
            this.transitionTo(inp.spinHeld ? 'SPIN_JUMP' : 'JUMP');
        } else if (inp.inputX !== 0) {
            this.transitionTo('WALK');
        }
        return;
    }

    exit_IDLE() {}

    // ==========
    // WALK State
    // ==========

    enter_WALK() {
        this.anims.play('walk');
    }

    update_WALK(time, delta) {
        const inp = this.gatherInput();
        this.updateCoyoteTimer(delta);
        this.updateJumpBufferTimer(delta, inp.jumpJustDown);
        this.applyHorizontalMovement(inp.inputX);
        this.updateGrab(inp.inputX, inp.inputY, inp.grabHeld, inp.grabJustDown);

        if (!this.body.blocked.down) {
            this.transitionTo('FALL');
        } else if (inp.inputY > 0.5) {
            this.transitionTo('CROUCH');
        } else if (inp.dashJustDown && this.canDash) {
            this.transitionTo('DASH');
        } else if (inp.twirlJustDown && this.canTwirl) {
            this.transitionTo('TWIRL');
        } else if (this.tryConsumeJump()) {
            this.transitionTo(inp.spinHeld ? 'SPIN_JUMP' : 'JUMP');
        } else if (inp.inputX === 0 && Math.abs(this.body.velocity.x) < 5) {
            this.transitionTo('IDLE');
        }
        return;
    }

    exit_WALK() {}

    // ==========
    // JUMP State
    // ==========

    enter_JUMP() {
        this.anims.play('jump');
    }

    update_JUMP(time, delta) {
        const inp = this.gatherInput();
        this.applyHorizontalMovement(inp.inputX);
        this.updateGrab(inp.inputX, inp.inputY, inp.grabHeld, inp.grabJustDown);
        this.applyJumpCut(inp.jumpHeld);
        this.updateShellJumpWindow(delta, inp.jumpJustDown, false);

        if (inp.twirlJustDown && this.canTwirl) {
            this.transitionTo('TWIRL');
        } else if (inp.dashJustDown && this.canDash) {
            this.transitionTo('DASH');
        } else if ((this.body.blocked.left || this.body.blocked.right) && !this.holdingSomething) {
            this.transitionTo('WALL_SLIDE');
        } else if (this.body.velocity.y >= 0) {
            this.transitionTo('FALL');
        } else if (this.body.blocked.down) {
            this.transitionTo('IDLE');
        }
    }

    exit_JUMP() {}

    // ===============
    // SPIN JUMP State
    // ===============

    enter_SPIN_JUMP() {
        this.anims.play('jump');
        this.applySpinFlip(0, true);
        this.isSpinning = true;
        this.isFlipLocked = true;
    }

    update_SPIN_JUMP(time, delta) {
        const inp = this.gatherInput();
        this.applyHorizontalMovement(inp.inputX);
        this.applyJumpCut(inp.jumpHeld);
        this.updateGrab(inp.inputX, inp.inputY, inp.grabHeld, inp.grabJustDown);

        this.updateShellJumpWindow(delta, inp.jumpJustDown, true);

        if (inp.dashJustDown && this.canDash) {this.transitionTo('DASH');}
        else if (inp.twirlJustDown && this.canTwirl) {this.transitionTo('TWIRL');}
        else if ((this.body.blocked.left || this.body.blocked.right) && !this.holdingSomething) {this.transitionTo('WALL_SLIDE')}
        else if (this.body.velocity.y >= 0) {this.transitionTo('FALL');}
        else if (this.body.blocked.down) {this.transitionTo('IDLE');}

        return;
    }

    exit_SPIN_JUMP() {
        this.isFlipLocked = false;
        this.spinFlipTimer = 0;
    }

    // ==========
    // FALL State
    // ==========

    enter_FALL(prevState) {
        this.anims.play('jump');
        if (prevState === 'WALK' || prevState === 'IDLE') {
            this.coyoteTimer = 0.0;
        }
        if (prevState !== 'JUMP' || prevState !== 'SPIN_JUMP' || prevState !== 'CROUCH'){
            this.body.setSize(this.bodyW, this.bodyH);
            this.body.setOffset(this.bodyOffX, this.bodyOffY);
        }
    }

    update_FALL(time, delta) {
        const inp = this.gatherInput();
        this.updateCoyoteTimer(delta);
        this.updateJumpBufferTimer(delta, inp.jumpJustDown);
        this.applyHorizontalMovement(inp.inputX);
        this.updateGrab(inp.inputX, inp.inputY, inp.grabHeld, inp.grabJustDown);
    
        if (this.tryConsumeJump()) {
            this.transitionTo(this.isSpinning ? 'SPIN_JUMP' : 'JUMP');
            return;
        }

        if (this.tryWallJump()) {
            this.transitionTo(this.isSpinning ? 'SPIN_JUMP' : 'JUMP');
            return;
        }

        if (inp.dashJustDown && this.canDash) {
            this.transitionTo('DASH');
        } else if (inp.twirlJustDown && this.canTwirl) {
            this.transitionTo('TWIRL');
        } else if ((this.body.blocked.left || this.body.blocked.right) && !this.holdingSomething) {
            this.transitionTo('WALL_SLIDE');
        } else if (this.body.blocked.down) {
            this.transitionTo('IDLE');
        }
    }

    exit_FALL() {}

    // ============
    // CROUCH State
    // ============

    enter_CROUCH() {
        this.anims.play('crouch');

        const crouchH = this.bodyH / 2;
        this.body.setSize(this.bodyW, crouchH);
        this.body.setOffset(this.bodyOffX, this.height - crouchH);
        this.setAccelerationX(0);
    }

    update_CROUCH(time, delta) {
        const inp = this.gatherInput();
        this.updateCoyoteTimer(delta);
        this.updateJumpBufferTimer(delta, inp.jumpJustDown);
        this.updateGrab(inp.inputX, inp.inputY, inp.grabHeld, inp.grabJustDown);

        this.setAccelerationX(0);

        if (inp.inputY <= 0.5) {
            this.transitionTo(this.body.blocked.down ? 'IDLE' : 'FALL');
        } else if (this.tryConsumeJump()) {
            this.transitionTo('JUMP');
        } else if (!this.body.blocked.down) {
            this.transitionTo('FALL');
        }
    }

    exit_CROUCH() {
        this.isFlipLocked = false;
    }

    // ==========
    // DASH State
    // ==========

    enter_DASH() {
        this.anims.play('dash');

        const inp = this.gatherInput();
        this.canDash = false;
        let dx = inp.inputX;
        let dy = inp.inputY;

        if (dx === 0 && dy === 0) {
            dx = this.flipX ? 1 : -1;
        }

        const length = Math.sqrt(dx * dx + dy * dy);
        this.body.setVelocity(
            (dx / length) * this.DASH_DIRECTIONAL_VELOCITY,
            (dy / length) * this.DASH_DIRECTIONAL_VELOCITY
        );

        this.scene.time.delayedCall(200, () => {
            if (this.current_state === 'DASH') {
                this.transitionTo(this.body.blocked.down ? 'IDLE' : 'FALL');
            }
        });
    }

    update_DASH(time, delta) {}

    exit_DASH() {}

    // ===========
    // TWIRL State
    // ===========

    enter_TWIRL() {

        this.canTwirl = false;
        this.body.setVelocityY(this.JUMP_VELOCITY * this.TWIRL_MULTIPLIER);

        const startFlip = this.flipX;
        this.setFlipX(!startFlip);
        this.isFlipLocked = true;

        this.scene.time.delayedCall(200, () => {
            this.setFlipX(startFlip);
            this.isFlipLocked = false;
            if (this.current_state === 'TWIRL') {
                this.transitionTo(this.body.blocked.down ? 'IDLE' : 'FALL');
            }
        });

        this.scene.time.delayedCall(200, () => {
            this.canTwirl = true;
        });
    }

    update_TWIRL(time, delta) {
        const inp = this.gatherInput();
        this.applyHorizontalMovement(inp.inputX);
        this.updateGrab(inp.inputX, inp.inputY, inp.grabHeld, inp.grabJustDown);
    }

    exit_TWIRL() {}

    // ================
    // WALL SLIDE State
    // ================

    enter_WALL_SLIDE() {
        this.anims.play('jump');
    }

    update_WALL_SLIDE(time, delta) {
        const inp = this.gatherInput();
        this.applyHorizontalMovement(inp.inputX);
        this.updateJumpBufferTimer(delta, inp.jumpJustDown);

        if (this.tryWallJump(inp.inputX)) {
            this.transitionTo(this.isSpinning ? 'SPIN_JUMP' : 'JUMP');
            return;
        }

        if (this.body.blocked.down) {
            this.transitionTo('IDLE');
        } else if (!(this.body.blocked.left || this.body.blocked.right)) {
            this.transitionTo('FALL');
        }
    }

    exit_WALL_SLIDE() {}

}