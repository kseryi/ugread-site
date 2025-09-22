// Навігація для мобільного меню
document.addEventListener('DOMContentLoaded', ()=>{
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  // Анімація в хедері
  const canvas = document.getElementById('header-bg');
  const ctx = canvas.getContext('2d');
  let width, height, particles;

  function resize(){
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    particles = Array.from({length:80}, ()=> ({
      x: Math.random()*width,
      y: Math.random()*height,
      vx: (Math.random()-0.5)*0.5,
      vy: (Math.random()-0.5)*0.5
    }));
  }

  function draw(){
    ctx.clearRect(0,0,width,height);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>width) p.vx*=-1;
      if(p.y<0||p.y>height) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,2,0,Math.PI*2);
      ctx.fill();
    });
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        let a=particles[i], b=particles[j];
        let dx=a.x-b.x, dy=a.y-b.y;
        let dist=dx*dx+dy*dy;
        if(dist<100*100){
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);

  // Реакція на рух миші
  canvas.addEventListener('mousemove', e=>{
    particles.forEach(p=>{
      p.vx += (e.movementX)*0.0005;
      p.vy += (e.movementY)*0.0005;
    });
  });

  // Реакція на скрол
  window.addEventListener('scroll', ()=>{
    particles.forEach(p=>{
      p.y += window.scrollY*0.001;
    });
  });
});
