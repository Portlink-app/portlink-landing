const walk=document.querySelector('#walkthrough');
const records=[...walk.querySelectorAll('[data-scene]')];
const buttons=[...walk.querySelectorAll('[data-jump]')];
let active=-1,queued=false;
function select(index){
  if(index===active)return;
  active=index;
  walk.querySelectorAll('[data-stop]').forEach((el,i)=>el.setAttribute('aria-current',String(i===index)));
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
// Film scrubbing. The <video> is mounted by app/(product)/embark/EmbarkFilm.tsx only when the visitor
// has not asked for reduced motion (check-film-motion), so it may arrive after this script runs.
const filmChapters=track.querySelector('[data-film-time]')?.parentElement;
function initFilm(film){
if(filmChapters)filmChapters.hidden=false;
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
const portrait=matchMedia('(max-width: 700px)');
const widePoster=film.poster;
function choosePoster(){film.poster=portrait.matches?film.dataset.portraitPoster:widePoster}
choosePoster();
portrait.addEventListener('change',()=>{
  const time=film.currentTime,playing=!film.paused;
  choosePoster();
  film.addEventListener('loadedmetadata',()=>{
    film.currentTime=Math.min(time,film.duration);
    if(playing)film.play().catch(()=>{});
  },{once:true});
  film.load();
});
const resume=track.querySelector('.film-resume');
const chapters=[...track.querySelectorAll('[data-film-time]')];
function takeControl(){manual=true;resume.hidden=motion.matches}
resume.addEventListener('click',()=>{film.pause();manual=false;resume.hidden=true;queueSeek()});
for(const type of ['play','pointerdown','keydown'])film.addEventListener(type,takeControl);
chapters.forEach(button=>button.addEventListener('click',()=>{
  takeControl();film.pause();film.currentTime=Number(button.dataset.filmTime);
}));
function updateChapter(){
  chapters.forEach((button,index)=>{
    const start=Number(button.dataset.filmTime),end=Number(chapters[index+1]?.dataset.filmTime??Infinity);
    button.setAttribute('aria-current',String(film.currentTime>=start && film.currentTime<end));
  });
}
film.addEventListener('timeupdate',updateChapter);updateChapter();
film.addEventListener('loadedmetadata',queueSeek);
film.addEventListener('seeked',queueSeek);
addEventListener('scroll',queueSeek,{passive:true});
}
const filmNow=track.querySelector('video');
if(filmNow)initFilm(filmNow);
else{if(filmChapters)filmChapters.hidden=true;addEventListener('embark-film',e=>initFilm(e.detail),{once:true})}
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
