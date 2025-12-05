(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // 简化实体类与游戏管理
  class Player{
    constructor(x,y){
      this.x=x; this.y=y; this.w=28; this.h=40; this.vx=0; this.vy=0; this.onGround=false; this.dir=1;
      this.shootCooldown=0; this.health=3;
      this.state = 'idle'; // idle, run, jump, shoot, dead
      this.stateTimer = 0;
      this.anim = null;
    }
    setState(s){ if(this.state === s) return; this.state = s; this.stateTimer = 0; // reset animation for new state
      try{ if(this.anim && this.anim[s]) this.anim[s].reset(); }catch(e){}
    }
    update(keys, dt){
      // dt in seconds
      const speed = 3; // base per-frame style scaled by dt*60
      const scale = dt * 60;
      if(this.state === 'dead') return;

      // horizontal input
      if(keys['ArrowLeft']){ this.vx = -speed; this.dir = -1; }
      else if(keys['ArrowRight']){ this.vx = speed; this.dir = 1; }
      else this.vx = 0;

      // jump
      if((keys['Space'] || keys['KeyW']) && this.onGround){ this.vy = -12; this.onGround = false; this.setState('jump') }

      // physics (keep legacy feel by scaling)
      this.vy += 0.9 * scale;
      this.x += this.vx * scale;
      this.y += this.vy * scale;

      // ground
      if(this.y + this.h >= H - 20){ this.y = H - 20 - this.h; this.vy = 0; if(!this.onGround){ this.onGround = true; if(this.state === 'jump') this.setState('idle') } }

      if(this.x < 0) this.x = 0; if(this.x + this.w > W) this.x = W - this.w;

      // shoot cooldown
      if(this.shootCooldown > 0) this.shootCooldown -= dt; if(this.shootCooldown < 0) this.shootCooldown = 0;

      // state transitions for run/idle
      if(this.onGround && this.state !== 'shoot' && this.state !== 'jump'){
        if(Math.abs(this.vx) > 0.5) this.setState('run'); else this.setState('idle');
      }

      this.stateTimer += dt;
    }
    draw(ctx){ ctx.fillStyle='#ffeb3b'; ctx.fillRect(this.x,this.y,this.w,this.h) }
  }

  class Bullet{ constructor(x,y,vx){ this.x=x; this.y=y; this.vx=vx; this.w=8; this.h=4 } update(){ this.x += this.vx } draw(ctx){ ctx.fillStyle='#fff'; ctx.fillRect(this.x,this.y,this.w,this.h) } }

  class Enemy{ constructor(x,y){ this.x=x; this.y=y; this.w=32; this.h=40; this.vx=-2; this.health=1 } update(){ this.x += this.vx } draw(ctx){ ctx.fillStyle='#e74c3c'; ctx.fillRect(this.x,this.y,this.w,this.h) } }

  // 游戏状态管理
  const keys = {};
  window.addEventListener('keydown', e=>{ keys[e.code]=true; });
  window.addEventListener('keyup', e=>{ keys[e.code]=false; });

  const state = { mode:'login', playerName:'player' };
  const player = new Player(80, H-80);
  const bullets = [];
  const enemies = [];
  let spawnTimer = 0;
  let score = 0;
  let currentLevelIndex = 0;

  // 关卡配置（逐渐提高难度）
  const levels = [
    { name: '简单', spawnInterval: 110, enemySpeed: -1.5, targetScore: 500 },
    { name: '普通', spawnInterval: 90, enemySpeed: -2.2, targetScore: 1500 },
    { name: '困难', spawnInterval: 70, enemySpeed: -3.0, targetScore: 3500 }
  ];

  function currentLevel(){ return levels[currentLevelIndex] }

  // overlay handling
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const nameInput = document.getElementById('playerName');
  const difficultySelect = document.getElementById('difficulty');
  const muteBtn = document.getElementById('muteBtn');
  let isMuted = false;
  const preloaderEl = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloader-fill');
  const preloaderText = document.getElementById('preloader-text');

  // 简单的 WebAudio 音效管理（无需外部文件）
  const SoundManager = {
    ctx: null,
    init(){ if(this.ctx) return; try{ this.ctx = new (window.AudioContext||window.webkitAudioContext)() }catch(e){ this.ctx=null } },
    playBeep(freq, time=0.05, type='sine'){ if(!this.ctx || isMuted) return; const o=this.ctx.createOscillator(); const g=this.ctx.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(this.ctx.destination); g.gain.value=0.06; o.start(); o.stop(this.ctx.currentTime + time); },
    playShoot(){ this.playBeep(900,0.06,'square') },
    playHit(){ this.playBeep(200,0.12,'sawtooth') },
    playExplode(){ this.playBeep(80,0.3,'sawtooth') },
    resume(){ if(this.ctx && this.ctx.state==='suspended') this.ctx.resume(); }
  };
  startBtn.addEventListener('click', ()=>{
    const name = nameInput.value.trim();
    state.playerName = name || 'player';
    // 应用难度
    const d = difficultySelect ? difficultySelect.value : 'normal';
    if(d === 'easy') currentLevelIndex = 0;
    else if(d === 'normal') currentLevelIndex = 1;
    else if(d === 'hard') currentLevelIndex = 2;
    state.mode = 'playing';
    overlay.style.display = 'none';
    // 启动资源预加载，再进入游戏
    SoundManager.init(); SoundManager.resume();
    // 显示预载器
    if(preloaderEl){ preloaderEl.style.display = 'block'; preloaderFill.style.width = '0%'; preloaderText.textContent = '加载中 0%'; }
    ResourceLoader.loadAll().then(()=>{
      if(preloaderEl) preloaderEl.style.display = 'none';
      // 构建动画
      buildAnimations();
      state.mode = 'playing'; overlay.style.display = 'none'; SoundManager.playShoot();
    }).catch(err=>{
      console.error('资源加载失败',err); if(preloaderText) preloaderText.textContent = '资源加载失败，继续开始'; state.mode = 'playing'; overlay.style.display = 'none';
    });
  });
  
  // 资源加载器：图片（SVG/PNG）与音频占位实现
  const ResourceLoader = {
    images: {},
    list: [
      {key:'player', src:'assets/player.svg'},
      {key:'player_walk1', src:'assets/player_walk1.svg'},
      {key:'player_walk2', src:'assets/player_walk2.svg'},
      {key:'player_walk3', src:'assets/player_walk3.svg'},
      {key:'enemy', src:'assets/enemy.svg'},
      {key:'enemy_fly1', src:'assets/enemy_fly1.svg'},
      {key:'enemy_fly2', src:'assets/enemy_fly2.svg'}
    ],
    loadImage(item){ return new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>res({key:item.key,img}); img.onerror=rej; img.src=item.src; }) },
    loadAll(){
      const tasks = this.list.map(i=>this.loadImage(i).then(r=>{ this.images[r.key]=r.img; const done = Object.keys(this.images).length; const total = this.list.length; const pct = Math.floor(done/total*100); if(preloaderFill) preloaderFill.style.width = pct + '%'; if(preloaderText) preloaderText.textContent = '加载中 ' + pct + '%'; }));
      return Promise.all(tasks);
    }
  };

  // 强化的动画类：支持 loop、一次性播放(onFinished) 与 reset
  class Animation{
    constructor(frames, frameRate=8, options={loop:true,onFinished:null}){
      this.frames = frames || [];
      this.frameRate = frameRate;
      this.index = 0; this.acc = 0;
      this.loop = options.loop !== undefined ? options.loop : true;
      this.onFinished = options.onFinished || null;
      this.finished = false;
    }
    update(dt){ if(this.finished) return; this.acc += dt; const interval = 1/this.frameRate; if(this.acc >= interval){ const steps = Math.floor(this.acc/interval); this.index += steps; this.acc -= steps*interval; if(this.index >= this.frames.length){ if(this.loop){ this.index = this.index % Math.max(1,this.frames.length); } else { this.index = this.frames.length - 1; this.finished = true; if(this.onFinished) try{ this.onFinished() }catch(e){ console.error(e) } } } } }
    current(){ return this.frames.length ? this.frames[Math.max(0,Math.min(this.index, this.frames.length-1))] : null }
    reset(){ this.index = 0; this.acc = 0; this.finished = false }
  }

  // 当资源加载完成后，构建动画实例
  function buildAnimations(){
    const imgs = ResourceLoader.images;
    // player animations (更多帧与非循环支持)
    const pWalk = [imgs.player_walk1, imgs.player_walk2, imgs.player_walk3, imgs.player_walk4, imgs.player_walk5].filter(Boolean);
    const pJump = [imgs.player_jump, imgs.player_jump2].filter(Boolean);
    const pShoot = [imgs.player_shoot, imgs.player_shoot2].filter(Boolean);
    const pDeath = [imgs.player_death, imgs.player_death2, imgs.player_death3].filter(Boolean);
    player.anim = {
      idle: new Animation([imgs.player].filter(Boolean), 1, {loop:true}),
      walk: new Animation(pWalk, 12, {loop:true}),
      jump: new Animation(pJump, 6, {loop:false}),
      shoot: new Animation(pShoot, 18, {loop:false, onFinished: ()=>{ if(player.state==='shoot'){ // 回到合适状态
        if(player.onGround && Math.abs(player.vx)>0.5) player.setState('run'); else player.setState('idle'); } }}),
      death: new Animation(pDeath, 6, {loop:false, onFinished: ()=>{ player.setState('dead'); setTimeout(()=>{ resetGame() }, 800); } })
    };
    // enemy animations (fly)
    const eFly = [imgs.enemy_fly1, imgs.enemy_fly2].filter(Boolean);
    Enemy.prototype.getSprite = function(){ if(eFly.length && Math.abs(this.vx) > 1.9) return eFly[Math.floor((Date.now()/150)%eFly.length)]; return imgs.enemy || null }
  }

  // 静音按钮
  if(muteBtn){ muteBtn.addEventListener('click', ()=>{ isMuted = !isMuted; muteBtn.textContent = isMuted ? '🔇' : '🔊'; }) }

  function spawnEnemy(){ const lvl = currentLevel(); const e = new Enemy(W+30, H-60); e.vx = lvl.enemySpeed; enemies.push(e) }

  function rectIntersect(a,b){ return a.x < b.x + b.w && a.x + (a.w||0) > b.x && a.y < b.y + b.h && a.y + (a.h||0) > b.y }

  function resetGame(){ player.x=80; player.y=H-80; player.health=3; enemies.length=0; bullets.length=0; score=0; state.mode='login'; overlay.style.display='flex' }

  function update(dt){
    if(state.mode !== 'playing') return;
    // player update
    player.update(keys, dt);

    // shooting
    if(keys['KeyZ'] && player.shootCooldown<=0 && player.state !== 'dead'){
      bullets.push(new Bullet(player.x + (player.dir>0?player.w:-6), player.y+12, player.dir*8)); player.shootCooldown = 0.18; player.setState('shoot'); player.stateTimer = 0; SoundManager.playShoot();
    }

    // bullets
    for(let i=bullets.length-1;i>=0;i--){ bullets[i].update(); if(bullets[i].x < -20 || bullets[i].x > W+20) bullets.splice(i,1) }

    // enemies
    for(let i=enemies.length-1;i>=0;i--){ enemies[i].update(); if(enemies[i].x + enemies[i].w < -50) enemies.splice(i,1) }

    // bullet vs enemy
    for(let i=bullets.length-1;i>=0;i--){ const b=bullets[i]; for(let j=enemies.length-1;j>=0;j--){ const e=enemies[j]; if(rectIntersect(b,e)){ bullets.splice(i,1); e.health--; SoundManager.playHit(); if(e.health<=0){ enemies.splice(j,1); score += 100; SoundManager.playExplode() } break } } }

    // player vs enemy
    for(let j=enemies.length-1;j>=0;j--){ const e=enemies[j]; if(rectIntersect(player,e)){ player.health--; enemies.splice(j,1); SoundManager.playHit(); if(player.health<=0){ state.mode='gameover'; setTimeout(resetGame, 800); } } }

    // 根据关卡调整生成节奏
    spawnTimer++; if(spawnTimer > currentLevel().spawnInterval){ spawnTimer=0; spawnEnemy() }

    // 关卡升级检测
    if(currentLevelIndex < levels.length-1 && score >= currentLevel().targetScore){ currentLevelIndex++; }
  }

  function draw(dt){
    ctx.clearRect(0,0,W,H);
    // ground
    ctx.fillStyle='#2b2b2b'; ctx.fillRect(0,H-20,W,20);
    // player (animation if available)
    if(player.anim){
      // choose animation by state
      let anim = player.anim.idle;
      if(player.state === 'run') anim = player.anim.walk;
      else if(player.state === 'jump') anim = player.anim.jump || player.anim.idle;
      else if(player.state === 'shoot') anim = player.anim.shoot || player.anim.idle;
      else if(player.state === 'dead') anim = player.anim.death || player.anim.idle;
      if(anim){ anim.update(dt); const img = anim.current(); if(img) ctx.drawImage(img, player.x, player.y, player.w, player.h); else player.draw(ctx); } else player.draw(ctx);
    } else if(ResourceLoader.images.player){ const img=ResourceLoader.images.player; ctx.drawImage(img, player.x, player.y, player.w, player.h); } else player.draw(ctx);
    // bullets
    bullets.forEach(b=>b.draw(ctx));
    // enemies
    enemies.forEach(e=>{ const sp = (typeof e.getSprite==='function')? e.getSprite() : ResourceLoader.images.enemy; if(sp) ctx.drawImage(sp, e.x, e.y, e.w, e.h); else e.draw(ctx); });
    // HUD
    ctx.fillStyle='#fff'; ctx.font='18px Arial'; ctx.fillText('生命: '+player.health,10,24); ctx.fillText('得分: '+score,140,24);
    // player name & level
    ctx.fillStyle='#fff'; ctx.font='14px Arial'; ctx.fillText(state.playerName, 10, 48);
    ctx.fillText('关卡: ' + currentLevel().name, 10, 68);
  }

  // main loop with delta time
  let lastTime = null;
  function loop(ts){
    if(!lastTime) lastTime = ts; const dt = Math.min(0.05, (ts - lastTime)/1000); lastTime = ts; update(dt); draw(dt); requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

})();
