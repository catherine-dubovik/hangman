'use strict'
class View{
    constructor(){
        this.model = null;
        this.container = null;
        this.modal=null;
        this.gameContainer = null;
        this.nav = null;
        this.menu = null;
        this.alphabet = null;
        this.wordBlock = null;
        this.hintBlock = null;
        this.lives = null;
        this.hangman = null;
        this.counter = null;
    }
    //связываю view с моделью и контейнером, нахожу нужные div
    start(model, container){
        this.model = model;
        this.container = container;
        this.nav = this.container.querySelector('.nav');
        this.gameContainer = this.container.querySelector('.game');
        this.menu  = this.container.querySelector('.menu');
        this.modal = this.container.querySelector('.modal--new-game');
        this.lives = this.container.querySelector('.live');
        this.wordBlock  = this.container.querySelector('.word');
        this.hintBlock  = this.container.querySelector('.hint');
        this.alphabet = this.container.querySelector('.alphabet');
        this.hangman = this.container.querySelector('.hangman');
    }
    //первичная отрисовка
    render(){
        console.log('picked word: ', this.model.word)
        if(this.model.level === 2) this.drawTimer();
        this.drawLives();
        this.drawMan(); 
        this.drawWordBlock();
        //добавляю подсказку
        this.hintBlock.innerHTML = this.model.hint;        
        this.drawAlphabet()        
    }
    //обновление view
    update(){
        if(this.model.scoreInfo){
            this.showScoreTable();
        }
        if(this.model.gameState === 4 || this.model.gameState === 3){
            setTimeout(()=>{
                this.reset();
                this.showScore();
            }, 100)
        }
        if(this.model.gameState === 2){
            let wordLetters = this.wordBlock.childNodes;
            let livesArr = this.lives.children;
            let used = this.model.usedLetters;    
            //заменяю блоки в слове на отгаданные буквы
            for(let i=0; i<this.model.guesses.length; i++){
                if(this.model.guesses[i].guessed === false) continue;
                wordLetters[i].classList.replace('guessed--false', 'guessed');
                wordLetters[i].innerHTML = this.model.guesses[i].letter;
            }
            //убираю хп и рисую человечка
            if(livesArr.length>this.model.lives && this.model.lives >= 0){
                this.lives.removeChild(livesArr[this.model.lives]);
                this.hangman.querySelector('.transparent').classList.remove('transparent'); 
            }
            //если что-то попадает в массив с использованными буквами, меняю их цвет
            if(used.length > 0){
                used.forEach(el => {
                    let blockedBtn = document.getElementById(el);
                    blockedBtn.classList.replace('letter','used');              
                });
            }
        }
        if(this.model.gameState === 1){
            this.reset();
        }
    }
    //обновление числа в таймере
    updateTimer(){
        this.counter.innerText = this.model.timerCounter;
    }
    //показать таблицу рекордов
    showScoreTable(){
        let scoreBoard = this.container.querySelector('.records__block');
        //если уже были запросы открыть таблицу - очищаю ее
        if(scoreBoard.firstChild) scoreBoard.removeChild(scoreBoard.firstChild);
        //создаю саму таблицу
        let name, score, game;
        let table = document.createElement('table');
        let innerTable = '<tr><th>Место</th><th>Имя игрока</th><th>Счет</th><th>Игра</th></tr>';
        this.model.scoreInfo.forEach((el, ind) => {
            name = el.name;
            score = el.score;
            game = el.game;
            innerTable += `<tr><td>${ind+1}</td><td class='userName'>${name}</td><td class='userScore'>${score}</td><td class='userGame'>${game}</td></tr>`;
        })
        table.innerHTML = innerTable;
        scoreBoard.appendChild(table);
    }
    //показать текущий счет
    showScore(){
        let modal = document.createElement('div');
        let wrapper = document.createElement('div');
        let man = document.createElement('div');
        let hint = document.createElement('div');
        let word = document.createElement('div');
        let stars = new Image(280,150);
        let score = document.createElement('h2');
        let btn = document.createElement('a');
        score.innerText = `счет: ${this.model.userScore}`;
        score.style.cssText = 'font-size: 30px; font-weight: bold';
        btn.style.margin = '15px 0 0';
        stars.src = this.model.scoreImg;
        hint.innerText = this.model.hint;
        hint.classList.add('hint');
        modal.classList.add('score');
        word.classList.add('word');
        btn.classList.add('glow');
        wrapper.classList.add('wrapper');
        for(let i=0; i<this.model.word.length; i++){
            let letter = document.createElement('div');
            this.model.gameState === 3 ? letter.classList.add('guessed') : letter.classList.add('guessed--false');
            letter.innerHTML = this.model.word[i];
            word.appendChild(letter);
        }
        //окно если игра продолжается
        if(this.model.gameState === 3){
            let manImage = document.createElement('div');
            man.appendChild(manImage);
            man.classList.add('alive');
            btn.innerText = 'Продолжить';
            btn.id = 'continue';
            if(this.model.gameLore === 'warcraft'){
                manImage.style.backgroundImage = "url('./img/orc_sprite.png')";
            }else{
                manImage.style.backgroundImage = "url('./img/knight_sprite.png')";
            }
        }
        //окно если игра закончилась
        if(this.model.gameState === 4){
            man.classList.add('dead')
            btn.innerText = 'Закрыть';
            btn.href = '#main';
            btn.id = 'end';
            if(this.model.gameLore === 'warcraft'){
                man.style.backgroundImage = "url('./img/dead_orc.jpg')";
            }else{
                man.style.backgroundImage = "url('./img/dead_knight.jpg')";
            }
        }
        wrapper.appendChild(stars);
        wrapper.appendChild(score);
        wrapper.appendChild(man);
        wrapper.appendChild(hint);
        wrapper.appendChild(word);
        wrapper.appendChild(btn);
        modal.appendChild(wrapper);
        this.gameContainer.appendChild(modal);
    }
    //сбрасываю содержимое всех div игры
    reset(){
        let content = this.gameContainer.querySelectorAll('div');
        content.forEach(el => el.innerHTML = '');
        let scoreCheck = this.gameContainer.querySelector('.score');
        if(scoreCheck) this.gameContainer.removeChild(scoreCheck);
    }
    //рисую таймер
    drawTimer(){       
        let timerBlock = document.createElement('div');
        let timerImg = new Image(33, 44);
        this.counter = document.createElement('span');
        this.counter.id = 'counter';
        this.counter.innerText= this.model.timerCounter;
        timerImg.src = 'img/clock.svg';
        timerBlock.classList.add('timer');    
        timerBlock.appendChild(timerImg);
        timerBlock.appendChild(this.counter);
        this.gameContainer.appendChild(timerBlock);
    }
    //создаю блок со словом
    drawWordBlock(){
        for(let i=0; i<this.model.word.length; i++){
            let letter = document.createElement('div');
            letter.classList.add('guessed--false');
            //letter.innerHTML = this.model.word[i];
            this.wordBlock.appendChild(letter);
        }
    }
    //создаю хп
    drawLives(){
        for(let i=0; i<this.model.lives; i++){
            let heart = document.createElement('div');
            heart.classList.add('heart');
            heart.innerHTML = '&#10084';
            this.lives.appendChild(heart);
        }
    }
    //рисую буквы алфавита
    drawAlphabet(){
        let ul = document.createElement('ul');
        ul.classList.add('alphabet__block');
        for(let i=0; i<this.model.alphabet.length; i++){
            let li = document.createElement('li');
            li.classList.add('letter');
            li.innerHTML = this.model.alphabet[i];
            li.id = `letter__${i+1}`;
            ul.appendChild(li);
        }
        this.alphabet.appendChild(ul);
    }
    //человечек
    drawMan(){
        for(let i = 0; i<=this.model.lives; i++){
            let hangmanPart = document.createElement('div');
            if(i===0){
                hangmanPart.style.backgroundColor = 'white';
            }else if(i===1){
                hangmanPart.style.backgroundImage = `url('./img/layer${i}.jpg')`;
                hangmanPart.classList.add('transparent');
            }else{
                if(this.model.gameLore === 'warcraft'){
                     (this.model.level === 2 && i === 4)
                    ?hangmanPart.style.backgroundImage = "url('./img/orc_hands.png')"
                    :(this.model.level === 2 && i === 5)
                    ?hangmanPart.style.backgroundImage = "url('./img/orc_legs.png')"
                    :hangmanPart.style.backgroundImage = `url('./img/orc${i}.png')`
                }else{
                    (this.model.level === 2 && i === 4)
                    ?hangmanPart.style.backgroundImage = "url('./img/knight_hands.png')"
                    :(this.model.level === 2 && i === 5)
                    ?hangmanPart.style.backgroundImage = "url('./img/knight_legs.png')"
                    :hangmanPart.style.backgroundImage = `url('./img/knight${i}.png')`
                }
                hangmanPart.classList.add('transparent');
            }
            hangmanPart.classList.add(`layer${i}`);
            this.hangman.appendChild(hangmanPart);
        }
    }
}