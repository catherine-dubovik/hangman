'use strict'
//инициализация игры
window.addEventListener('load', startGame, false);
function startGame(){
    let container = document.querySelector('.container');
    let gameModel = new Model();
    let gameView = new View();
    let gameBtns = new Controller();
    gameModel.start(gameView);
    gameView.start(gameModel, container);
    gameBtns.start(gameModel, container);
    gameBtns.switchToStateFromURLHash(true);
}

//фоновое аудио
let isLoud = false;
let soundBtn = document.getElementById('mute');
let sound = document.getElementById('mySound');
let soundImg = soundBtn.querySelector('img');
function playBgMusic(){
    if(isLoud){
        soundImg.src = 'img/mute.svg';
        sound.pause();
        isLoud = false;
    }else if(!isLoud){
        soundImg.src = 'img/volume.svg';
        sound.volume = 0.3;
        sound.play();
        isLoud = true;
    }
}
