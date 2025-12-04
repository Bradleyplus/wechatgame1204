(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // 简化实体类与游戏管理
  class Player{
    constructor(x,y){ this.x=x; this.y=y; this.w=28; this.h=40; this.vx=0; this.vy=0; this.onGround=false; this.dir=1; this.canShoot=0; this.health=3 }
    update(keys){
      if(keys['ArrowLeft']){ this.vx = -3; this.dir = -1; }
      else if(keys['ArrowRight']){ this.vx = 3; this.dir = 1; }
      else this.vx = 0;
      if(keys['Space'] || keys['KeyW']){ if(this.onGround){ this.vy = -12; this.onGround=false } }
      this.vy += 0.9; this.x += this.vx; this.y += this.vy;
      if(this.y + this.h >= H - 20){ this.y = H - 20 - this.h; this.vy = 0; this.onGround = true }
      if(this.x < 0) this.x = 0; if(this.x + this.w > W) this.x = W - this.w;
      if(this.canShoot>0) this.canShoot--;
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

  // overlay handling
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const nameInput = document.getElementById('playerName');
  startBtn.addEventListener('click', ()=>{
    const name = nameInput.value.trim();
    state.playerName = name || 'player';
    state.mode = 'playing';
    overlay.style.display = 'none';
  });

  function spawnEnemy(){ enemies.push(new Enemy(W+30, H-60)) }

  function rectIntersect(a,b){ return a.x < b.x + b.w && a.x + (a.w||0) > b.x && a.y < b.y + b.h && a.y + (a.h||0) > b.y }

  function resetGame(){ player.x=80; player.y=H-80; player.health=3; enemies.length=0; bullets.length=0; score=0; state.mode='login'; overlay.style.display='flex' }

  function update(){
    if(state.mode !== 'playing') return;
    // player update
    player.update(keys);

    // shooting
    if(keys['KeyZ'] && player.canShoot<=0){ bullets.push(new Bullet(player.x + (player.dir>0?player.w:-6), player.y+12, player.dir*8)); player.canShoot=12 }

    // bullets
    for(let i=bullets.length-1;i>=0;i--){ bullets[i].update(); if(bullets[i].x < -20 || bullets[i].x > W+20) bullets.splice(i,1) }

    // enemies
    for(let i=enemies.length-1;i>=0;i--){ enemies[i].update(); if(enemies[i].x + enemies[i].w < -50) enemies.splice(i,1) }

    // bullet vs enemy
    for(let i=bullets.length-1;i>=0;i--){ const b=bullets[i]; for(let j=enemies.length-1;j>=0;j--){ const e=enemies[j]; if(rectIntersect(b,e)){ bullets.splice(i,1); e.health--; if(e.health<=0){ enemies.splice(j,1); score += 100 } break } } }

    // player vs enemy
    for(let j=enemies.length-1;j>=0;j--){ const e=enemies[j]; if(rectIntersect(player,e)){ player.health--; enemies.splice(j,1); if(player.health<=0){ state.mode='gameover'; setTimeout(resetGame, 800); } } }

    spawnTimer++; if(spawnTimer>90){ spawnTimer=0; spawnEnemy() }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // ground
    ctx.fillStyle='#2b2b2b'; ctx.fillRect(0,H-20,W,20);
    // player
    player.draw(ctx);
    // bullets
    bullets.forEach(b=>b.draw(ctx));
    // enemies
    enemies.forEach(e=>e.draw(ctx));
    // HUD
    ctx.fillStyle='#fff'; ctx.font='18px Arial'; ctx.fillText('生命: '+player.health,10,24); ctx.fillText('得分: '+score,140,24);
    // player name
    ctx.fillStyle='#fff'; ctx.font='14px Arial'; ctx.fillText(state.playerName, 10, 48);
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }
  loop();

})();
