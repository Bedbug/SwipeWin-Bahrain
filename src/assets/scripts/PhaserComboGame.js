"use strict";
function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
}
function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    }
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || !1;
        descriptor.configurable = !0;
        if ("value" in descriptor) descriptor.writable = !0;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var GameLogic = {
    settings: null,
    type: "timefree",
    cards: [],
    mainCard: null,
    timer: null,
    sessionDurationSeconds: 0,
    timeRemainingSeconds: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    gameIsOver: !1,
    oldCardsIndex: 0,
    extraCardsCount: 0,
    validTypes: ["demo", "normal", "timefree"],
    reset: function reset(type) {
        if (GameLogic.validTypes.indexOf(type) > -1) {
            GameLogic.type = type;
            GameLogic.cards = [];
            GameLogic.mainCard = null;
            GameLogic.timer = null;
            GameLogic.timeRemainingSeconds = 0;
            GameLogic.correctAnswers = 0;
            GameLogic.wrongAnswers = 0;
            GameLogic.gameIsOver = !1;
            GameLogic.oldCardsIndex = 0;
            GameLogic.extraCardsCount = 0;
        }
    },
};
var Localization = {
    locale: "en",
    dictionary: {},
    Translate: function Translate(term) {
        var localeDictionary = Localization.dictionary[Localization.locale] || Localization.dictionary.en;
        if (localeDictionary) return localeDictionary[term] || "[".concat(term, "]");
        else return "[".concat(term, "]");
    },
    TranslateQuestion: function TranslateQuestion(question) {
        return question[Localization.locale] || question.en;
    },
};
var Card = (function () {
    function Card(other) {
        _classCallCheck(this, Card);
        this.id = other.id;
        this.imageUrl = other.imageUrl;
        this.question = other.title;
        this.choices = other.choices;
        this.answerIsCorrect = null;
        this.isExtraTime = other.isExtraTime || !1;
        this.isCashback = other.isCashback || !1;
        this.cashbackType = other.cashbackType;
        this.cardObject = null;
    }
    _createClass(Card, [
        {
            key: "userAnswer",
            value: function userAnswer(answer, gameType, callback) {
                if (answer !== 0 && answer !== 1 && answer !== -1) return;
                var that = this;
                that.answer = answer;
                __phaser.api.answerQuestion(that.id, answer, gameType).then(
                    function (res) {
                        if (res.questionResult) that.answerIsCorrect = res.questionResult;
                        return callback(null, res.ticket, res.questionResult, res.sessionResult, res.extraQuestions);
                    },
                    function (err) {
                        return callback(err);
                    }
                );
            },
        },
        {
            key: "endGame",
            value: function endGame(gameType, callback) {
                var that = this;
                __phaser.api.answerQuestion(that.id, -1, gameType).then(
                    function (res) {
                        return callback(null, res.ticket, res.questionResult, res.sessionResult, res.extraQuestions);
                    },
                    function (err) {
                        return callback(err);
                    }
                );
            },
        },
    ]);
    return Card;
})();
var __phaser = {
    gameObj: null,
    api: null,
    game: {
        type: "demo",
        init: function init(canvasEle, appComponent, locale) {
            Localization.locale = locale;
            console.log("LocaleGame: " + locale);
            var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, canvasEle, { preload: preload, create: create, update: update }, !0);
            var gameState = "preload";
            __phaser.gameObj = game;
            game.logic = GameLogic;
            var demoTimeTxt;
            var loadingtext;
            var loadingPercentage;
            var demoTimer;
            var demoTimerLoop;
            var demoQuestionTxt;
            var demoCardImageUrl;
            var demoCardImages = [];
            var demoImageLoadedCount = 0;
            var demoCardObjects = [];
            var demoIsDragging = !1;
            var dropZoneNo;
            var dropZoneYes;
            var noLabel;
            var yesLabel;
            var firstAnswer = !0;
            var Swipe;
            var SwipeOff = !0;
            var globalRatio;
            var buttonsActive = !0;
            var gearGroup;
            var g1;
            var imagesLoaded = 0;
            var that = this;
            function preload() {
                var x = 32;
                var y = 0;
                var yi = 32;

                console.log("GAME LOCALIZATION IS: "+Localization.locale);
        // Load assets depending language
        var trueString = "assets/sprites/true@3x_"+Localization.locale+".png";
        var falseString = "assets/sprites/false@3x_"+Localization.locale+".png";

                game.stage.backgroundColor = "#95a5a6";
                this.gearGroup = game.add.group();
                game.load.image("Gear", "assets/sprites/gear.png");
                game.load.image("whitebox", "assets/sprites/white_box.png");
                game.load.image("frame", "assets/sprites/polaroid_frame.png");
                game.load.image("frameGold", "assets/sprites/polaroid_frame_gold.png");
                game.load.image("frameSilver", "assets/sprites/polaroid_frame_silver.png");
                game.load.image("frameBronze", "assets/sprites/polaroid_frame_bronze.png");
                game.load.image("zone_yes", "assets/sprites/zone_yes.png");
                game.load.image("zone_no", "assets/sprites/zone_no.png");
                game.load.image("timerbg", "assets/sprites/timerBg.png");
                game.load.image("tableBg", "assets/sprites/tableBg.png");
                game.load.image("falseTag", falseString);
                game.load.image("trueTag", trueString);
                game.load.image("gameNo", "assets/sprites/no@3x.png");
                game.load.image("gameYes", "assets/sprites/yes@3x.png");
                game.load.image("gameNoDesat", "assets/sprites/no@3x_desat.png");
                game.load.image("gameYesDesat", "assets/sprites/yes@3x_desat.png");
                game.load.image("endGameBtn", "assets/sprites/stop@3x.png");
                game.load.image("endGameBtn_desat", "assets/sprites/stop@3x_desat.png");
                game.load.image("plusSec", "assets/sprites/cek.png");
                game.load.image("timerPic", "assets/sprites/timer.png");
                game.load.image("lights", "assets/sprites/lights.png");
                game.load.onLoadStart.add(loadStart, this);
                game.load.onFileComplete.add(fileComplete, this);
                game.load.onLoadComplete.add(loadComplete, this);
                game.load.enableParallel = !0;
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.pageAlignVertically = !0;
                this.scale.pageAlignHorizontally = !0;
                this.scale.updateLayout(!0);
                this.scale.setResizeCallback(function (scale, parentBounds) {
                    this.scale.setMaximum();
                }, this);
            }
            function dropCards() {
                buttonsActive = !1;
                if (that.yesButton_Desat != null) {
                    that.yesButton_Desat.alpha = 1;
                    that.noButton_Desat.alpha = 1;
                }
                var cardsLength = game.logic.cards.length;
                for (var i = 0; i < cardsLength; i++) {
                    var cardObject = game.logic.cards[i].cardObject;
                    cardObject.inputEnabled = !1;
                    var randomNum = game.rnd.integerInRange(-200, 200);
                    game.add.tween(game.logic.cards[cardsLength - 1 - i].cardObject).to({ y: game.camera.height + 500, x: game.world.centerX + randomNum }, 500, Phaser.Easing.Quadratic.In, !0, i * 200);
                    game.add.tween(game.logic.cards[cardsLength - 1 - i].cardObject).to({ angle: randomNum / 2 }, 500, Phaser.Easing.Quadratic.In, !0, i * 200);
                }
            }
            function apiCallback(err, gameTicket, isCorrect, sessionResults, extraQuestions) {
                if (err) {
                } else {
                    if (isCorrect) {
                        game.logic.correctAnswers++;
                    } else {
                        game.logic.wrongAnswers++;
                    }
                    firstAnswer = !1;
                    if (__phaser.game.type !== "timefree") {
                        game.logic.timeRemainingSeconds = gameTicket.remainingSeconds;
                    }
                    if (game.logic.mainCard != null) {
                        if (game.logic.mainCard.isExtraTime && isCorrect) {
                            var tweenTimePlus = game.add.tween(that.timePlus).to({ alpha: 1 }, 700, Phaser.Easing.Linear.None, !0, __phaser.game.type === "normal" ? 1000 : 0);
                            tweenTimePlus.onComplete.add(function () {
                                game.add.tween(that.timePlus).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, !0, 1000);
                            }, this);
                        }
                    }
                    if (extraQuestions && extraQuestions.length > 0) {
                        var _game$logic$cards;
                        var cards = __phaser._.map(extraQuestions, function (q, index) {
                            q.imageUrl = __phaser.environment.gameServerDomainUrl + "/" + q.imageUrl;
                            return new Card(q);
                        });
                        cards = cards.reverse();
                        game.logic.extraCardsCount = cards.length;
                        game.logic.oldCardsIndex = game.logic.cards.length - 1;
                        (_game$logic$cards = game.logic.cards).unshift.apply(_game$logic$cards, _toConsumableArray(cards));
                        var cardImagesCount = demoCardImages.length + imagesLoaded;
                        var loader = null;
                        for (var index = 0; index < cards.length; index++) {
                            loader = game.load.image("picture" + (cardImagesCount + index), cards[index].imageUrl);
                            imagesLoaded++;
                        }
                        loader.start();
                    }
                }
                game.logic.cards.pop();
                if (sessionResults) {
                    game.logic.gameIsOver = !0;
                    game.time.events.remove(demoTimer);
                    demoTimer.remove(demoTimerLoop);
                    dropCards();
                    demoQuestionTxt.text = Localization.Translate("labelGameOver") + "\n" + sessionResults.correctAnswers + " " + Localization.Translate("labelCorrectAnswers");
                    demoQuestionTxt.alpha = 0;
                } else {
                    game.logic.mainCard = __phaser._.last(game.logic.cards);
                    tweenCardPositions();
                }
            }
            function tweenCardPositions() {
                for (var i = 0; i < game.logic.cards.length; i++) {
                    var temCard = game.logic.cards[i].cardObject;
                    if (i == game.logic.cards.length - 1) {
                        game.add.tween(temCard.scale).to({ x: globalRatio + 0.1, y: globalRatio + 0.1 }, 500, Phaser.Easing.Elastic.Out, !0);
                        var lastTween = game.add.tween(temCard).to({ y: temCard.y + 50 * globalRatio }, 500, Phaser.Easing.Elastic.Out, !0);
                        lastTween.onComplete.add(UnlockButtons, this);
                        if (game.logic.mainCard.isCashback || game.logic.mainCard.isExtraTime) that.lights.alpha = 0.8;
                        else that.lights.alpha = 0;
                    } else if (i == game.logic.cards.length - 2) {
                        game.add.tween(temCard.scale).to({ x: ((globalRatio + 0.1) / 100) * 95, y: ((globalRatio + 0.1) / 100) * 95 }, 500, Phaser.Easing.Bounce.Out, !0, 250);
                        var lastTween2 = game.add.tween(temCard).to({ y: temCard.y + 50 * globalRatio }, 500, Phaser.Easing.Bounce.Out, !0, 250);
                    }
                }
            }
            function UnlockButtons() {
                if (game.logic.mainCard != null) game.logic.mainCard.cardObject.inputEnabled = !0;
                buttonsActive = !0;
                if (__phaser.game.type !== "timefree") {
                    that.yesButton_Desat.alpha = 0;
                    that.noButton_Desat.alpha = 0;
                } else {
                    that.yesButton_Desat.alpha = 0;
                    that.noButton_Desat.alpha = 0;
                    that.endGameBtn_desat.alpha = 0;
                }
            }
            function create() {
                var _this = this;
                game.logic.extraCardsCount = 0;
                this.g1 = game.add.sprite(game.world.centerX, game.world.centerY, "Gear");
                this.g1.anchor.set(0.5);
                this.g1.scale.set(0.9);
                this.gearGroup.add(this.g1);
                var tween1 = game.add.tween(this.g1).to({ angle: 360 }, 2000, Phaser.Easing.Linear.none, !0).loop(!0);
                that.lights = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18 + 100, "lights");
                that.lights.anchor.set(0.5);
                that.lights.scale.set(5.5);
                var lightsTween = game.add.tween(that.lights).to({ angle: 359 }, 10000, Phaser.Easing.Linear.None, !0).loop(!0);
                that.lights.alpha = 0;
                if (__phaser.game.type === "demo") this.swipe = new Swipe(this.game);
                if (window.outerHeight < 600 && window.devicePixelRatio < 3) {
                    globalRatio = 0.5;
                } else if (window.outerHeight > 1000 && window.devicePixelRatio == 2) {
                    globalRatio = 1.1;
                } else if (window.outerHeight > 1000 && window.devicePixelRatio < 1.5) {
                    globalRatio = 0.5;
                } else if (window.outerHeight < 1000 && window.devicePixelRatio < 1.5) {
                    globalRatio = 0.3;
                } else {
                    globalRatio = window.devicePixelRatio / 3;
                }
                var timerBgBg = game.add.sprite(0, 0, "whitebox");
                timerBgBg.anchor.set(0);
                timerBgBg.alpha = 0.3;
                timerBgBg.width = game.camera.width;
                timerBgBg.height = 5;
                var timerBg = game.add.sprite(0, 0, "zone_no");
                timerBg.anchor.set(0);
                timerBg.width = game.camera.width;
                timerBg.height = 5;
                var TimerGroup = game.add.group();
                that.timePlus = game.add.sprite(0, 20, "plusSec");
                that.timePlus.anchor.set(0);
                that.timePlus.alpha = 0;
                demoTimer = game.time.create(!1);
                demoTimerLoop = demoTimer.loop(1000, updateCounter, this);
                var bgMoveStep = (game.camera.height * 2) / 45;
                function updateCounter() {
                    if (firstAnswer == !0 || game.logic.mainCard == null) return;
                    game.logic.timeRemainingSeconds--;
                    if (game.logic.timeRemainingSeconds < 0) {
                        if (!game.logic.gameIsOver) {
                            game.logic.gameIsOver = !0;
                            game.logic.mainCard.userAnswer(-1, __phaser.game.type, apiCallback);
                        }
                    } else {
                        var newWidth = (game.camera.width / 45) * game.logic.timeRemainingSeconds;
                        if (__phaser.game.type !== "timefree") game.world.bringToTop(that.timePlus);
                        game.add.tween(timerBg).to({ width: newWidth }, 100, Phaser.Easing.Linear.None, !0);
                        game.add.tween(that.timePlus).to({ x: newWidth - 150 * globalRatio }, 300, Phaser.Easing.Linear.None, !0);
                    }
                }
                var dragPosition;
                var dragRotation;
                dropZoneNo = game.add.sprite(0, 0, "zone_no");
                dropZoneNo.width = game.camera.width / 2 - (0 + 50 * globalRatio);
                dropZoneNo.height = game.camera.height;
                dropZoneNo.alpha = 0.01;
                dropZoneNo.inputEnabled = !0;
                dropZoneNo.events.onInputOver.add(ZoneNoOver, this);
                function ZoneNoOver() {
                    if (demoIsDragging == !0) {
                        noLabel.alpha = 0.5;
                        noLabel.x = game.logic.mainCard.cardObject.x;
                    }
                }
                dropZoneYes = game.add.sprite(game.camera.width, 0, "zone_yes");
                dropZoneYes.anchor.set(1, 0);
                dropZoneYes.width = game.camera.width / 2 - (0 + 50 * globalRatio);
                dropZoneYes.height = game.camera.height;
                dropZoneYes.alpha = 0.01;
                dropZoneYes.inputEnabled = !0;
                dropZoneYes.events.onInputOver.add(ZoneYesOver, this);
                function ZoneYesOver() {
                    if (demoIsDragging == !0) {
                        yesLabel.alpha = 0.5;
                        yesLabel.x = game.logic.mainCard.cardObject.x;
                    }
                }
                var yesButton = game.add.sprite(game.camera.width / 2 + 250 * globalRatio, (this.game.world.height / 100) * 80, "gameYes");
                yesButton.alpha = 0;
                yesButton.anchor.set(0.5);
                yesButton.inputEnabled = !0;
                yesButton.input.useHandCursor = !0;
                yesButton.scale.set(globalRatio);
                that.yesButton_Desat = game.add.sprite(game.camera.width / 2 + 250 * globalRatio, (this.game.world.height / 100) * 80, "gameYesDesat");
                that.yesButton_Desat.alpha = 0;
                that.yesButton_Desat.anchor.set(0.5);
                that.yesButton_Desat.scale.set(globalRatio);
                yesButton.events.onInputDown.add(doAnimYes, this);
                var noButton = game.add.sprite(game.camera.width / 2 - 250 * globalRatio, (this.game.world.height / 100) * 80, "gameNo");
                noButton.alpha = 0;
                noButton.anchor.set(0.5);
                noButton.inputEnabled = !0;
                noButton.input.useHandCursor = !0;
                noButton.scale.set(globalRatio);
                that.noButton_Desat = game.add.sprite(game.camera.width / 2 - 250 * globalRatio, (this.game.world.height / 100) * 80, "gameNoDesat");
                that.noButton_Desat.alpha = 0;
                that.noButton_Desat.anchor.set(0.5);
                that.noButton_Desat.scale.set(globalRatio);
                noButton.events.onInputDown.add(doAnimNo, this);
                function doAnimNo() {
                    if (buttonsActive) {
                        buttonsActive = !1;
                        if (__phaser.game.type !== "timefree") {
                            that.yesButton_Desat.alpha = 1;
                            that.noButton_Desat.alpha = 1;
                        } else {
                            that.yesButton_Desat.alpha = 1;
                            that.noButton_Desat.alpha = 1;
                            that.endGameBtn_desat.alpha = 1;
                        }
                        var mainCard = game.logic.mainCard;
                        mainCard.falseTag.alpha = 1;
                        var CardTween = game.add.tween(mainCard.cardObject).to({ x: mainCard.cardObject.x - 400 * globalRatio, y: mainCard.cardObject.y + 20, angle: mainCard.cardObject.angle - 15 }, 300, Phaser.Easing.Quadratic.Out, !0);
                        CardTween.onComplete.add(answerResult, this);
                    }
                }
                function doAnimYes() {
                    if (buttonsActive) {
                        buttonsActive = !1;
                        if (__phaser.game.type !== "timefree") {
                            that.yesButton_Desat.alpha = 1;
                            that.noButton_Desat.alpha = 1;
                        } else {
                            that.yesButton_Desat.alpha = 1;
                            that.noButton_Desat.alpha = 1;
                            that.endGameBtn_desat.alpha = 1;
                        }
                        var mainCard = game.logic.mainCard;
                        mainCard.trueTag.alpha = 1;
                        var CardTween = game.add.tween(mainCard.cardObject).to({ x: mainCard.cardObject.x + 400 * globalRatio, y: mainCard.cardObject.y + 20, angle: mainCard.cardObject.angle + 15 }, 300, Phaser.Easing.Quadratic.Out, !0);
                        CardTween.onComplete.add(answerResult, this);
                    }
                }
                if (__phaser.game.type === "timefree") {
                    var EndGame = function EndGame() {
                        game.logic.mainCard.endGame(__phaser.game.type, apiCallback);
                        game.logic.reset(__phaser.game.type);
                    };
                    var endGameBtn = game.add.sprite(game.camera.width / 2, (this.game.world.height / 100) * 80, "endGameBtn");
                    endGameBtn.anchor.set(0.5);
                    endGameBtn.inputEnabled = !0;
                    endGameBtn.input.useHandCursor = !0;
                    endGameBtn.scale.set(globalRatio);
                    endGameBtn.events.onInputDown.add(EndGame, this);
                    endGameBtn.alpha = 0;
                    that.endGameBtn_desat = game.add.sprite(game.camera.width / 2, (this.game.world.height / 100) * 80, "endGameBtn_desat");
                    that.endGameBtn_desat.anchor.set(0.5);
                    that.endGameBtn_desat.scale.set(globalRatio);
                    that.endGameBtn_desat.alpha = 0;
                    var endgameTxt = this.game.add.text(game.camera.width / 2, (this.game.world.height / 100) * 80, "", { fontSize: 40 * globalRatio + "px", fill: "#000000", align: "center" });
                    endgameTxt.anchor.set(0.5);
                    endgameTxt.alpha = 0;
                }
                demoQuestionTxt = this.game.add.text(this.game.world.centerX, this.game.world.height / 1.25, "", { fontSize: "50px", fill: "#FFFFFF", align: "center" });
                demoQuestionTxt.anchor.set(0.5);
                demoCardImages = [];
                game.logic.reset(__phaser.game.type);
                __phaser.api.createSession(__phaser.game.type).then(
                    function (res) {
                        if (res.questions) {
                            var cards = __phaser._.map(res.questions, function (q, index) {
                                q.imageUrl = __phaser.environment.gameServerDomainUrl + "/" + q.imageUrl;
                                return new Card(q);
                            });
                            var sessionTimeLeft = res.ticket.durationSeconds;
                            cards = cards.reverse();
                            _this.game.logic.cards = cards;
                            game.logic.durationSeconds = sessionTimeLeft;
                            game.logic.timeRemainingSeconds = sessionTimeLeft;
                            __phaser._.forEach(cards, function (c, index) {
                                demoCardImages[index] = _this.game.load.image("picture" + index, c.imageUrl);
                                demoCardImages[index].onLoadComplete.add(function () {
                                    demoImageLoadedCount++;
                                    if (demoImageLoadedCount == _this.game.logic.cards.length) {
                                        CreateCards();
                                        _this.gearGroup.alpha = 0;
                                        if (__phaser.game.type === "timefree") {
                                            game.add.tween(endGameBtn).to({ alpha: 1 }, 1000, "Linear", !0, 2000);
                                            game.add.tween(endgameTxt).to({ alpha: 1 }, 1000, "Linear", !0, 2000);
                                        }
                                    }
                                });
                            });
                        }
                        game.load.start();
                    },
                    function (err) {}
                );
                yesLabel = this.game.add.text(dropZoneYes.width / 2, dropZoneYes.height - 200, Localization.Translate("infoQuestionCorrect"), {
                    fontSize: "100px",
                    fill: "#FFFFFF",
                    align: "center",
                    boundsAlignH: "center",
                    boundsAlignV: "middle",
                });
                yesLabel.anchor.set(0.5);
                yesLabel.alpha = 0;
                noLabel = this.game.add.text(game.camera.width - dropZoneNo.width / 2, dropZoneYes.height - 200, Localization.Translate("infoQuestionWrong"), {
                    fontSize: "100px",
                    fill: "#FFFFFF",
                    align: "center",
                    boundsAlignH: "center",
                    boundsAlignV: "middle",
                });
                noLabel.anchor.set(0.5);
                noLabel.alpha = 0;
                function CreateCards() {
                    game.stage.disableVisibilityChange = !0;
                    for (var i = 0; i < game.logic.cards.length; i++) {
                        var hitCheck;
                        var card;
                        var gameCard = game.logic.cards[i];
                        var imageInCard;
                        var timerPic;
                        var questionText;
                        if (gameCard.isCashback) {
                            if (gameCard.cashbackType == "gold") card = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18, "frameGold");
                            else if (gameCard.cashbackType == "silver") card = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18, "frameSilver");
                            else card = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18, "frameBronze");
                        } else {
                            card = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18, "frame");
                        }
                        card.anchor.set(0.5);
                        hitCheck = game.add.sprite(0, 0, "zone_no");
                        hitCheck.anchor.set(0.5);
                        card.addChild(hitCheck);
                        imageInCard = game.add.sprite(0, 74, "picture" + i);
                        imageInCard.anchor.set(0.5);
                        imageInCard.scale.set(1.2);
                        card.addChild(imageInCard);
                        if (gameCard.isExtraTime) {
                            timerPic = game.add.sprite(308, 381, "timerPic");
                            timerPic.anchor.set(0.5);
                            timerPic.scale.set(1.2);
                            card.addChild(timerPic);
                        }
                        questionText = game.add.text(0, -370, "Test Text for Question Test Text for Question Test Text for Question", { fontSize: "40px", fill: "#000", align: "center" });
                        questionText.anchor.set(0.5);
                        questionText.wordWrap = !0;
                        questionText.wordWrapWidth = 750;
                        card.addChild(questionText);
                        var trueTag = game.add.sprite(-200, -300, "trueTag");
                        trueTag.anchor.set(0.5);
                        card.addChild(trueTag);
                        game.logic.cards[i].trueTag = trueTag;
                        game.logic.cards[i].trueTag.alpha = 0;
                        var falseTag = game.add.sprite(200, -300, "falseTag");
                        falseTag.anchor.set(0.5);
                        card.addChild(falseTag);
                        game.logic.cards[i].falseTag = falseTag;
                        game.logic.cards[i].falseTag.alpha = 0;
                        if (i == game.logic.cards.length - 1) {
                            card.scale.set(globalRatio + 0.1);
                            card.y += 100 * globalRatio;
                        } else if (i == game.logic.cards.length - 2) {
                            card.scale.set(((globalRatio + 0.1) / 100) * 95);
                            card.y += 50 * globalRatio;
                        } else {
                            card.scale.set(((globalRatio + 0.1) / 100) * 90);
                        }
                        card.id = gameCard.id;
                        game.logic.cards[i].questionText = questionText;
                        card.inputEnabled = !0;
                        card.input.useHandCursor = !0;
                        card.events.onInputOver.add(onOver, this);
                        card.events.onInputOut.add(onOut, this);
                        card.events.onInputDown.add(onDown, this);
                        card.events.onInputUp.add(onUp, this);
                        card.events.onDragStart.add(onDragStart, this);
                        card.events.onDragStop.add(onDragStop, this);
                        dragPosition = new Phaser.Point(card.x, card.y);
                        gameCard.cardObject = card;
                        card.inputEnabled = !1;
                    }
                    for (var i = 0; i < game.logic.cards.length; i++) {
                        var _card = game.logic.cards[i];
                        game.add.tween(_card.cardObject).from({ y: -700, angle: game.rnd.integerInRange(-30, 30) }, 700, "Back.easeOut", !0, 120 * i);
                        game.logic.cards[i].questionText.text = Localization.TranslateQuestion(game.logic.cards[i].question);
                    }
                    game.logic.mainCard = __phaser._.last(game.logic.cards);
                    game.logic.mainCard.cardObject.inputEnabled = !0;
                    demoQuestionTxt.text = "";
                    demoTimer.start();
                    function onOver(sprite, pointer) {}
                    function onDragStart(sprite, pointer) {
                        if (sprite != game.logic.mainCard.cardObject) return;
                        sprite.bringToTop();
                        dragPosition.set(sprite.x, sprite.y);
                        dragRotation = sprite.angle;
                        sprite.dragRotation = sprite.angle;
                        demoIsDragging = !0;
                    }
                    function onDown(sprite, pointer) {
                        that.mouseIsDown = !0;
                        that.startX = game.input.x;
                    }
                    function onUp(sprite, pointer) {
                        that.mouseIsDown = !1;
                        var endX = game.input.x;
                        if (endX < that.startX) {
                            doAnimNo();
                        } else {
                            doAnimYes();
                        }
                    }
                    function onOut(sprite, pointer) {
                        if (__phaser.game.type !== "demo") sprite.tint = 0xffffff;
                    }
                    function onDragStop(sprite, pointer) {
                        demoIsDragging = !1;
                        var mainCard = game.logic.mainCard;
                        if (!sprite.getChildAt(0).overlap(dropZoneYes) && !sprite.getChildAt(0).overlap(dropZoneNo)) {
                            game.add.tween(sprite).to({ x: dragPosition.x, y: dragPosition.y, angle: dragRotation }, 500, "Back.easeOut", !0);
                        } else if (sprite.getChildAt(0).overlap(dropZoneYes)) {
                            sprite.inputEnabled = !1;
                            if (__phaser.game.type !== "timefree") {
                                that.yesButton_Desat.alpha = 1;
                                that.noButton_Desat.alpha = 1;
                            } else {
                                that.yesButton_Desat.alpha = 1;
                                that.noButton_Desat.alpha = 1;
                                that.endGameBtn_desat.alpha = 1;
                            }
                            game.add.tween(sprite).to({ y: game.camera.height + sprite.height + 50 }, 550, Phaser.Easing.Quadratic.In, !0);
                            mainCard.userAnswer(0, __phaser.game.type, apiCallback);
                        } else if (sprite.getChildAt(0).overlap(dropZoneNo)) {
                            sprite.inputEnabled = !1;
                            if (__phaser.game.type !== "timefree") {
                                that.yesButton_Desat.alpha = 1;
                                that.noButton_Desat.alpha = 1;
                            } else {
                                that.yesButton_Desat.alpha = 1;
                                that.noButton_Desat.alpha = 1;
                                that.endGameBtn_desat.alpha = 1;
                            }
                            game.add.tween(sprite).to({ y: game.camera.height + sprite.height + 50 }, 550, Phaser.Easing.Quadratic.In, !0);
                            mainCard.userAnswer(1, __phaser.game.type, apiCallback);
                        }
                        sprite.scale.set(globalRatio + 0.1);
                        yesLabel.alpha = 0;
                        noLabel.alpha = 0;
                    }
                    game.time.events.add(
                        Phaser.Timer.SECOND * 3,
                        function () {
                            yesButton.alpha = 1;
                            noButton.alpha = 1;
                        },
                        this
                    );
                }
            }
            var batch = 0;
            function CreateExtraCards(extraCardCount, imageCount) {
                batch++;
                imagesLoaded += extraCardCount;
                for (var i = extraCardCount - 1; i >= 0; i--) {
                    var hitCheck;
                    var card;
                    var gameCard = game.logic.cards[i];
                    var dragPosition;
                    var dragRotation;
                    var imageInCard;
                    var timerPic;
                    var questionText;
                    if (gameCard.isCashback) {
                        if (gameCard.cashbackType == "gold") card = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18, "frameGold");
                        else if (gameCard.cashbackType == "silver") card = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18, "frameSilver");
                        else card = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18, "frameBronze");
                    } else {
                        card = game.add.sprite(game.camera.width / 2, game.camera.height / 2 - (game.camera.height / 100) * 18, "frame");
                    }
                    card.anchor.set(0.5);
                    hitCheck = game.add.sprite(0, 0, "zone_no");
                    hitCheck.anchor.set(0.5);
                    card.addChild(hitCheck);
                    imageInCard = game.add.sprite(0, 74, "picture" + (imagesLoaded + i + 1));
                    imageInCard.anchor.set(0.5);
                    imageInCard.scale.set(1.2);
                    card.addChild(imageInCard);
                    if (gameCard.isExtraTime) {
                        timerPic = game.add.sprite(308, 381, "timerPic");
                        timerPic.anchor.set(0.5);
                        timerPic.scale.set(1.2);
                        card.addChild(timerPic);
                    }
                    questionText = game.add.text(0, -370, "Test Text for Question Test Text for Question Test Text for Question", { fontSize: "40px", fill: "#000", align: "center" });
                    questionText.anchor.set(0.5);
                    questionText.wordWrap = !0;
                    questionText.wordWrapWidth = 750;
                    card.addChild(questionText);
                    var trueTag = game.add.sprite(-200, -300, "trueTag");
                    trueTag.anchor.set(0.5);
                    card.addChild(trueTag);
                    game.logic.cards[i].trueTag = trueTag;
                    game.logic.cards[i].trueTag.alpha = 0;
                    var falseTag = game.add.sprite(200, -300, "falseTag");
                    falseTag.anchor.set(0.5);
                    card.addChild(falseTag);
                    game.logic.cards[i].falseTag = falseTag;
                    game.logic.cards[i].falseTag.alpha = 0;
                    card.scale.set(((globalRatio + 0.1) / 100) * 90);
                    card.sendToBack();
                    card.id = gameCard.id;
                    game.logic.cards[i].questionText = questionText;
                    questionText.text = Localization.TranslateQuestion(game.logic.cards[i].question);
                    card.inputEnabled = !0;
                    card.input.useHandCursor = !0;
                    card.events.onInputOver.add(onOver, this);
                    card.events.onInputOut.add(onOut, this);
                    card.events.onInputDown.add(onDown, this);
                    card.events.onInputUp.add(onUp, this);
                    card.events.onDragStart.add(onDragStart, this);
                    card.events.onDragStop.add(onDragStop, this);
                    dragPosition = new Phaser.Point(card.x, card.y);
                    gameCard.cardObject = card;
                    card.inputEnabled = !1;
                }
                dropZoneNo.sendToBack();
                dropZoneYes.sendToBack();
                function onOver(sprite, pointer) {}
                function onDragStart(sprite, pointer) {
                    if (sprite != game.logic.mainCard.cardObject) return;
                    sprite.bringToTop();
                    dragPosition.set(sprite.x, sprite.y);
                    dragRotation = sprite.angle;
                    sprite.dragRotation = sprite.angle;
                    demoIsDragging = !0;
                }
                function onDown(sprite, pointer) {
                    that.mouseIsDown = !0;
                    that.startX = game.input.x;
                }
                function onUp(sprite, pointer) {
                    that.mouseIsDown = !1;
                    var endX = game.input.x;
                    console.log("that.startX: " + that.startX);
                    if (endX < that.startX) {
                        doAnimNo();
                    } else {
                        doAnimYes();
                    }
                }
                function onOut(sprite, pointer) {
                    sprite.tint = 0xffffff;
                }
                function onDragStop(sprite, pointer) {
                    demoIsDragging = !1;
                    var mainCard = game.logic.mainCard;
                    if (!sprite.getChildAt(0).overlap(dropZoneYes) && !sprite.getChildAt(0).overlap(dropZoneNo)) {
                        game.add.tween(sprite).to({ x: dragPosition.x, y: dragPosition.y, angle: dragRotation }, 500, "Back.easeOut", !0);
                    } else if (sprite.getChildAt(0).overlap(dropZoneYes)) {
                        sprite.inputEnabled = !1;
                        that.endGameBtn_desat.alpha = 1;
                        game.add.tween(sprite).to({ y: game.camera.height + sprite.height + 50 }, 550, Phaser.Easing.Quadratic.In, !0);
                        mainCard.userAnswer(0, __phaser.game.type, apiCallback);
                    } else if (sprite.getChildAt(0).overlap(dropZoneNo)) {
                        sprite.inputEnabled = !1;
                        that.endGameBtn_desat.alpha = 1;
                        game.add.tween(sprite).to({ y: game.camera.height + sprite.height + 50 }, 550, Phaser.Easing.Quadratic.In, !0);
                        mainCard.userAnswer(1, __phaser.game.type, apiCallback);
                    }
                    sprite.scale.set(globalRatio + 0.1);
                    yesLabel.alpha = 0;
                    noLabel.alpha = 0;
                }
                function doAnimNo() {
                    if (buttonsActive) {
                        buttonsActive = !1;
                        if (__phaser.game.type !== "timefree") {
                            that.yesButton_Desat.alpha = 1;
                            that.noButton_Desat.alpha = 1;
                        } else {
                            that.yesButton_Desat.alpha = 1;
                            that.noButton_Desat.alpha = 1;
                            that.endGameBtn_desat.alpha = 1;
                        }
                        var mainCard = game.logic.mainCard;
                        mainCard.falseTag.alpha = 1;
                        var CardTween = game.add.tween(mainCard.cardObject).to({ x: mainCard.cardObject.x - 400 * globalRatio, y: mainCard.cardObject.y + 20, angle: mainCard.cardObject.angle - 15 }, 300, Phaser.Easing.Quadratic.Out, !0);
                        CardTween.onComplete.add(answerResult, this);
                    }
                }
                function doAnimYes() {
                    if (buttonsActive) {
                        buttonsActive = !1;
                        if (__phaser.game.type !== "timefree") {
                            that.yesButton_Desat.alpha = 1;
                            that.noButton_Desat.alpha = 1;
                        } else {
                            that.yesButton_Desat.alpha = 1;
                            that.noButton_Desat.alpha = 1;
                            that.endGameBtn_desat.alpha = 1;
                        }
                        var mainCard = game.logic.mainCard;
                        mainCard.trueTag.alpha = 1;
                        var CardTween = game.add.tween(mainCard.cardObject).to({ x: mainCard.cardObject.x + 400 * globalRatio, y: mainCard.cardObject.y + 20, angle: mainCard.cardObject.angle + 15 }, 300, Phaser.Easing.Quadratic.Out, !0);
                        CardTween.onComplete.add(answerResult, this);
                    }
                }
            }
            function loadStart() {
                loadingtext = game.add.text(game.world.centerX, game.world.centerY / 2, "", { fontSize: 40 + "px", fill: "#FFFFFF", align: "center", boundsAlignH: "center", boundsAlignV: "middle" });
                loadingtext.anchor.set(0.5);
                loadingPercentage = game.add.text(game.world.centerX, game.world.centerY / 2 + 50, "", { fontSize: 40 + "px", fill: "#FFFFFF", align: "center", boundsAlignH: "center", boundsAlignV: "middle" });
                loadingPercentage.anchor.set(0.5);
            }
            function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {}
            function preloaderUpdate() {}
            function loadComplete() {
                if (game.logic && game.logic.cards && game.logic.cards.length > 0 && !game.logic.gameIsOver && game.logic.extraCardsCount > 0) {
                    CreateExtraCards(game.logic.extraCardsCount, demoCardImages.length);
                    game.logic.oldCardsIndex = 0;
                } else {
                    game.time.events.add(
                        Phaser.Timer.SECOND * 1,
                        function () {
                            loadingtext.destroy();
                            loadingPercentage.destroy();
                            startGame();
                        },
                        this
                    ).autoDestroy = !0;
                }
            }
            function startGame() {
                gameState = "gameplay";
            }
            function gameplayUpdate() {
                var mainCard = game.logic.mainCard;
                var mainCardObject = !mainCard ? null : mainCard.cardObject;
                if (SwipeOff) {
                    if (demoIsDragging == !0) {
                        mainCardObject.angle = mainCardObject.dragRotation + (mainCardObject.x - game.camera.width / 2) / 15;
                        if (mainCardObject.getChildAt(0).overlap(dropZoneYes)) {
                            mainCard.trueTag.alpha = 1;
                        } else {
                            mainCard.trueTag.alpha = 0;
                            yesLabel.alpha = 0;
                        }
                        if (mainCardObject.getChildAt(0).overlap(dropZoneNo)) {
                            mainCard.falseTag.alpha = 1;
                        } else {
                            mainCard.falseTag.alpha = 0;
                            noLabel.alpha = 0;
                        }
                    }
                } else {
                    if (buttonsActive) {
                        buttonsActive = !1;
                        var direction = that.swipe.check();
                        if (direction !== null) {
                            if (direction.direction == 4 || direction.direction == 32 || direction.direction == 128) {
                                mainCardObject.inputEnabled = !1;
                                var CardTween = game.add.tween(mainCardObject).to({ x: mainCardObject.x - 200, y: mainCardObject.y + 20, angle: mainCardObject.angle - 15 }, 300, Phaser.Easing.Quadratic.Out, !0);
                                CardTween.onComplete.add(answerResult, this);
                            }
                            if (direction.direction == 8 || direction.direction == 16 || direction.direction == 64) {
                                mainCardObject.inputEnabled = !1;
                                var CardTween = game.add.tween(mainCardObject).to({ x: mainCardObject.x + 200, y: mainCardObject.y + 20, angle: mainCardObject.angle + 15 }, 300, Phaser.Easing.Quadratic.Out, !0);
                                CardTween.onComplete.add(answerResult, this);
                            }
                        }
                    } else {
                    }
                }
            }
            function answerResult() {
                console.log("answerResult!!! ");
                demoIsDragging = !1;
                var mainCard = game.logic.mainCard;
                if (mainCard.cardObject.getChildAt(0).overlap(dropZoneYes)) {
                    mainCard.cardObject.inputEnabled = !1;
                    console.log("dropZoneYes !!!");
                    if (__phaser.game.type !== "timefree") {
                        that.yesButton_Desat.alpha = 1;
                        that.noButton_Desat.alpha = 1;
                    } else {
                        that.yesButton_Desat.alpha = 1;
                        that.noButton_Desat.alpha = 1;
                        that.endGameBtn_desat.alpha = 1;
                    }
                    game.add.tween(mainCard.cardObject).to({ y: game.camera.height + mainCard.cardObject.height + 50 }, 550, Phaser.Easing.Quadratic.In, !0);
                    mainCard.userAnswer(0, __phaser.game.type, apiCallback);
                } else if (mainCard.cardObject.getChildAt(0).overlap(dropZoneNo)) {
                    mainCard.cardObject.inputEnabled = !1;
                    console.log("dropZoneNo !!!");
                    if (__phaser.game.type !== "timefree") {
                        that.yesButton_Desat.alpha = 1;
                        that.noButton_Desat.alpha = 1;
                    } else {
                        that.yesButton_Desat.alpha = 1;
                        that.noButton_Desat.alpha = 1;
                        that.endGameBtn_desat.alpha = 1;
                    }
                    game.add.tween(mainCard.cardObject).to({ y: game.camera.height + mainCard.cardObject.height + 50 }, 550, Phaser.Easing.Quadratic.In, !0);
                    mainCard.userAnswer(1, __phaser.game.type, apiCallback);
                }
                mainCard.cardObject.scale.set(globalRatio + 0.1);
                mainCard.trueTag.alpha = 0;
                mainCard.falseTag.alpha = 0;
                yesLabel.alpha = 0;
                noLabel.alpha = 0;
            }
            function Swipe(game, model) {
                var self = this;
                self.DIRECTION_UP = 1;
                self.DIRECTION_DOWN = 2;
                self.DIRECTION_LEFT = 4;
                self.DIRECTION_RIGHT = 8;
                self.DIRECTION_UP_RIGHT = 16;
                self.DIRECTION_UP_LEFT = 32;
                self.DIRECTION_DOWN_RIGHT = 64;
                self.DIRECTION_DOWN_LEFT = 128;
                self.game = game;
                self.model = model !== undefined ? model : null;
                self.dragLength = 100;
                self.diagonalDelta = 50;
                self.swiping = !1;
                self.direction = null;
                self.tmpDirection = null;
                self.tmpCallback = null;
                self.diagonalDisabled = !1;
                this.game.input.onDown.add(function () {
                    self.swiping = !0;
                });
                this.game.input.onUp.add(function () {
                    self.swiping = !1;
                });
                this.setupKeyboard();
            }
            Swipe.prototype.setupKeyboard = function () {
                var self = this;
                var up = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
                up.onDown.add(function () {
                    if (self.tmpDirection !== null) {
                        switch (self.tmpDirection) {
                            case self.DIRECTION_LEFT:
                                self.direction = self.DIRECTION_UP_LEFT;
                                self.model !== null && self.model.upLeft && self.model.upLeft();
                                break;
                            case self.DIRECTION_RIGHT:
                                self.direction = self.DIRECTION_UP_RIGHT;
                                self.model !== null && self.model.upRight && self.model.upRight();
                                break;
                            default:
                                self.direction = self.DIRECTION_UP;
                                self.model !== null && self.model.up && self.model.up();
                        }
                        self.tmpDirection = null;
                        self.tmpCallback = null;
                    } else {
                        self.tmpDirection = self.DIRECTION_UP;
                        self.tmpCallback = self.model !== null && self.model.up ? self.model.up : null;
                    }
                });
                up.onUp.add(this.keyUp, this);
                var down = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
                down.onDown.add(function () {
                    if (self.tmpDirection !== null) {
                        switch (self.tmpDirection) {
                            case self.DIRECTION_LEFT:
                                self.direction = self.DIRECTION_DOWN_LEFT;
                                self.model !== null && self.model.downLeft && self.model.downLeft();
                                break;
                            case self.DIRECTION_RIGHT:
                                self.direction = self.DIRECTION_DOWN_RIGHT;
                                self.model !== null && self.model.downRight && self.model.downRight();
                                break;
                            default:
                                self.direction = self.DIRECTION_DOWN;
                                self.model !== null && self.model.down && self.model.down();
                        }
                        self.tmpDirection = null;
                        self.tmpCallback = null;
                    } else {
                        self.tmpDirection = self.DIRECTION_DOWN;
                        self.tmpCallback = self.model !== null && self.model.down ? self.model.down : null;
                    }
                });
                down.onUp.add(this.keyUp, this);
                var left = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
                left.onDown.add(function () {
                    if (self.tmpDirection !== null) {
                        switch (self.tmpDirection) {
                            case self.DIRECTION_UP:
                                self.direction = self.DIRECTION_UP_LEFT;
                                self.model !== null && self.model.upLeft && self.model.upLeft();
                                break;
                            case self.DIRECTION_DOWN:
                                self.direction = self.DIRECTION_DOWN_LEFT;
                                self.model !== null && self.model.downLeft && self.model.downLeft();
                                break;
                            default:
                                self.direction = self.DIRECTION_LEFT;
                                self.model !== null && self.model.left && self.model.left();
                        }
                        self.tmpDirection = null;
                        self.tmpCallback = null;
                    } else {
                        self.tmpDirection = self.DIRECTION_LEFT;
                        self.tmpCallback = self.model !== null && self.model.left ? self.model.left : null;
                    }
                });
                left.onUp.add(this.keyUp, this);
                var right = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
                right.onDown.add(function () {
                    if (self.tmpDirection !== null) {
                        switch (self.tmpDirection) {
                            case self.DIRECTION_UP:
                                self.direction = self.DIRECTION_UP_RIGHT;
                                self.model !== null && self.model.upRight && self.model.upRight();
                                break;
                            case self.DIRECTION_DOWN:
                                self.direction = self.DIRECTION_DOWN_RIGHT;
                                self.model !== null && self.model.downRight && self.model.downRight();
                                break;
                            default:
                                self.direction = self.DIRECTION_RIGHT;
                                self.model !== null && self.model.right && self.model.right();
                        }
                        self.tmpDirection = null;
                        self.tmpCallback = null;
                    } else {
                        self.tmpDirection = self.DIRECTION_RIGHT;
                        self.tmpCallback = self.model !== null && self.model.right ? self.model.right : null;
                    }
                });
                right.onUp.add(this.keyUp, this);
            };
            Swipe.prototype.keyUp = function () {
                this.direction = this.tmpDirection;
                this.tmpDirection = null;
                if (this.tmpCallback !== null) {
                    this.tmpCallback.call(this.model);
                    this.tmpCallback = null;
                }
            };
            Swipe.prototype.check = function () {
                if (this.direction !== null) {
                    var result = { x: 0, y: 0, direction: this.direction };
                    this.direction = null;
                    return result;
                }
                if (!this.swiping) return null;
                if (Phaser.Point.distance(this.game.input.activePointer.position, this.game.input.activePointer.positionDown) < this.dragLength) return null;
                this.swiping = !1;
                var direction = null;
                var deltaX = this.game.input.activePointer.position.x - this.game.input.activePointer.positionDown.x;
                var deltaY = this.game.input.activePointer.position.y - this.game.input.activePointer.positionDown.y;
                var result = { x: this.game.input.activePointer.positionDown.x, y: this.game.input.activePointer.positionDown.y };
                var deltaXabs = Math.abs(deltaX);
                var deltaYabs = Math.abs(deltaY);
                if (!this.diagonalDisabled && deltaXabs > this.dragLength - this.diagonalDelta && deltaYabs > this.dragLength - this.diagonalDelta) {
                    if (deltaX > 0 && deltaY > 0) {
                        direction = this.DIRECTION_DOWN_RIGHT;
                        this.model !== null && this.model.downRight && this.model.downRight(result);
                    } else if (deltaX > 0 && deltaY < 0) {
                        direction = this.DIRECTION_UP_RIGHT;
                        this.model !== null && this.model.upRight && this.model.upRight(result);
                    } else if (deltaX < 0 && deltaY > 0) {
                        direction = this.DIRECTION_DOWN_LEFT;
                        this.model !== null && this.model.downLeft && this.model.downLeft(result);
                    } else if (deltaX < 0 && deltaY < 0) {
                        direction = this.DIRECTION_UP_LEFT;
                        this.model !== null && this.model.upLeft && this.model.upLeft(result);
                    }
                } else if (deltaXabs > this.dragLength || deltaYabs > this.dragLength) {
                    if (deltaXabs > deltaYabs) {
                        if (deltaX > 0) {
                            direction = this.DIRECTION_RIGHT;
                            this.model !== null && this.model.right && this.model.right(result);
                        } else if (deltaX < 0) {
                            direction = this.DIRECTION_LEFT;
                            this.model !== null && this.model.left && this.model.left(result);
                        }
                    } else {
                        if (deltaY > 0) {
                            direction = this.DIRECTION_DOWN;
                            this.model !== null && this.model.down && this.model.down(result);
                        } else if (deltaY < 0) {
                            direction = this.DIRECTION_UP;
                            this.model !== null && this.model.up && this.model.up(result);
                        }
                    }
                }
                if (direction !== null) {
                    result.direction = direction;
                    return result;
                }
                return null;
            };
            if (typeof exports !== "undefined") {
                if (typeof module !== "undefined" && module.exports) {
                    module.exports = Swipe;
                }
            }
            function update() {
                if (gameState == "preload") {
                    preloaderUpdate();
                }
                if (gameState == "gameplay") {
                    gameplayUpdate();
                }
            }
            function onResize() {}
        },
    },
    destroyGame: function destroyGame(callback) {
        this.gameObj.destroy();
        callback();
    },
};
