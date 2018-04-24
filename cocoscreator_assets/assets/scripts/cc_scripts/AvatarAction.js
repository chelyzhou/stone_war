// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var KBEngine = require("kbengine");

cc.Class({
    extends: cc.Component,

    properties: {
        gravity: -1000,

        jumpSpeed: cc.v2(300, 500),
        maxSpeed: cc.v2(400, 600),
        walkspeed: cc.v2(120, 50),
        jumpSpeedY : 0,

        jumping : false,
        isOnGround : true,

        moveFlag : 0,
        modelID : 0,
        leftDir: 1,
        rightDir: -1,
        eid:0,

        anim: {
            default: null,
            type: cc.Node,
        },

        start_point : {
            default: null,
            type: cc.Node,
        },

        end_point : {
            default: null,
            type: cc.Node,
        },

        arrow : {
            default: null,
            type: cc.Node,
        },

        leftHand: {
            default: null,
            type: cc.Node,
        },

        rightHand: {
            default: null,
            type: cc.Node,
        },

        testNode1:{
            default: null,
            type: cc.Node,
        },

        testNode2:{
            default: null,
            type: cc.Node,
        },

        basePoint: {
            default: null,
            type: cc.Node,
        },

        item_point: {
            default: null,
            type: cc.Node,
        },

        item: {
            default: null,
            type: cc.Node,
        },
    },

    onLoad () {
        this.start_point = this.node.getChildByName("start_point");
        this.end_point = this.node.getChildByName("end_point");
        this.item_point = this.node.getChildByName("item_point");
        this.basePoint = this.node.getChildByName("basePoint");
        
        this.arrow = this.node.getChildByName("arrow");
        this.arrow.active = false;

        this.leftHand = this.node.getChildByName("leftHand");
        this.rightHand = this.node.getChildByName("rightHand");

        this.testNode1 = cc.find("testNode1");
        this.testNode2 = cc.find("testNode2");
        this.ctx = cc.find("worldDraw").getComponent(cc.Graphics);

        this.targetPosition = null;
        this.isCollision = false;
        this.hasPickUpItem = false;
        this.arrowAngle = 0.0;
    },


    setEntityId: function(eid) {
        this.eid = eid;
    },

    getSelfWorldPointAR: function() {
        return this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
    },

    getSelfWorldPoint: function() {
        return this.node.convertToWorldSpace(cc.Vec2.ZERO);
    },

    setModelID: function(num) {
        this.modelID = num;
        if(this.modelID == 0) {
            this.leftDir = 1;
            this.rightDir = -1;
        }else if(this.modelID == 1) {
            this.leftDir = -1;
            this.rightDir = 1;
        }
    },

    addAxisX: function(num) {
        this.node.x += num;
    },

    addAxisY: function(num) {
        this.node.y += num;
    },

    changAxisY: function(num) {
        this.node.y = num;
    },

    changAxisX: function(num) {
        this.node.x += num;
    },

    leftWalk: function() {
        if(this.moveFlag == MOVE_LEFT) 
            return;

        if(this.hasPickUpItem)
            return;

        this.moveFlag = MOVE_LEFT;
        if(!this.jumping) {
            this.node.scaleX = this.leftDir;
        }
        this._playWalkAnim();
    },

    rightWalk: function() {
        if(this.moveFlag == MOVE_RIGHT) 
            return;

        if(this.hasPickUpItem)
            return;

        this.moveFlag = MOVE_RIGHT;
        if(!this.jumping) {
            this.node.scaleX = this.rightDir;
        }
        this._playWalkAnim();
    },

    _playWalkAnim: function() {
        if(!this.jumping && this.anim) {
            this.anim.playWalkAnim();
        }
    },

    stopWalk: function() {
        if(!this.jumping && this.moveFlag!=STATIC) {
            this.moveFlag = STATIC;
            if(this.anim){
                this.anim.stopPlayAnim();
            }
        }
    },

    jump: function() {
        if(this.hasPickUpItem)
            return;

        this._jump();
        if(this.jumping) {
            var player = KBEngine.app.player();
            if(player != undefined && player.inWorld) {
                player.jump()
            }
        }
    },

    _jump: function() {
        if (!this.jumping) {
            this.jumping = true;
            this.jumpSpeedY = this.jumpSpeed.y;
            if(this.anim) {
                this.anim.playJumpAnim(); 
            }
        }
    },

    onJump: function() {
        this._jump();
    },

    setAnim: function(anim) {
        this.anim = anim;
    },

    setPlaceItem: function(item) {
        cc.log("0000 AvatarAction::setPlaceItem");
        this.moveFlag = STATIC;
        var factor = 1;
        var itemPoint = null;

        if(this.node.scaleX == this.rightDir) {
            cc.log("player left hand pick up item ....");
            //var leftHandPoint = this.leftHand.convertToWorldSpaceAR(cc.v2(0, 0));
           // itemPoint = this.node.parent.convertToNodeSpace(leftHandPoint);
            this.arrow.scaleX = this.rightDir;
            factor = 1;
        } else if(this.node.scaleX == this.leftDir) {
            cc.log("player righ hand pick up item ....");
          //  var rightHandPoint = this.rightHand.convertToWorldSpaceAR(cc.v2(0, 0));
          //  itemPoint = this.node.parent.convertToNodeSpace(rightHandPoint);
            this.arrow.scaleX = this.leftDir;
            factor = -1;
        }

        itemPoint = this.leftHand.convertToWorldSpaceAR(cc.v2(0, 0));
        itemPoint = this.node.parent.convertToNodeSpace(itemPoint);

        //改变石头的位置，放到手中
        var itemRigidbody = item.getComponent(cc.RigidBody);
        itemRigidbody.gravityScale = 0;
        itemRigidbody.linearVelocity = cc.v2(0, 0);
        item.setPosition(itemPoint);

        return factor;
    },

    pickUpItem: function(item, itemID, pickPos) {
        cc.log("player start pick up item ....");
        this.hasPickUpItem = true;
        this.item = item;

        this.setPlaceItem(item);
        this.adjustArrowDir(pickPos);

        var player = KBEngine.app.player();
        if(player != undefined && player.inWorld) {
            player.pickUpItem(itemID);
        }
    },

    adjustArrowDir: function(pos) {
        cc.log("player adjustArrowDir: pos(%f, %f)", pos.x, pos.y);
        this.arrow.active = true;
        var arrowWorldPoint = this.arrow.convertToWorldSpaceAR(cc.v2(0, 0));
        var dx = pos.x - arrowWorldPoint.x;
        var dy = pos.y - arrowWorldPoint.y;

        var factor = 1;
        if(this.node.scaleX == this.rightDir) {
            this.arrow.scaleX = this.rightDir;
            factor = 1;
        } else if(this.node.scaleX == this.leftDir) {
            this.arrow.scaleX = this.leftDir;
            factor = -1;
        }

        var angle = Math.atan2(dy, dx) * 180 / Math.PI;
        this.arrowAngle = angle*factor;

        this.testNode1.setPosition(arrowWorldPoint);
        this.testNode2.setPosition(pos);
    },

    adjustThrow: function(pos) {
        if(!this.hasPickUpItem) return;

        this.adjustArrowDir(pos);
    },

    throwItem: function(pos) {
        if(!this.hasPickUpItem) return;

        cc.log("0000 AvatarAction: throw item");
        var arrowWorldPoint = this.arrow.convertToWorldSpaceAR(cc.v2(0, 0));
        var itemRigidbody = this.item.getComponent(cc.RigidBody);

        var force = arrowWorldPoint.sub(pos);
        force.mulSelf(MULTIPLE);
        cc.log("0000 AvatarAction throwItem: force(%f, %f)", force.x, force.y);
        itemRigidbody.gravityScale = 1;
        var worldCenter = itemRigidbody.getWorldCenter();
        itemRigidbody.applyLinearImpulse(force, worldCenter, true);

        this.hasPickUpItem = false;
        this.arrow.active = false;
        this.item = null;
    },

    setPosition: function(position) {
        this.targetPosition = position;
        var dx = position.x - this.node.x;
       
        if (dx > 1) // 右
        {
            this.rightWalk();
        }
        else if (dx < -1) //左
        {
            this.leftWalk();
        }
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        //cc.log("onBeginContact selfCollider.tag=%d", selfCollider.tag);
        //cc.log("onBeginContact otherCollider.tag=%d", otherCollider.tag);
        if(otherCollider.node.name == "land_bg") {
            contact.disabled = true;
            this.isCollision = true;
        }
    },

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
       // cc.log("onEndContact selfCollider.tag=%d", selfCollider.tag);
       // cc.log("onEndContact otherCollider.tag=%d", otherCollider.tag);
        if(otherCollider.node.name == "land_bg") {
            this.isCollision = false;
        }
    },

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve: function (contact, selfCollider, otherCollider) {
        //cc.log("onPreSolve selfCollider.tag=%d", selfCollider.tag);
       // cc.log("8888 onPreSolve otherCollider.tag=%d", otherCollider.tag);
        if(otherCollider.node.name == "land_bg") {
            contact.disabled = true;
            this.isCollision = true;
        }
    },

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {
        //cc.log("onPostSolve selfCollider.tag=%d", selfCollider.tag);
       // cc.log("onPostSolve otherCollider.tag=%d", otherCollider.tag);
        // if(otherCollider.tag == 999) {
        //     cc.log("888 selfCollider.sensor=%s", selfCollider.sensor.toString());
        //     selfCollider.sensor = false;
        // }
        
    },

    drawTestNode: function() {
        this.ctx.clear();
        if(!this.hasPickUpItem) return;

        this.ctx.circle(this.testNode1.x, this.testNode1.y, 3);
        this.ctx.fillColor = cc.Color.RED;
        this.ctx.fill();

        this.ctx.circle(this.testNode2.x, this.testNode2.y, 3);
        this.ctx.fillColor = cc.Color.GREEN;
        this.ctx.fill();

        this.ctx.moveTo(this.testNode1.x, this.testNode1.y);
        this.ctx.lineTo(this.testNode2.x, this.testNode2.y);
        this.ctx.stroke();

        // var basePoint = this.basePoint.convertToWorldSpaceAR(cc.v2(0, 0));
        // this.ctx.rect(basePoint.x, basePoint.y, 256, 256);

        this.ctx.stroke();
    },
    
   
    update: function(dt) {
        this.drawTestNode();

        if(this.arrow.active) {
            this.arrow.rotation = this.arrowAngle;
        }

        var player = KBEngine.app.player();
        var speedX = this.walkspeed.x * dt;
        var results = null;

        if(this.moveFlag == MOVE_LEFT) {
            if(player.id == this.eid) {
                if(!this.isCollision) {
                    this.addAxisX(-speedX);
                }
            }else {
                if(this.node.x >= this.targetPosition.x) {
                    this.addAxisX(-speedX);
                }else {
                    this.stopWalk();
                }
            }
        } 
        else if (this.moveFlag == MOVE_RIGHT ) {
            if(player.id == this.eid) {
                if(!this.isCollision) {
                    this.addAxisX(speedX);
                }
            }else {
                if(this.node.x <= this.targetPosition.x) {
                    this.addAxisX(speedX);
                }else {
                    this.stopWalk();
                }
            }
        }  

        if(this.jumping) {
            this.jumpSpeedY +=  this.gravity * dt;

            if(Math.abs(this.jumpSpeedY) > this.maxSpeed.y) {
                this.jumpSpeedY = this.jumpSpeedY > 0 ? this.maxSpeed.y : -this.maxSpeed.y;
            }

            this.addAxisY(this.jumpSpeedY*dt);
            this.isOnGround = false;
        }

        var start = this.start_point.convertToWorldSpaceAR(cc.v2(0, 0));
        var end = this.end_point.convertToWorldSpaceAR(cc.v2(0, 0));
        results = cc.director.getPhysicsManager().rayCast(start, end, cc.RayCastType.AllClosest);

       // cc.log("down rayCast Result Count=%d", results.length);
      //  cc.log("down rayCast: start(%f, %f)  end(%f, %f)", start.x, start.y, end.x, end.y);

        // this.ctx.clear();
        // this.ctx.moveTo(start.x, start.y);
        // this.ctx.lineTo(end.x, end.y);
        // this.ctx.stroke();

        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var collider = result.collider;
            //cc.log("down rayCast Result %d  name: %s,  point(%s, %s)", i, collider.node.name, result.point.x, result.point.y);
            if(collider.node.name == "land_bg") {
                var foot_point = this.node.parent.convertToNodeSpace(result.point);
                this.node.y = foot_point.y;
                this.isOnGround = true;
                if(this.jumping) {
                    this.jumping = false;
                    this.moveFlag = STATIC;
                    this.anim.playIdleAnim();
                }
                break;
            }
        }
    },

});