
  /* ═══════════ estado visual (sólo del arte; el motor no se entera) ═══════════ */
  var VS={}, FX=[], PT=[], PR=[], TV={}, shakeA=0, flashA=0, flashC="#fff";
  var openLane=[-1,-1], wasDbl=false, lastTick=0, lateOn=false, seenUnits={};
  var DBG={deserts:0,recalls:0,falls:0,events:0,lastDesert:-9};

  function vsOf(u){ var v=VS[u.id];
    if(!v){ v=VS[u.id]={px:u.x,py:u.y,hy:u.side==="me"?-1:1,ph:Math.random()*6,atk:0,seed:Math.random()*9,spawnT:now,landed:false,
      kbx:0,kby:0,flick:0,dz:null,lastSide:u.side}; }
    return v; }
  function shake(a){ shakeA=Math.max(shakeA,a); }
  function part(o){ if(PT.length>520) PT.shift(); o.age=0; o.z=o.z||0; o.vz=o.vz||0; o.g=o.g===undefined?900:o.g; PT.push(o); return o; }
  function dust(x,y,n,col,sp){ for(var i=0;i<n;i++){ var a=Math.random()*6.28, s=(sp||60)*(.4+Math.random());
    part({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,z:2,vz:20+Math.random()*40,g:30,life:.5+Math.random()*.5,size:10+Math.random()*14,col:col||"rgba(235,225,205,",shape:"dust"}); } }
  function chips(x,y,n,cols,sp,up){ for(var i=0;i<n;i++){ var a=Math.random()*6.28, s=(sp||120)*(.3+Math.random());
    part({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,z:up||10,vz:150+Math.random()*250,life:.6+Math.random()*.6,size:3+Math.random()*5,
      col:cols[i%cols.length],shape:"r",rot:Math.random()*6,vr:(Math.random()-.5)*14}); } }
  function sparks(x,y,n,col){ for(var i=0;i<n;i++){ var a=Math.random()*6.28, s=160+Math.random()*260;
    part({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,z:16,vz:60,g:200,life:.14+Math.random()*.16,size:2,col:col||"#fff3c0",shape:"spark"}); } }

  /* ═══════════ ALMACENES Y BALANZA ═══════════ */
  function crackSet(t){ if(!TV[t.id]) TV[t.id]={hit:0,cracks:null,wasOn:t.on,fallT:-1,glow:t.on?1:0};
    var v=TV[t.id]; if(!v.cracks){ var R=rng(t.id.charCodeAt(0)*31+t.id.charCodeAt(1)); v.cracks=[];
      for(var i=0;i<9;i++){ var x=(R()-.5)*1.4, y=-1.6+R()*1.6, pts=[[x,y]]; for(var j=0;j<4;j++){ x+=(R()-.5)*.5; y+=R()*.35; pts.push([x,y]); } v.cracks.push(pts); } }
    return v; }
  function drawTower(t){
    var v=crackSet(t), mine=t.side==="me", H0=HOUSE[t.side], dead=t.hp<=0, r=t.r;
    if(dead){ drawRubble(t,v); return; }
    var j=v.hit>0?(Math.random()-.5)*v.hit*10:0;
    cx.save(); cx.translate(t.x+j,t.y);
    cx.strokeStyle=OUT; cx.lineWidth=3;
    cx.fillStyle="rgba(20,12,8,.35)"; cx.beginPath(); cx.ellipse(8,r*.62,r*1.3,r*.48,0,0,6.2832); cx.fill();
    // plataforma de piedra
    cx.beginPath(); cx.ellipse(0,r*.45,r*1.15,r*.45,0,0,6.2832); cx.fillStyle="#8d7a62"; cx.fill(); cx.stroke();
    cx.beginPath(); cx.ellipse(0,r*.32,r*1.1,r*.4,0,0,6.2832); cx.fillStyle="#b9a68a"; cx.fill(); cx.stroke();
    var asleep = t.kind==="throne" && v.glow<.99;
    if(t.kind==="guard"){
      // silo de bloques de sal
      var g=cx.createLinearGradient(-r*.8,0,r*.8,0); g.addColorStop(0,"#d9ccb3"); g.addColorStop(.4,"#fbf6ea"); g.addColorStop(1,"#bfae92");
      cx.beginPath(); cx.moveTo(-r*.8,r*.3); cx.lineTo(-r*.8,-r*1.1); cx.ellipse(0,-r*1.1,r*.8,r*.3,0,Math.PI,0,false); cx.lineTo(r*.8,r*.3);
      cx.ellipse(0,r*.3,r*.8,r*.3,0,0,Math.PI,false); cx.closePath(); cx.fillStyle=g; cx.fill(); cx.stroke();
      cx.strokeStyle="rgba(110,90,70,.45)"; cx.lineWidth=1.5;
      for(var yy=-r*.85;yy<r*.3;yy+=r*.28){ cx.beginPath(); cx.ellipse(0,yy,r*.8,r*.3,0,.15,Math.PI-.15,false); cx.stroke(); }
      cx.strokeStyle=OUT; cx.lineWidth=3;
      // faja de la casa y puerta
      cx.beginPath(); cx.ellipse(0,-r*.35,r*.81,r*.3,0,0,Math.PI,false); cx.lineTo(-r*.81,-r*.55); cx.ellipse(0,-r*.55,r*.81,r*.3,0,Math.PI,0,true); cx.closePath(); cx.fillStyle=H0.b; cx.fill(); cx.stroke();
      RR(-r*.2,-r*.05,r*.4,r*.55,r*.18,"#4a2f1a");
      // techo cónico con moneda
      cx.beginPath(); cx.moveTo(-r*.98,-r*1.08); cx.quadraticCurveTo(0,-r*2.35,r*.98,-r*1.08); cx.ellipse(0,-r*1.08,r*.98,r*.32,0,0,Math.PI,false); cx.closePath();
      var rg=cx.createLinearGradient(-r,0,r,0); rg.addColorStop(0,H0.dk); rg.addColorStop(.45,H0.b); rg.addColorStop(1,H0.dk);
      cx.fillStyle=rg; cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(-r*.3,-r*1.5); cx.quadraticCurveTo(-r*.1,-r*1.9,0,-r*1.95); cx.strokeStyle="rgba(255,255,255,.35)"; cx.lineWidth=4; cx.stroke(); cx.strokeStyle=OUT; cx.lineWidth=3;
      var spin=Math.cos(now*2.4+t.x);
      cx.beginPath(); cx.ellipse(0,-r*2.12,r*.24*Math.abs(spin)+1,r*.24,0,0,6.2832); cx.fillStyle=GOLD; cx.fill(); cx.stroke();
    } else {
      // LA BALANZA: casa de pesar con el fiel arriba
      var g2=cx.createLinearGradient(-r,0,r,0); g2.addColorStop(0,"#cdbfa6"); g2.addColorStop(.45,"#f6efe0"); g2.addColorStop(1,"#b7a587");
      RR(-r*.95,-r*.95,r*1.9,r*1.3,r*.12,g2);
      cx.fillStyle=H0.b; cx.fillRect(-r*.93,-r*.62,r*1.86,r*.2); cx.strokeRect(-r*.93,-r*.62,r*1.86,r*.2);
      RR(-r*.26,-r*.22,r*.52,r*.56,r*.2,"#4a2f1a");
      cx.beginPath(); cx.moveTo(-r*1.08,-r*.92); cx.lineTo(0,-r*1.42); cx.lineTo(r*1.08,-r*.92); cx.closePath(); cx.fillStyle=H0.dk; cx.fill(); cx.stroke();
      var sw=asleep?0:Math.sin(now*1.6)*.16;
      LN(0,-r*1.4,0,-r*2.2,"#6b4a2c",6);
      cx.save(); cx.translate(0,-r*2.2); cx.rotate(sw);
      LN(-r*1.05,0,r*1.05,0,asleep?"#6d655c":GOLD,7);
      [-1,1].forEach(function(s){ cx.save(); cx.translate(s*r*1.0,0); cx.rotate(-sw);
        LN(-r*.18,r*.5,0,0,"#5a4a3a",2); LN(r*.18,r*.5,0,0,"#5a4a3a",2); cx.lineWidth=3;
        cx.beginPath(); cx.ellipse(0,r*.52,r*.3,r*.1,0,0,6.2832); cx.fillStyle=asleep?"#7d746a":GOLD; cx.fill(); cx.stroke();
        if(!asleep){ cx.fillStyle="#fffbe8"; cx.fillRect(-r*.14,r*.36,r*.12,r*.12); cx.fillRect(r*.02,r*.38,r*.1,r*.1); }
        cx.restore(); });
      cx.restore();
      cx.beginPath(); cx.arc(0,-r*2.24,r*.13,0,6.2832); cx.fillStyle=asleep?"#6d655c":GOLD; cx.fill(); cx.stroke();
      if(v.glow>0){ var gl=cx.createRadialGradient(0,-r*1.6,4,0,-r*1.6,r*1.8);
        gl.addColorStop(0,"rgba(255,220,130,"+(.38*v.glow*(.75+.25*Math.sin(now*4)))+")"); gl.addColorStop(1,"rgba(255,220,130,0)");
        cx.fillStyle=gl; cx.fillRect(-r*2,-r*3.4,r*4,r*3.6); }
    }
    // grietas que se acumulan con el daño
    var nC=Math.floor((1-t.hp/t.max)*v.cracks.length+.001);
    cx.strokeStyle="rgba(50,30,20,.85)"; cx.lineWidth=2;
    for(var c=0;c<nC;c++){ cx.beginPath(); v.cracks[c].forEach(function(p,i){ var px=p[0]*r*.75, py=p[1]*r*.62; i?cx.lineTo(px,py):cx.moveTo(px,py); }); cx.stroke(); }
    if(asleep){       cx.fillStyle="rgba(240,230,210,.8)"; cx.font="italic 700 18px Georgia,serif"; cx.textAlign="center"; cx.fillText("z",r*.6,-r*1.6-Math.sin(now*2)*4); }
    if(v.hit>0){ cx.globalAlpha=v.hit*.5; cx.fillStyle="#fff"; cx.beginPath(); cx.ellipse(0,-r*.6,r,r*1.4,0,0,6.2832); cx.fill(); cx.globalAlpha=1; }
    // vida
    var bw=r*2.1, by=r*.95;
    RR(-bw/2,by,bw,13,4,"#1b120c"); cx.fillStyle=mine?HOUSE.me.b:HOUSE.foe.b;
    cx.fillRect(-bw/2+2,by+2,(bw-4)*Math.max(0,t.hp/t.max),9);
    cx.fillStyle="rgba(255,255,255,.3)"; cx.fillRect(-bw/2+2,by+2,(bw-4)*Math.max(0,t.hp/t.max),3);
    cx.font="700 17px Georgia,serif"; cx.textAlign="center"; cx.lineWidth=4; cx.strokeStyle="#1b120c"; cx.strokeText(Math.ceil(t.hp),0,by+30);
    cx.fillStyle="#fff8e8"; cx.fillText(Math.ceil(t.hp),0,by+30);
    cx.restore();
  }
  function drawRubble(t,v){ var r=t.r, k=v.fallT<0?1:Math.min(1,(now-v.fallT)/1.1); if(k<.55) return;
    cx.save(); cx.translate(t.x,t.y); cx.globalAlpha=Math.min(1,(k-.55)/.3); cx.strokeStyle=OUT; cx.lineWidth=2;
    cx.fillStyle="rgba(20,12,8,.3)"; cx.beginPath(); cx.ellipse(6,r*.5,r*1.3,r*.45,0,0,6.2832); cx.fill();
    var R=rng(t.x*7+t.y); for(var i=0;i<11;i++){ var x=(R()-.5)*r*1.8, y=(R()-.5)*r*.8, s=8+R()*16;
      cx.fillStyle=i%3?"#e8decb":"#b9a68a"; cx.beginPath(); cx.moveTo(x-s,y); cx.lineTo(x-s*.3,y-s*.8); cx.lineTo(x+s,y-s*.2); cx.lineTo(x+s*.6,y+s*.4); cx.closePath(); cx.fill(); cx.stroke(); }
    LN(r*.3,0,r*.7,-r*1.1,"#4a2f1a",4);
    cx.beginPath(); cx.moveTo(r*.7,-r*1.1); cx.lineTo(r*1.2,-r*.95); cx.lineTo(r*.95,-r*.8); cx.lineTo(r*1.15,-r*.62); cx.lineTo(r*.62,-r*.68); cx.closePath();
    cx.fillStyle=mix(HOUSE[t.side].b,"#555",.45); cx.fill(); cx.stroke();
    cx.restore(); }

  /* ═══════════ TROPAS ═══════════ */
  var WITHER=[1,.86,.74];
  function drawUnit(u){
    var v=vsOf(u), P=PAL[u.side][Math.min(2,u.turns)], r=u.r*WITHER[Math.min(2,u.turns)];
    var x=u.x+v.kbx, y=u.y+v.kby, back=v.hy<0, sx=1, sy=1, z=0, alpha=1, pal=P, crack=0;
    if(u.build) back=false;
    // caída desde arriba al desplegar
    var sp=(now-v.spawnT)/.32;
    if(sp<1){ z=(1-sp)*(1-sp)*260; sy=1+(1-sp)*.15; sx=1-(1-sp)*.1; alpha=Math.min(1,sp*3); }
    else if(!v.landed){ v.landed=true; dust(u.x,u.y+u.r*.5,u.build?10:7,u.build?"rgba(150,115,80,":null,u.build?90:60);
      if(u.build){ chips(u.x,u.y+u.r*.5,10,["#7a5236","#a07a52","#e8decb"],140); SFX.stake(); } else SFX.land(); shake(u.r>30?6:2); }
    else if(sp<1.6){ var q=(sp-1)/.6; sy=1-Math.sin(q*Math.PI)*.16; sx=1+Math.sin(q*Math.PI)*.1; }
    // deserción: la secuencia de ocho pasos
    var d=v.dz, e=d?now-d.t0:9;
    if(d && e<1.5){
      if(!d.recall){
        if(e<.2){ x=d.x; y=d.y; }                                         // 1 congelado
        else if(e<.32){ var kk=(e-.2)/.12; x=d.x+(x-d.x)*kk; y=d.y+(y-d.y)*kk; }
        if(e<.34){ pal=PAL[d.from][Math.max(0,(d.turns||1)-1)]; crack=Math.min(1,Math.max(0,(e-.1)/.22)); } // 2 fractura
        if(e>=.34 && !d.shed){ d.shed=true; shedShell(d, x, y-r*.35, r, back); }
      } else if(e<.14){ pal=PAL[d.from][Math.min(2,u.turns)]; }
      if(e>.3&&e<.85){ var p=(e-.3)/.55, seg=Math.floor(p*3+.5);         // 4 giro: vuelta y media
        sx*=Math.max(.08,Math.abs(Math.cos(p*Math.PI*3))); back = (seg%2===0) ? !back : back; }
      if(!d.recall && e>.6&&e<1){ var wq=(e-.6)/.4; var s0=1/(WITHER[Math.min(2,u.turns)]/WITHER[Math.max(0,u.turns-1)]); var s=s0+(1-s0)*(1-Math.pow(1-wq,3)); sx*=s; sy*=s; } // 6 marchita
      else if(!d.recall && e<=.6){ var s1=WITHER[Math.max(0,u.turns-1)]/WITHER[Math.min(2,u.turns)]; sx*=s1; sy*=s1; }
    }
    var walk=v.ph, cy=y-r*.35-z;
    // sombra
    cx.fillStyle="rgba(25,15,10,"+(.32*Math.max(.25,1-z/260))+")";
    cx.beginPath(); cx.ellipse(x,y+r*.55,r*(.95-z/600),r*.36,0,0,6.2832); cx.fill();
    if(u.vet){ cx.strokeStyle="rgba(232,181,74,.75)"; cx.lineWidth=2.5; cx.setLineDash([6,5]); cx.beginPath(); cx.ellipse(x,y+r*.55,r*1.15,r*.44,0,0,6.2832); cx.stroke(); cx.setLineDash([]); }
    cx.globalAlpha=alpha;
    figure(u.art,pal,x,cy,r,{back:back,ph:walk,atk:v.atk>0?Math.sin((1-v.atk/.28)*Math.PI):0,seed:v.seed,turns:u.turns,sx:sx,sy:sy});
    // grietas de la cáscara del color viejo
    if(crack>0){ cx.save(); cx.translate(x,cy); cx.strokeStyle="#fffbe8"; cx.lineWidth=2.4; cx.beginPath();
      var R=rng(u.id*13+1); for(var i=0;i<6;i++){ var a=R()*6.28, l=r*1.1*crack; cx.moveTo(0,0);
        cx.lineTo(Math.cos(a)*l*.5+(R()-.5)*6,Math.sin(a)*l*.5); cx.lineTo(Math.cos(a)*l,Math.sin(a)*l); } cx.stroke(); cx.restore(); }
    if(d && e<.16 && !d.recall){ cx.globalAlpha=1-e/.16; cx.fillStyle="#fff"; cx.beginPath(); cx.ellipse(x,cy,r*1.05,r*1.15,0,0,6.2832); cx.fill(); }
    if(d && d.recall && e<.5){ cx.globalAlpha=(1-e/.5)*.8; var gg=cx.createRadialGradient(x,cy,2,x,cy,r*1.8); gg.addColorStop(0,"rgba(255,230,150,1)"); gg.addColorStop(1,"rgba(255,230,150,0)"); cx.fillStyle=gg; cx.fillRect(x-r*2,cy-r*2,r*4,r*4); }
    if(v.flick>0 && Math.floor(now*30)%2===0){ cx.globalAlpha=.65; cx.fillStyle="#f2c8ff"; cx.beginPath(); cx.ellipse(x,cy,r,r*1.1,0,0,6.2832); cx.fill(); }
    cx.globalAlpha=1;
    // vida
    if(u.hp<u.max || u.build){ var bw=Math.max(26,r*1.9), by=cy-r*(u.vet?2.2:1.45);
      cx.fillStyle="#1b120c"; cx.fillRect(x-bw/2-1,by-1,bw+2,7);
      cx.fillStyle=HOUSE[u.side].lt; cx.fillRect(x-bw/2,by,bw*Math.max(0,u.hp/u.max),5);
      if(u.build && u.life>0){ cx.fillStyle="#e8b54a"; cx.fillRect(x-bw/2,by+6,bw*(u.life/30),2.5); } }
  }
  /* paso 2: la cáscara del color viejo se desprende en esquirlas */
  function shedShell(d,x,y,r,back){
    var old=HOUSE[d.from];
    for(var i=0;i<16;i++){ var a=i/16*6.28+Math.random()*.3, s=120+Math.random()*170;
      part({x:x+Math.cos(a)*r*.6,y:y+Math.sin(a)*r*.6,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,z:r*.8,vz:180+Math.random()*200,
        life:.75+Math.random()*.3,size:5+Math.random()*7,col:i%3?old.b:old.lt,shape:"shard",rot:a,vr:(Math.random()-.5)*16}); } }

  /* ═══════════ fantasmas de muerte (las tropas ya salieron del estado) ═══════════ */
  function ghostFor(e){ var best=null,bd=1e9;
    for(var id in seenUnits){ var g=seenUnits[id]; if(g.art!==e.art) continue; var dd=Math.hypot(g.x-e.x,g.y-e.y); if(dd<bd){ bd=dd; best=g; } }
    return best; }
  function drawGhost(f){ var k=f.age/f.dur, r=f.r, y=f.y-r*.35, P=PAL[f.side][Math.min(2,f.turns||0)];
    if(f.kind==="shatter"){                                    // se desarma en pedazos
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ cx.save();
        var ox=q[0]*k*r*1.2, oy=q[1]*k*r*.6 + k*k*r*2.2;
        cx.globalAlpha=Math.max(0,1-k*1.1); cx.translate(ox,oy); cx.beginPath();
        cx.rect(f.x+(q[0]<0?-r*2.2:0),y+(q[1]<0?-r*2.4:0),r*2.2,r*2.4); cx.clip();
        cx.translate(f.x,y); cx.rotate(q[0]*k*.8); cx.translate(-f.x,-y);
        figure(f.art,P,f.x,y,r,{back:f.back,ph:0,atk:0,seed:0,turns:f.turns||0}); cx.restore(); });
    } else if(f.kind==="dissolve"){                            // se desintegra desde los bordes
      var rr=r*1.9*(1-k); if(rr<1) return; cx.save(); cx.beginPath(); cx.arc(f.x,y,rr,0,6.2832); cx.clip();
      figure(f.art,P,f.x,y,r,{back:f.back,ph:0,atk:0,seed:0,turns:f.turns||0});
      cx.globalAlpha=k*.8; cx.fillStyle="#d9b0ff"; cx.fillRect(f.x-r*2,y-r*2,r*4,r*4); cx.restore();
      cx.strokeStyle="rgba(240,210,255,"+(1-k)+")"; cx.lineWidth=3; cx.beginPath(); cx.arc(f.x,y,rr,0,6.2832); cx.stroke();
    } else if(f.kind==="sink"){                                // la garita se hunde
      cx.save(); cx.beginPath(); cx.rect(f.x-r*2,y-r*3,r*4,r*3+r*.9); cx.clip();
      figure(f.art,P,f.x,y+k*r*2.6,r,{back:false,ph:0,atk:0,seed:0,turns:0}); cx.restore();
    }
  }
