'use strict'
class Model{
    constructor(){
        this.view = null;
        this.server = 'https://fe.it-academy.by/AjaxStringStorage2.php';
        this.projectName = 'DUBOVIK_CATHERINE_HANGMAN';
        this.projectScores = 'DUBOVIK_CATHERINE_HANGMAN_SCORES';
        this.password = null;
        this.scoreInfo = null;
        this.userName = 'Аноним';             //имя пользователя по умолчанию  
        this.userScore = 0;                   //очки игрока
        this.scoreImg = null;                 //картинка с рейтингом за отгадывание слова
        this.gameArray = null;                //с каким массивом слов идет работа
        this.word = null;                     //выбранное слово
        this.hint = null;                     //подсказка
        this.level = 1;                       //1- легко, 2 -сложно (1 по умолчанию)
        this.lives = 7;                       //жизни, по умолчанию 7 (легкий уровень)
        this.remainingLetters = null;         //количество неотгаданных букв
        this.usedLetters = [];                //заблокированные кнопки, которые пользователь уже вводил
        this.guesses = [];                    //[{'буква': false/true}]     
        this.storage = null;                  //хранилище всех слов игры
        this.gameLore = null;                 //выбранная в чекбоксе игра
        this.gameState = 0;                   //0 - загрузочный экран, 1 - модальное окно с настройками игры, 2- игра началась, 3 - отгадал, 4 - не отгадал
        this.timer = null;                    //id интервала при сложной игре
        this.timerStop = null;                //id таймера при сложной игре
        this.timerCounter = 10;               //секунды до снития жизни при сложной игре
        this.alphabet = ['а','б','в','г','д','е','ж','з','и','й','к','л','м','н','о',
        'п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'];
        this.uiTrue = new Audio('sounds/ui_true.mp3');
        this.uiFalse = new Audio('sounds/ui_false.mp3');
    }
    //при старте связываем с view
    start(view){
        this.view = view;
    }
    //обновление view
    updateView(){
        if(this.view){
            this.view.update();
        }
        if(this.timer){
            this.view.updateTimer();
        }
    }
    //обновляю состояние игры
    updateState(state){
        this.gameState = state;
        this.updateView();
    }
    //загрузка данных пользователя
    loadUserInfo(){
        this.resetModel();
        this.view.reset();
        let form = document.forms.userinfo;
        let levels = form.elements.level;
        if(form.elements.username.value !== ''){
            this.userName = form.elements.username.value.trim().substr(0,25);
        }
        levels.forEach(radioBtn =>{
            if(radioBtn.checked) this.level = Number(radioBtn.value);
        });
        let gameLore = form.elements.game;
        gameLore.forEach(radioBtn =>{
            if(radioBtn.checked) this.gameLore = radioBtn.value;
        });
    }
    //установка пользовательских данных для игры
    setUserSettings(){
        this.gameLore === 'warcraft' ? this.gameArray = this.storage.warcraft : this.gameArray = this.storage.darkSouls;
        this.level === 1 ? this.lives = 7 : this.lives = 5;
        this.pickRandomWord(this.gameArray);
        this.remainingLetters = this.word.length;
        this.countGuesses(this.word);
        this.view.render();
        this.updateState(2);
    }
    //интервал на 10 сек и таймер для сложной игры
    startCounter(){
        this.timerCounter = 10;
        this.view.updateTimer();
        this.timer = setInterval(()=>{
            this.timerCounter--;
            this.checkWin();
            this.view.updateTimer();
        }, 1000);
        this.timerStop = setTimeout(() => {
            clearInterval(this.timer);
            this.playSound(this.uiFalse);
            this.vibrate(false);
            this.lives--;
            this.timer = null;
            this.updateView();
            this.startCounter();
        }, 10000);
    }
    //выбираю случайное слово и передаю данные в this.word, this.hint
    pickRandomWord(gameArr){
        let ind = Math.floor(Math.random()*gameArr.length);
        this.word = gameArr[ind].word.toLowerCase().split('');
        this.hint = gameArr[ind].hint;
    }
    //сохраняю слово в формате [{'буква': false/true}]  
    countGuesses(w){
        for(let i=0; i< w.length; i++){
            let hash = {};
            hash.letter = w[i];
            hash.guessed = false;
            this.guesses.push(hash);
        }
        this.updateView();
    }
    //складываю id нажатой кнопки с буквой в массив
    blockButton(letter){
        this.usedLetters.push(letter.id);
        this.updateView();
    }
    //складываю id введенной с клавиатуры буквы в массив
    blockPressed(letterCode){
        let aCode = 'а'.charCodeAt();      //1072
        let lastLetter = 'я'.charCodeAt(); //1103
        aCode--;
        let pressedLetter = String.fromCharCode(letterCode);
        let id = letterCode - aCode;
        //если с клавиатуры введена русская буква, добавляю ее к использованным
        if(letterCode>aCode && letterCode<=lastLetter){
            if(!this.usedLetters.includes(`letter__${id}`)){
                if(this.level === 2){
                    clearInterval(this.timer);
                    clearTimeout(this.timerStop);
                    this.timerCounter = 10;
                    this.startCounter();
                }
                this.usedLetters.push(`letter__${id}`);
                this.checkGuess(pressedLetter);
                this.updateView();
            }           
        }
    }
    //проверяю введенную букву   
    checkGuess(letter){
        if(this.word.includes(letter)){
            this.guesses.forEach(el => {
                if(el.letter === letter){
                    this.playSound(this.uiTrue);
                    this.vibrate(true);
                    el.guessed = true;
                    this.remainingLetters--;
                }
            });
        }else{
            this.playSound(this.uiFalse);
            this.vibrate(false);
            this.lives--;
        }
        this.updateView();
    }
    //проверка, отгадано ли слово или закончились жизни
    checkWin(){
        if(this.lives === 0){
            if(this.level === 2){
                clearInterval(this.timer);
                clearTimeout(this.timerStop);
                this.view.updateTimer();
            }
            this.scoreImg = './img/stars_0.jpg';
            this.updateState(4);
        }
        if(this.remainingLetters === 0 && this.gameState === 2){
            if(this.level === 1){
                if(this.lives < 3){
                    this.userScore += 5;
                    this.scoreImg = './img/stars_1.jpg';
                }else if (this.lives < 6){
                    this.userScore += 10;
                    this.scoreImg = './img/stars_2.jpg';
                }else{
                    this.userScore += 15;
                    this.scoreImg = './img/stars_3.jpg';
                }
            }
            if(this.level === 2){
                if(this.timer){
                    clearInterval(this.timer);
                    clearTimeout(this.timerStop);
                }
                if(this.lives < 3){
                    this.userScore += 10;
                    this.scoreImg = './img/stars_1.jpg';
                }else if(this.lives < 4){
                    this.userScore += 20;
                    this.scoreImg = './img/stars_2.jpg';
                }else{
                    this.userScore += 30;
                    this.scoreImg = './img/stars_3.jpg';
                }
            }
            this.updateState(3);
        }
    }
    //продолжить игру и сбросить содержимое игрового блока
    continue(){
        this.level === 1 ? this.lives = 7 : this.lives = 5;
        this.timerCounter = 10;
        this.remainingLetters = null; 
        this.usedLetters = []; 
        this.guesses = [];
        this.gameState = 2;
        this.pickRandomWord(this.gameArray);
        this.remainingLetters = this.word.length;
        this.countGuesses(this.word);
        this.view.reset();
        this.view.render();
        this.updateView();
    }
    //сброс модели к изначальным настройкам
    resetModel(){
        this.password = null; 
        this.userName = 'Аноним';  
        this.userScore = 0; 
        this.scoreImg = null;
        this.gameArray = null; 
        this.word = null;  
        this.hint = null; 
        this.level = 1;  
        this.lives = 7;
        this.remainingLetters = null; 
        this.usedLetters = []; 
        this.guesses = [];  
        this.gameLore = null;   
        this.gameState = 0;
    }
    //звук 
    playSound(sound){
        sound.currentTime = 0;
        sound.play();
    }
    //вибрация
    vibrate(val){
        if(navigator.vibrate){
            val ? window.navigator.vibrate([100, 50, 100]) : window.navigator.vibrate(200);
        }
    }
    //AJAX
    readStorage(str){
        if(str === this.projectName){
            $.ajax({
                url: this.server, type: 'POST', cache: false, dataType:'json',
                data: {f: 'READ', n: str},
                success: (data)=>this.readReady(data),
                error: (err)=>this.errorHandler(err)
            })        
        }else{
            $.ajax({
                url: this.server, type: 'POST', cache: false, dataType:'json',
                data: {f: 'READ', n: str},
                success: (data)=>this.scoresReady(data),
                error: (err)=>this.errorHandler(err)
            })        
        }
    }
    readReady(callback){
        if (callback.error !== undefined) console.log(callback.error);
        if(callback.result !== ''){
            this.storage = JSON.parse(callback.result);
        }
    }
    scoresReady(callback){
        if (callback.error !== undefined) console.log(callback.error);
        if(callback.result !== ''){
            this.scoreInfo = JSON.parse(callback.result);
            this.updateView();
            //сохраняю счет игрока, только если набрал больше, чем последний в таблице рекордов
            if(this.userScore > this.scoreInfo[this.scoreInfo.length-1].score){
                console.log('ПОПАЛ В РЕКОРДЫ')
                this.storeUserScore();
            }
        }
    }
    //добавляю новый рекорд в таблицу
    storeUserScore(){
        this.password = Math.random();
        $.ajax({
            url: this.server, type: 'POST', cache: false, dataType:'json',
            data: {f: 'LOCKGET', n: this.projectScores, p: this.password},
            success: (data)=>this.lockGetReady(data), error: (err)=>this.errorHandler(err)
        })
    }
    lockGetReady(callback){
        if (callback.error !== undefined){
            console.log(callback.error);
        }else{
            let user = {
                name: this.userName,
                score: this.userScore,
                game: this.gameLore
            }
            console.log(user)
            this.scoreInfo.push(user);
            //сортирую массив по убыванию очков, если больше 10,то обрезаю
            this.scoreInfo.sort((a,b) => a.score < b.score ? 1 : -1);
            if(this.scoreInfo.length > 10){
                this.scoreInfo = this.scoreInfo.slice(0, 10);
            }
            $.ajax({
                url: this.server, type: 'POST', cache: false, dataType:'json',
                data: {f: 'UPDATE', n: this.projectScores, v: JSON.stringify(this.scoreInfo), p: this.password},
                success: (data)=>this.updateReady(data), error: (err)=>this.errorHandler(err)
            })
        }
    }
    updateReady(callback){
        if (callback.error !== undefined){
            console.log(callback.error);
        }else{
            this.resetModel();
        } 
    }
    errorHandler(jqXHR,statusStr,errorStr){
        alert(statusStr+' '+errorStr);
    }
}
