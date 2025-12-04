(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // 输入
  const keys = {};
  window.addEventListener('keydown', e=>{ keys[e.code]=true; e.preventDefault(); });
  window.addEventListener('keyup', e=>{ keys[e.code]=false; e.preventDefault(); });

  // 玩家
  const player = {x:80,y:H-80,w:28,h:40,vx:0,vy:0,onGround:false,dir:1,canShoot:0,health:3};
  const gravity = 0.9;

  // 子弹
  const bullets = [];
  const enemies = [];
  let spawnTimer = 0;
  let score = 0;

  function spawnEnemy(){
    const y = H - 60;
    enemies.push({x:W+30,y:y,w:32,h:40,vx:-2,health:1});
  }

  function update(){
    // 玩家控制
    if(keys['ArrowLeft']){ player.vx = -3; player.dir = -1; }
    else if(keys['ArrowRight']){ player.vx = 3; player.dir = 1; }
    else player.vx = 0;

    if(keys['Space'] || keys['KeyW']){
      if(player.onGround){ player.vy = -12; player.onGround = false; }
    }

    if(keys['KeyZ']){
      if(player.canShoot<=0){
        bullets.push({x:player.x + (player.dir>0?player.w: -6), y:player.y+12, vx:player.dir*8, w:8,h:4});
        player.canShoot = 12;
      }
    }
    if(player.canShoot>0) player.canShoot--;

    // 物理
    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    // 地面约束
    if(player.y + player.h >= H - 20){ player.y = H - 20 - player.h; player.vy = 0; player.onGround = true; }

    // 边界
    if(player.x < 0) player.x = 0;
    if(player.x + player.w > W) player.x = W - player.w;

    // 更新子弹
    for(let i=bullets.length-1;i>=0;i--){
      const b = bullets[i];
      b.x += b.vx;
      if(b.x < -20 || b.x > W+20) bullets.splice(i,1);
    }

    // 更新敌人
    for(let i=enemies.length-1;i>=0;i--){
      const e = enemies[i];
      e.x += e.vx;
      if(e.x + e.w < -50) enemies.splice(i,1);
    }

    // 碰撞检测：子弹 vs 敌人
    for(let i=bullets.length-1;i>=0;i--){
      const b = bullets[i];
      for(let j=enemies.length-1;j>=0;j--){
        const e = enemies[j];
        if(rectIntersect(b,e)){
          bullets.splice(i,1);
          e.health--;
          if(e.health<=0){ enemies.splice(j,1); score += 100; }
          break;
        }
      }
    }

    // 玩家 vs 敌人
    for(let j=enemies.length-1;j>=0;j--){
      const e = enemies[j];
      if(rectIntersect(player,e)){
        // 简化处理：碰到扣血并把敌人移出
        player.health--; enemies.splice(j,1);
        if(player.health<=0){ resetGame(); }
      }
    }

    // 生成敌人
    spawnTimer++;
    if(spawnTimer > 90){ spawnTimer = 0; spawnEnemy(); }
  }

  function rectIntersect(a,b){
    return a.x < b.x + b.w && a.x + (a.w||0) > b.x && a.y < b.y + b.h && a.y + (a.h||0) > b.y;
  }

  function resetGame(){
    player.x = 80; player.y = H-80; player.health = 3; enemies.length=0; bullets.length=0; score=0;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);

    // 地面
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(0,H-20,W,20);

    // 玩家
    ctx.fillStyle = '#ffeb3b'; ctx.fillRect(player.x,player.y,player.w,player.h);

    // 子弹
    ctx.fillStyle = '#fff'; bullets.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));

    // 敌人
    ctx.fillStyle = '#e74c3c'; enemies.forEach(e=>ctx.fillRect(e.x,e.y,e.w,e.h));

    // HUD
    ctx.fillStyle = '#fff'; ctx.font = '18px Arial';
    ctx.fillText('生命: ' + player.health, 10, 24);
    ctx.fillText('得分: ' + score, 120, 24);
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }
  loop();
})();
