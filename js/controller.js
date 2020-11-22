class Controller{
    constructor(){
        this.model = null;
        this.container = null;
        this.menu = null;
        this.game = null;
        this.modal=null;
        this.rules = null;
        this.records = null;
        this.swipeStart = 0;
        this.swipeEnd = 0;
    }
    start(model, container){
        this.model = model;
        this.container = container;
        this.menu  = this.container.querySelector('.menu');
        this.game  = this.container.querySelector('.game');
        this.modal  = this.container.querySelector('.modal--new-game');
        this.rules = this.container.querySelector('.rules');
        this.records = this.container.querySelector('.records');
        this.menu.addEventListener('click',() => this.startGame());
        this.modal.addEventListener('click',() => this.startGame());
        this.game.addEventListener('click',() => this.clickBtn());
        this.records.addEventListener('touchstart',() => this.touchStart()); 
        this.records.addEventListener('touchend',() => this.touchEnd());
        this.rules.addEventListener('touchstart',() => this.touchStart()); 
        this.rules.addEventListener('touchend',() => this.touchEnd());
        let closeBtns = this.container.querySelectorAll('.close');
        closeBtns[0].addEventListener('click', () => this.animateBlock(this.rules));
        closeBtns[1].addEventListener('click', () => this.animateBlock(this.records));
        window.addEventListener('beforeunload',() => this.beforeUnload());
        window.addEventListener('hashchange', () => this.switchToStateFromURLHash());
    }
    startGame(EO){
        EO = EO||window.event;
        if(EO.target.id === 'new-game'){
            this.model.updateState(1);
        }
        if(EO.target.id === 'ready'){
            this.model.loadUserInfo();
            this.model.setUserSettings();
            this.model.updateState(2);
            window.addEventListener('keypress', () => this.pressBtn());
            if(this.model.level === 2) this.model.startCounter();           
        }
    }
    animateBlock(block){
        block.animate([
            {top: '0'},
            {top: '-100vh'}
        ], 700);
        setTimeout(()=>window.location.hash = '#main',650);
    }
    touchStart(EO){
        EO = EO||window.event;
        EO.preventDefault(); 
        this.swipeStart = EO.targetTouches[0];
    }
    touchEnd(EO){
        EO = EO||window.event;
        EO.preventDefault(); 
        this.swipeEnd = EO.targetTouches[0];
        let horzShift=Math.abs(this.swipeStart.pageX - this.swipeEnd.pageX);
        let vertShift=Math.abs(this.swipeStart.pageY - this.swipeEnd.pageY);
        if(vertShift > horzShift && vertShift > 30){
            this.animateBlock(EO.targetTouches[0].target);
        }
        this.swipeStart = 0;
        this.swipeEnd = 0;
    }
    clickBtn(EO){
        EO = EO||window.event;
        EO.preventDefault();  
        if(EO.target.className === 'letter'){
            if(this.model.level === 2){
                clearInterval(this.model.timer);
                clearTimeout(this.model.timerStop);
                this.model.timerCounter = 10;
                this.model.startCounter();
            }
            this.model.checkGuess(EO.target.innerHTML);
            this.model.blockButton(EO.target);
            this.model.checkWin();
        }
        if(EO.target.id === 'continue'){
            this.model.continue(); 
            if(this.model.level === 2){
                this.model.startCounter();
            }   
        }
        if(EO.target.id === 'end'){
            this.model.readStorage(this.model.projectScores);
            this.changeView('main');  
        }
    }
    pressBtn(EO){
        EO = EO||window.event;
        if(this.model.gameState >= 2){
            //если нажат enter при видимом блоке очков - продолжить игру/вернуться в меню
            if(EO.keyCode === 13 && this.model.gameState === 3){
                if(this.model.level === 2) this.model.startCounter();
                this.model.continue();
            }else if(EO.keyCode === 13 && this.model.gameState === 4){
                this.model.readStorage(this.model.projectScores);
                this.changeView('main');  
            //если идет игра - проверить догадку пользователя
            }else{
                this.model.blockPressed(EO.keyCode);
                this.model.checkWin();
            }
        }
    }
    //SPA
    switchToStateFromURLHash(EO){
        EO = EO || window.event;
        let willClose = false;
        //значение закладки
        let URLHash = window.location.hash;
        //удаляю первый символ
        let state = URLHash.substr(1); 
        switch(state){
            case 'main':
                this.changeView(state);
                break;
            case 'userInfo':
                if(this.model){
                    if(this.model.gameState >= 2){
                        willClose = confirm('Вы уверены? Прогресс игры будет утерян');
                        if(willClose){
                            this.model.resetModel(); 
                            window.location.hash = 'main';
                            clearInterval(this.model.timer);
                            clearTimeout(this.model.timerStop);
                        }else{
                            window.location.hash = '#play';
                        }
                        this.changeView(state);
                    }
                }
                this.model.readStorage(this.model.projectName);
                this.changeView(state);
                break;
            case 'play':
                if (EO === true){
                    window.location.hash = 'main'; 
                }else{
                    this.changeView(state);
                }
                break;
            case 'rules':
                this.changeView(state);
                break;
            case 'records':
                this.model.readStorage(this.model.projectScores);
                this.changeView(state);
                break;
            default:
                window.location.hash = '#main';
                this.changeView(state);
                break;
        }
    }
    changeView(state){
        let stateElements = [
            {state: 'main', id: 'nav'},
            {state: 'userInfo', id: 'userInfo'},
            {state: 'play', id: 'play'},
            {state: 'rules', id: 'rules'},
            {state: 'records', id: 'records'},
        ];
        stateElements.forEach(el => {
            let showEl = el.state === state;
            showEl ? document.getElementById(el.id).classList.remove('hidden') : document.getElementById(el.id).classList.add('hidden');  
            if(state === 'userInfo'){
                document.getElementById('menu').classList.remove('hidden')
            }
            if(state === 'play'){
                document.getElementById('menu').classList.add('hidden')
            }
            if(state === 'main'){
                document.getElementById('menu').classList.remove('hidden')
            }
        });
    }
    beforeUnload(EO){
        EO = EO || window.event;
        EO.preventDefault();
        if(this.model.gameState >= 2){
            EO.returnValue = 'В случае перезагрузки страницы прогресс игры будет утерян'; 
        }
    }
}