
  /* ═══════════ EFECTOS ═══════════ */
  function drawFX(f){
    var k=f.age/f.dur; cx.save();
    if(f.t==="ghost"){ drawGhost(f); }
    else if(f.t==="flash"){ cx.globalAlpha=(1-k)*.9; var g=cx.createRadialGradient(f.x,f.y,2,f.x,f.y,f.r); g.addColorStop(0,f.c); g.addColorStop(1,"rgba(255,255,255,0)"); cx.fillStyle=g; cx.beginPath(); cx.arc(f.x,f.y,f.r,0,6.2832); cx.fill(); }
    else if(f.t==="ring"){ cx.globalAlpha=Math.max(0,1-k)*(f.a||1); cx.strokeStyle=f.c; cx.lineWidth=f.w*(1-k*.6);
      var rr=f.r0+(f.r1-f.r0)*(1-Math.pow(1-k,2)); cx.beginPath(); cx.ellipse(f.x,f.y,rr,rr*(f.flat||.62),0,0,6.2832); cx.stroke(); }
    else if(f.t==="spawn"){ cx.globalAlpha=1-k; var c=HOUSE[f.side];
      cx.fillStyle=c.lt; cx.globalAlpha=(1-k)*.35; cx.beginPath(); cx.ellipse(f.x,f.y,50*(1-k*.4),30*(1-k*.4),0,0,6.2832); cx.fill();
      cx.globalAlpha=1-k; cx.strokeStyle=c.lt; cx.lineWidth=4; cx.beginPath(); cx.ellipse(f.x,f.y,20+k*40,12+k*24,0,0,6.2832); cx.stroke();
      cx.fillStyle="rgba(255,250,230,"+(1-k)*.8+")"; cx.fillRect(f.x-2,f.y-240*(1-k),4,240*(1-k)); }
    else if(f.t==="slash"){ cx.globalAlpha=1-k; cx.strokeStyle="#fff7da"; cx.lineWidth=5*(1-k); cx.lineCap="round";
      cx.beginPath(); cx.arc(f.x,f.y-14,18+k*10,f.a-1,f.a+1); cx.stroke(); }
    else if(f.t==="impact"){ cx.globalAlpha=1-k; cx.fillStyle="#fff7da"; cx.translate(f.x,f.y); cx.rotate(f.a);
      cx.beginPath(); for(var i=0;i<8;i++){ var a=i/8*6.2832, rr2=(i%2?10:28)*(0.6+k*.6); cx.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2); } cx.closePath(); cx.fill(); }
    else if(f.t==="purga"){                                    // EMBARGO: el sello cae
      var rr3=f.r*(.2+.95*(1-Math.pow(1-Math.min(1,k*1.6),3)));
      cx.globalAlpha=(1-k)*.45; cx.fillStyle="#1a0d24"; cx.beginPath(); cx.ellipse(f.x,f.y,f.r,f.r*.75,0,0,6.2832); cx.fill();
      cx.globalAlpha=1-k; cx.strokeStyle="#c27aff"; cx.lineWidth=14*(1-k)+2; cx.beginPath(); cx.ellipse(f.x,f.y,rr3,rr3*.75,0,0,6.2832); cx.stroke();
      cx.strokeStyle="#f2d8ff"; cx.lineWidth=4; cx.beginPath(); cx.ellipse(f.x,f.y,rr3*.92,rr3*.69,0,0,6.2832); cx.stroke();
      if(k<.55){ var sk=k/.55, sc=1.9-.9*Math.min(1,sk*2.2); cx.globalAlpha=sk<.6?1:(1-(sk-.6)/.4); cx.translate(f.x,f.y-(1-Math.min(1,sk*2.2))*120);
        cx.scale(sc,sc*.8); cx.beginPath(); for(var j=0;j<14;j++){ var a2=j/14*6.2832, rq=(j%2?52:60); cx.lineTo(Math.cos(a2)*rq,Math.sin(a2)*rq); } cx.closePath();
        cx.fillStyle="#7a2fb8"; cx.fill(); cx.strokeStyle="#2a0d40"; cx.lineWidth=4; cx.stroke();
        cx.beginPath(); cx.arc(0,0,36,0,6.2832); cx.strokeStyle="#c27aff"; cx.stroke();
        cx.fillStyle="#f2d8ff"; cx.font="italic 700 44px Georgia,serif"; cx.textAlign="center"; cx.textBaseline="middle"; cx.fillText("E",0,2); } }
    else if(f.t==="pagare"){                                   // PAGARÉ: onda dorada que converge
      var rin=f.r*1.5*(1-Math.min(1,k*1.4));
      cx.globalAlpha=Math.min(1,k*4)*(1-k); cx.strokeStyle="#ffd877"; cx.lineWidth=10; cx.beginPath(); cx.ellipse(f.x,f.y,rin,rin*.75,0,0,6.2832); cx.stroke();
      cx.lineWidth=3; cx.strokeStyle="#fff4cf"; cx.beginPath(); cx.ellipse(f.x,f.y,rin*1.12,rin*.84,0,0,6.2832); cx.stroke();
      cx.globalAlpha=(1-k)*.2; cx.fillStyle="#ffd877"; cx.beginPath(); cx.ellipse(f.x,f.y,f.r,f.r*.75,0,0,6.2832); cx.fill();
      cx.globalAlpha=1-k; cx.translate(f.x,f.y-40-k*50); cx.rotate(Math.sin(now*6)*.25); cx.fillStyle="#f6ead0"; cx.strokeStyle="#5a4232"; cx.lineWidth=2.5;
      cx.fillRect(-26,-17,52,34); cx.strokeRect(-26,-17,52,34); cx.fillStyle="#5a4232"; cx.fillRect(-18,-8,36,3); cx.fillRect(-18,0,26,3);
      cx.beginPath(); cx.arc(15,10,9,0,6.2832); cx.fillStyle="#c22a3c"; cx.fill(); }
    else if(f.t==="coin"){                                     // 5 símbolo: la moneda que se da vuelta
      var kk=f.age/f.dur, flip=Math.cos(f.age*16), face=flip>0?f.to:f.from, c2=HOUSE[face];
      cx.globalAlpha=kk<.7?1:1-(kk-.7)/.3; cx.translate(f.x,f.y-60-kk*90); var cs=1+(kk>.7?(kk-.7)*1.4:0);
      cx.scale(Math.max(.06,Math.abs(flip))*cs,cs);
      cx.beginPath(); cx.arc(0,0,22,0,6.2832); cx.fillStyle=GOLD; cx.fill(); cx.lineWidth=3; cx.strokeStyle="#5a3a10"; cx.stroke();
      cx.beginPath(); cx.arc(0,0,15,0,6.2832); cx.fillStyle=c2.b; cx.fill(); cx.lineWidth=2; cx.stroke();
      sigil(face,9);
      if(kk>.7){ for(var s=0;s<6;s++){ cx.fillStyle="rgba(255,230,150,"+(1-kk)*2+")"; cx.fillRect(Math.cos(s)*30*(kk-.6)*3,Math.sin(s*2)*30*(kk-.6)*3,4,4); } } }
    else if(f.t==="wake"){ cx.globalAlpha=(1-k); var g3=cx.createRadialGradient(f.x,f.y-80,5,f.x,f.y-80,200); g3.addColorStop(0,"rgba(255,225,140,.85)"); g3.addColorStop(1,"rgba(255,225,140,0)");
      cx.fillStyle=g3; cx.fillRect(f.x-220,f.y-300,440,440); cx.strokeStyle="#ffe08a"; cx.lineWidth=5; cx.beginPath(); cx.ellipse(f.x,f.y,60+k*160,(60+k*160)*.6,0,0,6.2832); cx.stroke(); }
    else if(f.t==="nope"){ cx.globalAlpha=1-k; cx.strokeStyle="#ff6b5b"; cx.lineWidth=6; cx.beginPath(); cx.moveTo(f.x-14,f.y-14); cx.lineTo(f.x+14,f.y+14); cx.moveTo(f.x+14,f.y-14); cx.lineTo(f.x-14,f.y+14); cx.stroke(); }
    cx.restore();
  }
  /* emblemas de casa: Turquesa = ola, Bermeja = sol */
  function sigil(s,r){ cx.fillStyle="#fff8e6"; cx.strokeStyle="#fff8e6"; cx.lineWidth=r*.3;
    if(s==="me"){ cx.beginPath(); cx.moveTo(-r,r*.2); cx.quadraticCurveTo(-r*.5,-r*.9,0,r*.1); cx.quadraticCurveTo(r*.5,r*.9,r,-r*.2); cx.stroke(); }
    else { cx.beginPath(); cx.arc(0,0,r*.45,0,6.2832); cx.fill(); for(var i=0;i<8;i++){ var a=i/8*6.2832; cx.fillRect(Math.cos(a)*r*.8-r*.1,Math.sin(a)*r*.8-r*.1,r*.2,r*.2); } } }

  function drawParticles(dt){
    for(var i=PT.length-1;i>=0;i--){ var p=PT[i]; p.age+=dt; if(p.age>=p.life){ PT.splice(i,1); continue; }
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vz-=p.g*dt; p.z+=p.vz*dt; if(p.z<0){ p.z=0; p.vz*=-.3; p.vx*=.6; p.vy*=.6; }
      if(p.rot!==undefined) p.rot+=p.vr*dt;
      var k=p.age/p.life, yy=p.y-p.z;
      if(p.shape==="dust"){ cx.globalAlpha=1; cx.fillStyle=p.col+((1-k)*.5)+")"; cx.beginPath(); cx.arc(p.x,yy,p.size*(.6+k),0,6.2832); cx.fill(); }
      else if(p.shape==="spark"){ cx.globalAlpha=1-k; cx.strokeStyle=p.col; cx.lineWidth=2.5; cx.beginPath(); cx.moveTo(p.x,yy); cx.lineTo(p.x-p.vx*.03,yy-p.vy*.03); cx.stroke(); }
      else if(p.shape==="shard"){ cx.globalAlpha=k>.6?(1-k)/.4:1; cx.save(); cx.translate(p.x,yy); cx.rotate(p.rot); cx.fillStyle=p.col;
        cx.beginPath(); cx.moveTo(-p.size,-p.size*.4); cx.lineTo(p.size,-p.size*.7); cx.lineTo(p.size*.3,p.size); cx.closePath(); cx.fill(); cx.strokeStyle="#1d1410"; cx.lineWidth=1.5; cx.stroke(); cx.restore(); }
      else if(p.shape==="mote"){ cx.globalAlpha=(1-k); cx.fillStyle=p.col; cx.fillRect(p.x-p.size/2,yy-p.size/2,p.size,p.size); }
      else { cx.globalAlpha=k>.7?(1-k)/.3:1; cx.save(); cx.translate(p.x,yy); cx.rotate(p.rot||0); cx.fillStyle=p.col; cx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.8);
        cx.strokeStyle="rgba(29,20,16,.7)"; cx.lineWidth=1; cx.strokeRect(-p.size/2,-p.size/2,p.size,p.size*.8); cx.restore(); }
    }
    cx.globalAlpha=1;
  }
  /* proyectiles que viajan de verdad */
  function shoot(o){ PR.push(o); }
  function drawProjectiles(dt){
    for(var i=PR.length-1;i>=0;i--){ var p=PR[i]; p.t+=dt; var k=Math.min(1,p.t/p.dur);
      var x=p.x0+(p.x1-p.x0)*k, y=p.y0+(p.y1-p.y0)*k - Math.sin(k*Math.PI)*p.arc;
      if(p.kind==="stone"){
        cx.strokeStyle="rgba(255,250,235,.55)"; cx.lineWidth=2; cx.beginPath(); var kb=Math.max(0,k-.18);
        cx.moveTo(p.x0+(p.x1-p.x0)*kb, p.y0+(p.y1-p.y0)*kb-Math.sin(kb*Math.PI)*p.arc); cx.lineTo(x,y); cx.stroke();
        cx.fillStyle="#efe7d6"; cx.strokeStyle="#1d1410"; cx.lineWidth=1.5; cx.beginPath(); cx.arc(x,y,4.5,0,6.2832); cx.fill(); cx.stroke();
      } else {
        cx.fillStyle="rgba(25,15,10,.25)"; cx.beginPath(); cx.ellipse(p.x0+(p.x1-p.x0)*k,p.y0+(p.y1-p.y0)*k,10,4,0,0,6.2832); cx.fill();
        cx.save(); cx.translate(x,y); cx.rotate(p.t*9); cx.fillStyle="#fbf6ea"; cx.strokeStyle="#1d1410"; cx.lineWidth=2.5;
        cx.fillRect(-10,-8,20,16); cx.strokeRect(-10,-8,20,16); cx.fillStyle=HOUSE[p.side].b; cx.fillRect(-10,-2,20,4); cx.restore();
      }
      if(k>=1){ PR.splice(i,1);
        if(p.kind==="stone"){ SFX.pebble(); sparks(p.x1,p.y1-10,4,"#fff3d0"); FX.push({t:"impact",x:p.x1,y:p.y1-12,a:Math.random(),age:0,dur:.14}); }
        else { SFX.tland(); dust(p.x1,p.y1,6); chips(p.x1,p.y1,6,["#fbf6ea","#d9ccb3"],110); FX.push({t:"impact",x:p.x1,y:p.y1-10,a:Math.random(),age:0,dur:.18}); } }
    }
  }

  /* ═══════════ eventos del motor -> efectos y sonido ═══════════ */
  function attackerOf(e,tgtR){ var S=DES.state(), best=null, bd=1e9;
    for(var i=0;i<S.units.length;i++){ var u=S.units[i]; if(u.side!==e.side||u.hp<=0) continue;
      var d=Math.hypot(u.x-e.x,u.y-e.y)-u.range-u.r-(tgtR||0); if(d<bd){ bd=d; best=u; } }
    return bd<45?best:null; }
  function targetAt(e){ var S=DES.state(), best=null, bd=8;
    S.units.forEach(function(u){ if(u.side===e.side) return; var d=Math.hypot(u.x-e.x,u.y-e.y); if(d<bd){ bd=d; best=u; } }); return best; }
  function pump(){
    var evs=DES.drain(), S=DES.state();
    for(var i=0;i<evs.length;i++){ var e=evs[i]; DBG.events++;
      if(e.t==="hit"){
        var tR=e.tower?(e.side==="me"?48:48):18, a=attackerOf(e,tR);
        if(a){ var va=vsOf(a); va.atk=.28; }
        if(a && a.range>100){ var sx0=a.x, sy0=a.y-a.r*(a.build?1.6:1.1);
          shoot({kind:"stone",x0:sx0,y0:sy0,x1:e.x,y1:e.y-(e.tower?40:12),t:0,dur:Math.max(.12,Math.hypot(e.x-sx0,e.y-sy0)/900),arc:24,side:e.side}); SFX.sling(); }
        else if(e.tower){ SFX.stone(); }
        else { var tg=targetAt(e), metal=tg&&tg.vet;
          metal?SFX.hitMetal():SFX.hitBody();
          var ang=a?Math.atan2(e.y-a.y,e.x-a.x):0;
          FX.push({t:"impact",x:e.x-Math.cos(ang)*10,y:e.y-14,a:Math.random(),age:0,dur:.12});
          FX.push({t:"slash",x:e.x,y:e.y,a:ang+Math.PI,age:0,dur:.16});
          sparks(e.x,e.y-12,metal?7:3,metal?"#fff3c0":"#ffe0c0");
          if(tg){ var vt=vsOf(tg), m=Math.hypot(e.x-(a?a.x:e.x),e.y-(a?a.y:e.y-1))||1; var push=Math.min(9,e.dmg/22);
            vt.kbx+=(e.x-(a?a.x:e.x))/m*push; vt.kby+=(e.y-(a?a.y:e.y-1))/m*push; } }
        if(e.tower){ S.towers.forEach(function(t){ if(Math.hypot(t.x-e.x,t.y-e.y)<2){ var tv=crackSet(t); tv.hit=1;
          chips(t.x+(Math.random()-.5)*t.r,t.y-t.r*.6,6,["#fbf6ea","#d9ccb3",HOUSE[t.side].b],150,40); } }); }
      }
      else if(e.t==="shot"){ SFX.tshot(); var tt=null; S.towers.forEach(function(t){ if(t.x===e.x&&t.y===e.y) tt=t; });
        var oy=tt?(tt.kind==="throne"?tt.r*2.2:tt.r*2):90;
        shoot({kind:"block",x0:e.x,y0:e.y-oy,x1:e.tx,y1:e.ty,t:0,dur:.38,arc:110,side:e.side}); }
      else if(e.t==="spawn"){ FX.push({t:"spawn",x:e.x,y:e.y,side:e.side,age:0,dur:.42}); if(gate("sp",60)) { tn(0,1400,.05,.05,"triangle",2400); } }
      else if(e.t==="destroy"){ var gh=ghostFor(e), turns=gh?gh.turns:0, back=gh?gh.back:(e.side==="me"), rr=gh?gh.r:18;
        var kind=e.why==="spell"?"dissolve":(e.why==="expire"?"sink":"shatter");
        FX.push({t:"ghost",kind:kind,x:e.x,y:e.y,art:e.art,side:e.side,turns:turns,back:back,r:rr,age:0,dur:kind==="sink"?.9:(kind==="dissolve"?.6:.55)});
        if(kind==="dissolve"){ SFX.fizz(); for(var q=0;q<14;q++){ var aa=Math.random()*6.28; part({x:e.x+Math.cos(aa)*rr,y:e.y-rr*.35+Math.sin(aa)*rr,vx:-Math.cos(aa)*30,vy:-60-Math.random()*40,z:0,g:-40,life:.6,size:3,col:"#e6c8ff",shape:"mote"}); } }
        else if(kind==="sink"){ SFX.unscrew(); dust(e.x,e.y+10,8,"rgba(150,115,80,"); }
        else { SFX.die(); dust(e.x,e.y+rr*.5,5); chips(e.x,e.y-rr*.3,6,[HOUSE[e.side].b,HOUSE[e.side].dk,"#d9ccb3"],120); } }
      else if(e.t==="spell"){
        if(e.kind==="purga"){ SFX.purga(); FX.push({t:"purga",x:e.x,y:e.y,r:e.r,age:0,dur:.75}); shake(14); buzz(40);
          FX.push({t:"flash",x:e.x,y:e.y,r:e.r*1.1,c:"rgba(210,150,255,.9)",age:0,dur:.3});
          chips(e.x,e.y,18,["#c27aff","#f2d8ff","#d9ccb3"],260);
          S.units.forEach(function(u){ if(u.side!==e.side&&Math.hypot(u.x-e.x,u.y-e.y)<=e.r+u.r) vsOf(u).flick=.45; }); }
        else { SFX.pagare(); FX.push({t:"pagare",x:e.x,y:e.y,r:e.r,age:0,dur:.9});
          for(var m2=0;m2<22;m2++){ var a3=Math.random()*6.28, R0=e.r*1.3; part({x:e.x+Math.cos(a3)*R0,y:e.y+Math.sin(a3)*R0*.75,vx:-Math.cos(a3)*R0*1.4,vy:-Math.sin(a3)*R0*1.05,z:10,g:0,life:.65,size:4,col:"#ffe39a",shape:"mote"}); } } }
      else if(e.t==="desert"){ desertFX(e); }
      else if(e.t==="recallDone" && e.n>0){ banner(e.side==="me"?"Volvieron "+e.n+" a tu casa":"Le volvieron "+e.n+" al rival","#ffd877","pagaré cobrado"); }
      else if(e.t==="towerFall"){ towerFall(e); }
    }
    // almacén -> balanza: el trono se despierta
    S.towers.forEach(function(t){ var v=crackSet(t);
      if(t.on && !v.wasOn && t.hp>0){ v.wasOn=true; v.wakeT=now; SFX.wake(); FX.push({t:"wake",x:t.x,y:t.y,age:0,dur:1.2}); }
      if(t.on) v.glow=Math.min(1,v.glow+.03); });
  }
  function desertFX(e){
    var u=null, S=DES.state(); for(var i=0;i<S.units.length;i++) if(S.units[i].id===e.id) u=S.units[i];
    var from=e.to==="me"?"foe":"me", good=e.to==="me";
    if(e.recall){ DBG.recalls++; SFX.recall(); } else { DBG.deserts++; DBG.lastDesert=now; SFX.desert(good); }
    if(u){ var v=vsOf(u); v.dz={t0:now,from:from,to:e.to,turns:e.turns||u.turns,x:u.x,y:u.y,recall:!!e.recall}; v.hy=e.to==="me"?-1:1; v.kbx=v.kby=0; }
    var r=u?u.r:24, y=e.y-r*.35;
    if(!e.recall){
      FX.push({t:"impact",x:e.x,y:y-6,a:.3,age:0,dur:.2});                                   // 1 el golpe final marcado
      FX.push({t:"ring",x:e.x,y:e.y,r0:r*.9,r1:r*4.2,c:HOUSE[from].b,w:10,age:0,dur:.7});      // 3 onda del color viejo hacia afuera
      FX.push({t:"ring",x:e.x,y:e.y,r0:r*4.5,r1:r*1.0,c:HOUSE[e.to].lt,w:8,age:-.12,dur:.62}); //   y del nuevo hacia adentro
      FX.push({t:"coin",x:e.x,y:y,from:from,to:e.to,age:-.3,dur:1.15});                        // 5 símbolo
      shake(good?9:11); buzz(good?[25,40,70]:[60,40,90]);                                        // 7
      banner(good?"¡Desertó para vos!":"¡Te desertó una tropa!", good?HOUSE.me.lt:HOUSE.foe.lt, (nm(DES.state().units.filter(function(x){return x.id===e.id;})[0]?DES.state().units.filter(function(x){return x.id===e.id;})[0].key:"") + (e.turns>=2?" · última vez":" · cambió de patrón"))); // 8
    } else {
      FX.push({t:"ring",x:e.x,y:e.y,r0:r*5,r1:r*.8,c:"#ffd877",w:9,age:0,dur:.5});
      FX.push({t:"flash",x:e.x,y:y,r:r*2.4,c:"rgba(255,230,150,.95)",age:-.12,dur:.35});
      shake(4); buzz(20);
    }
  }
  function towerFall(e){ DBG.falls++; SFX.fall(); shake(26); buzz([80,40,160]);
    var t=null; DES.state().towers.forEach(function(x){ if(x.x===e.x&&x.y===e.y) t=x; });
    var r=t?t.r:50, v=t?crackSet(t):null; if(v) v.fallT=now;
    var cols=["#fbf6ea","#e8decb","#d9ccb3",HOUSE[e.side].b,HOUSE[e.side].dk];
    for(var i=0;i<26;i++){ var a=Math.random()*6.28, s=60+Math.random()*260;
      part({x:e.x+(Math.random()-.5)*r,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5,z:r*(.4+Math.random()*1.8),vz:100+Math.random()*320,life:1+Math.random()*.6,size:8+Math.random()*14,col:cols[i%cols.length],shape:"r",rot:a,vr:(Math.random()-.5)*10}); }
    dust(e.x,e.y,22,null,180); dust(e.x,e.y-r,10,"rgba(200,185,160,",80);
    FX.push({t:"flash",x:e.x,y:e.y-r,r:r*3.4,c:"rgba(255,240,200,.95)",age:0,dur:.35});
    FX.push({t:"ring",x:e.x,y:e.y+r*.3,r0:r,r1:r*6,c:"#fff4d8",w:14,flat:.5,age:0,dur:.8});
    FX.push({t:"ring",x:e.x,y:e.y+r*.3,r0:r,r1:r*4,c:"rgba(120,90,60,1)",w:22,flat:.5,a:.5,age:-.05,dur:.9});
    if(e.kind==="guard" && e.side==="foe"){ openLane[e.x<500?0:1]=now; }
    banner(e.side==="me"?"Perdiste un almacén":"¡Almacén tomado!", e.side==="me"?HOUSE.foe.lt:HOUSE.me.lt, e.kind==="throne"?"cayó la balanza":"se abre el paso");
  }
  var bnT=0;
  function banner(txt,col,sub){ var b=$("banner"); b.innerHTML=""; var s=document.createElement("span"); s.textContent=txt; b.appendChild(s);
    if(sub){ var sm=document.createElement("small"); sm.textContent=sub; b.appendChild(sm); }
    b.style.color=col; b.classList.remove("show"); void b.offsetWidth; b.classList.add("show"); bnT=1.7; }
