const walk=document.querySelector('#walkthrough');
const records=[...walk.querySelectorAll('[data-scene]')];
const buttons=[...walk.querySelectorAll('[data-jump]')];
let active=-1,queued=false;
function select(index){
  if(index===active)return;
  active=index;
  records.forEach((el,i)=>el.hidden=i!==index);
  buttons.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
}
function update(){
  queued=false;
  if(walk.offsetHeight<=innerHeight || matchMedia('(prefers-reduced-motion: reduce)').matches){if(active<0)select(0);return}
  const track=Math.max(1,walk.offsetHeight-innerHeight);
  select(Math.min(records.length-1,Math.max(0,Math.floor(-walk.getBoundingClientRect().top/track*records.length))));
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(update)}}
buttons.forEach((el,i)=>el.addEventListener('click',()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){select(i);return}
  const offset=(i+.15)/records.length*Math.max(1,walk.offsetHeight-innerHeight);
  scrollTo({top:scrollY+walk.getBoundingClientRect().top+offset,behavior:'instant'});select(i)
}));
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
const track=document.querySelector('.film-track');
const film=track.querySelector('video');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let manual=false, busy=false;
function seekFilm(){
  busy=false;
  if(manual||motion.matches||!Number.isFinite(film.duration)||film.seeking)return;
  const box=track.getBoundingClientRect();
  if(box.bottom<0||box.top>innerHeight)return;
  const progress=Math.max(0,Math.min(1,-box.top/Math.max(1,track.offsetHeight-innerHeight)));
  const time=progress*Math.max(0,film.duration-.05);
  if(Math.abs(film.currentTime-time)>.045)film.currentTime=time;
}
function queueSeek(){if(!busy){busy=true;requestAnimationFrame(seekFilm)}}
film.addEventListener('play',()=>manual=true);
film.addEventListener('pointerdown',()=>manual=true);
film.addEventListener('keydown',()=>manual=true);
film.addEventListener('loadedmetadata',queueSeek);
film.addEventListener('seeked',queueSeek);
addEventListener('scroll',queueSeek,{passive:true});
const viewer=document.createElement('dialog');
viewer.innerHTML='<button type="button">Close</button><img alt=""><p></p>';
document.body.append(viewer);
viewer.querySelector('button').addEventListener('click',()=>viewer.close());
document.querySelectorAll('.gallery-shot').forEach(figure=>{
  const btn=document.createElement('button'),image=figure.querySelector('img'),caption=figure.querySelector('figcaption').textContent;
  btn.type='button';btn.className='gallery-zoom';btn.setAttribute('aria-label','Enlarge '+caption);
  image.before(btn);btn.append(image);
  btn.addEventListener('click',()=>{
    const full=viewer.querySelector('img');full.src=image.src;full.alt=image.alt;
    viewer.querySelector('p').textContent=caption+' · Sample data';viewer.showModal();
  });
});
