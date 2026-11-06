import * as T from './three.module.min.js';
const host=document.querySelector('.instrument');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(host && !reduced.matches) start();
function start(){
  let renderer;
  try {renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})} catch {return}
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000,0); host.append(renderer.domElement);
  const scene=new T.Scene(), camera=new T.PerspectiveCamera(32,1,.1,40);
  camera.position.set(0,0,8.7);
  const rig=new T.Group();scene.add(rig);
  const css=getComputedStyle(host);
  const color=role=>css.getPropertyValue('--family-'+role).trim();
  const metal=new T.MeshStandardMaterial({color:color('edge-1'),metalness:.88,roughness:.18});
  const teal=new T.MeshStandardMaterial({color:color('accent'),metalness:.34,roughness:.25});
  const ivory=new T.MeshStandardMaterial({color:color('surface-2'),metalness:.20,roughness:.26});
  const studio=document.createElement('canvas');studio.width=512;studio.height=256;
  const ctx=studio.getContext('2d');ctx.fillStyle='#444e50';ctx.fillRect(0,0,512,256);
  for(const [x,y,w,h,col] of [[0,0,512,78,'#f9faf7'],[26,20,60,215,'#fbffff'],[120,76,40,134,'#101819'],[270,60,110,142,'#ffffff'],[420,160,83,60,'#203032']]){
    ctx.fillStyle=col;ctx.fillRect(x,y,w,h)
  }
  const env=new T.CanvasTexture(studio);env.mapping=T.EquirectangularReflectionMapping;env.colorSpace=T.SRGBColorSpace;scene.environment=env;
  scene.add(new T.HemisphereLight(0xffffff,0x889292,1.5));
  const light=new T.DirectionalLight(0xffffff,2.3);light.position.set(-4,6,8);scene.add(light);
  function loop(group,x,y,r,thick,stretch,turn){
    const m=new T.Mesh(new T.TorusGeometry(r,thick,16,72),metal);
    m.scale.y=stretch;m.rotation.y=turn;m.position.set(x,y,0);group.add(m);return m;
  }
  for(let i=0;i<6;i++)loop(rig,0,3.5-i*.32,.14,.049,1.65,i%2?.9:-.45);
  const main=loop(rig,0,1.26,.55,.095,1.22,-.32);main.rotation.z=-.33;
  const operator=document.body.dataset.product==='embark';
  function tag(x,y,angle,w,h,mat,label,sub){
    const g=new T.Group();rig.add(g);g.position.set(x,y,.10);g.rotation.z=angle;g.rotation.y=x*.38;
    const sh=new T.Shape(),l=-w/2,r=w/2,b=-h,t=0,k=.16;
    sh.moveTo(l+k,b);sh.lineTo(r-k,b);sh.quadraticCurveTo(r,b,r,b+k);sh.lineTo(r,t-k);
    sh.quadraticCurveTo(r,t,r-k,t);sh.lineTo(l+k,t);sh.quadraticCurveTo(l,t,l,t-k);sh.lineTo(l,b+k);sh.quadraticCurveTo(l,b,l+k,b);
    const hole=new T.Path();hole.absarc(0,-.16,.07,0,Math.PI*2,true);sh.holes.push(hole);
    const slab=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:true,bevelSize:.045,bevelThickness:.04,bevelSegments:4}),mat);g.add(slab);
    const c=document.createElement('canvas');c.width=512;c.height=640;const a=c.getContext('2d');
    const ink=mat===teal?color('surface-1'):color('text-1');a.fillStyle=ink;a.textAlign='center';
    a.font='bold 118px Arial';a.fillText(label,256,270,455);a.fillRect(70,310,372,5);
    a.font='bold 46px Arial';a.fillText(sub,256,389,450);a.font='30px monospace';a.fillText('GL  /  014',256,471);
    const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;
    const print=new T.Mesh(new T.PlaneGeometry(w*.94,h*.90),new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}));print.position.set(0,-h/2,.168);g.add(print);
    loop(g,0,.02,.15,.043,1.25,.45);
    return g;
  }
  const a=tag(-.45,.88,-.54,1.0,1.72,teal,operator?'E':'PL',operator?'GUIDE':'PORT CALL');
  const b=tag(.39,.78,.30,1.04,1.61,ivory,operator?'10:00':'GLJAV',operator?'ICE FJORD':'ILULISSAT');
  const fob=new T.Group();rig.add(fob);fob.position.set(.74,1.08,-.2);fob.rotation.z=.71;
  loop(fob,0,-.14,.17,.045,1.1,.3);
  const float=new T.Mesh(new T.CapsuleGeometry(.20,.86,12,40),teal);float.position.y=-.94;fob.add(float);
  for(const y of [-.78,-.94]){const stripe=new T.Mesh(new T.CylinderGeometry(.205,.205,.09,40),ivory);stripe.position.y=y;fob.add(stripe)}
  let px=0,py=0,frame=0,visible=true;
  host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5});
  host.addEventListener('pointerleave',()=>{px=py=0});
  new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}).observe(host);
  function paint(time){frame=0;if(!visible||document.hidden)return;const t=time*.001;
    rig.rotation.y=.23*Math.sin(t*.6)+px*.55;rig.rotation.z=.045*Math.sin(t*.85)+px*.1;
    rig.rotation.x=py*.12; a.rotation.y=-.23+.19*Math.sin(t*.95); b.rotation.y=.30+.25*Math.sin(t*.81+1);
    renderer.render(scene,camera);host.classList.add('ready');if(!reduced.matches)frame=requestAnimationFrame(paint);
  }
  function resume(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(paint)}
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)resume()}).observe(host);
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);resume()
}
