
  /* ═══════════ zona de despliegue: tu mitad se ilumina; al tomar un almacén se extiende ═══════════ */
  function drawZone(){
    var showSel = sel && !DES.CARDS[sel].spell, pulse=.5+.5*Math.sin(now*5);
    var col="rgba(143,240,216,";
    if(showSel){ cx.fillStyle=col+(.10+pulse*.05)+")"; cx.fillRect(0,RB+30,W,H-RB-30);
      cx.strokeStyle=col+".8)"; cx.lineWidth=4; cx.setLineDash([18,10]); cx.lineDashOffset=-now*40;
      cx.beginPath(); cx.moveTo(0,RB+30); cx.lineTo(W,RB+30); cx.stroke(); cx.setLineDash([]); }
    for(var L=0;L<2;L++){ if(openLane[L]<0) continue;
      var age=now-openLane[L], p=Math.min(1,age/1.1), ease=1-Math.pow(1-p,3);
      if(!showSel && age>2.4) continue;
      var c0=L===0?0:500, ytop=RB+30-(RB+30-240)*ease;
      var a=showSel?(.10+pulse*.05):Math.max(0,.22*(1-(age-1.1)/1.3));
      cx.fillStyle=col+a+")"; cx.fillRect(c0,ytop,500,RB+30-ytop);
      cx.strokeStyle=col+(showSel?.8:Math.max(0,1-(age-1.1)/1.3))+")"; cx.lineWidth=5;
      cx.beginPath(); cx.moveTo(c0,ytop); cx.lineTo(c0+500,ytop); cx.stroke();
      if(p<1){ for(var i=0;i<6;i++) part({x:c0+Math.random()*500,y:ytop,vx:0,vy:-20,z:0,g:-30,life:.5,size:4,col:"#c9fff0",shape:"mote"}); }
    }
  }
  function drawLate(){ var S=DES.state(), left=DES.MATCH-S.t; if(left>30||S.over) return;
    var p=.5+.5*Math.sin(now*Math.PI*(left<10?4:2)); cx.lineWidth=18; cx.strokeStyle="rgba(255,120,90,"+(.12+p*.3)+")"; cx.strokeRect(9,9,W-18,H-18); }

  /* ═══════════ cartas ═══════════ */
  var CARDCACHE={};
  function cardArt(key,size){
    var c=document.createElement("canvas"), d=2; c.width=c.height=size*d;
    var g=c.getContext("2d"); g.scale(d,d);
    var C=DES.CARDS[key];
    var bg=g.createRadialGradient(size*.5,size*.4,2,size*.5,size*.5,size*.75);
    if(C.spell==="damage"){ bg.addColorStop(0,"#5b2a7a"); bg.addColorStop(1,"#1e0c2a"); }
    else if(C.spell){ bg.addColorStop(0,"#7a5a20"); bg.addColorStop(1,"#2a1d08"); }
    else if(C.vet){ bg.addColorStop(0,"#f4dc98"); bg.addColorStop(1,"#8a6420"); }
    else { bg.addColorStop(0,"#cfe9e2"); bg.addColorStop(1,"#3d6a63"); }
    g.fillStyle=bg; g.fillRect(0,0,size,size);
    var save=cx; cx=g;
    if(C.spell==="damage"){ cx.save(); cx.translate(size/2,size/2); var s=size/130; cx.scale(s,s);
      cx.beginPath(); for(var j=0;j<14;j++){ var a=j/14*6.2832, rq=(j%2?44:50); cx.lineTo(Math.cos(a)*rq,Math.sin(a)*rq); } cx.closePath();
      cx.fillStyle="#9a45d8"; cx.fill(); cx.strokeStyle="#2a0d40"; cx.lineWidth=5; cx.stroke();
      cx.beginPath(); cx.arc(0,0,30,0,6.2832); cx.strokeStyle="#e0b0ff"; cx.lineWidth=3; cx.stroke();
      cx.fillStyle="#f6e4ff"; cx.font="italic 700 40px Georgia,serif"; cx.textAlign="center"; cx.textBaseline="middle"; cx.fillText("E",0,2); cx.restore(); }
    else if(C.spell){ cx.save(); cx.translate(size/2,size/2); var s2=size/120; cx.scale(s2,s2); cx.rotate(-.15);
      cx.fillStyle="#f6ead0"; cx.strokeStyle="#3a2a1c"; cx.lineWidth=3; cx.fillRect(-38,-26,76,52); cx.strokeRect(-38,-26,76,52);
      cx.fillStyle="#3a2a1c"; cx.fillRect(-28,-14,56,4); cx.fillRect(-28,-4,44,4); cx.fillRect(-28,6,30,4);
      cx.beginPath(); cx.arc(24,16,13,0,6.2832); cx.fillStyle="#c22a3c"; cx.fill(); cx.stroke();
      cx.fillStyle=GOLD; cx.beginPath(); cx.moveTo(24,8); cx.lineTo(30,22); cx.lineTo(18,22); cx.closePath(); cx.fill(); cx.restore(); }
    else { var r=size*(key==="coloso"?.25:key==="mina"?.27:.3), y=size*(C.vet?.62:.56);
      var om=now; now=1.2;
      if(C.n>1){ var off=size*.17; figure(C.art,PAL.me[0],size/2-off,y+2,r*.8,{back:false,ph:0,atk:0,seed:1,turns:0});
        figure(C.art,PAL.me[0],size/2+off,y+4,r*.8,{back:false,ph:2,atk:0,seed:3,turns:0}); }
      else figure(C.art,PAL.me[0],size/2,y,r,{back:false,ph:0,atk:0,seed:1,turns:0});
      now=om;
      if(C.n>1){ g.fillStyle="#fff8e6"; g.strokeStyle="#1d1410"; g.lineWidth=3; g.font="700 "+(size*.22)+"px Georgia,serif"; g.textAlign="right"; g.strokeText("×"+C.n,size-2,size-3); g.fillText("×"+C.n,size-2,size-3); } }
    cx=save;
    return c;
  }

  /* ═══════════ HUD ═══════════ */
  function hud(){
    var S=DES.state(), left=Math.max(0,DES.MATCH-S.t);
    var clk=$("clk"); clk.textContent=Math.floor(left/60)+":"+String(Math.floor(left%60)).padStart(2,"0");
    var late=left<=30&&!S.over; if(late!==lateOn){ lateOn=late; clk.classList.toggle("late",late); }
    var dbl=DES.doubleElixir(); $("x2").hidden=!dbl;
    if(dbl&&!wasDbl){ wasDbl=true; SFX.dbl(); var eb=$("elixbar"); eb.classList.remove("pulse"); void eb.offsetWidth; eb.classList.add("pulse"); $("x2").classList.add("pulse");
      banner("¡Sal doble!","#ffd877","último minuto"); }
    $("elixbar").classList.toggle("dbl",dbl);
    $("crM").textContent=DES.crowns("me"); $("crF").textContent=DES.crowns("foe");
    var e=S.elix.me, full=Math.floor(e), frac=e-full, bar=$("elixbar");
    if(bar.children.length!==DES.MAXE){ bar.innerHTML=""; for(var i=0;i<DES.MAXE;i++) bar.appendChild(document.createElement("i")); }
    for(var j=0;j<DES.MAXE;j++){ var el=bar.children[j], cn=j<full?"on":(j===full&&frac>.02?"part":"");
      if(el.className!==cn) el.className=cn; if(j===full) el.style.setProperty("--p",(frac*100).toFixed(0)+"%"); }
    $("elixn").textContent=full;
    var adv=Math.round(((S.spent.foe-S.spent.me)+(S.elix.me-S.elix.foe))*10)/10; if(Object.is(adv,-0)) adv=0;
    $("advN").textContent=(adv>0?"+":"")+adv.toFixed(1);
    var bi=$("advI"); bi.className=adv<0?"neg":""; bi.style.transform="scaleX("+Math.min(1,Math.abs(adv)/8)+")";
    $("desN").textContent=S.deserts.me+"–"+S.deserts.foe;

    var h=$("hand"), sig=S.hand.me.join(",")+"|"+sel+"|"+full;
    if(h.dataset.sig!==sig){ h.dataset.sig=sig; h.innerHTML="";
      S.hand.me.forEach(function(key){ var C=DES.CARDS[key], aff=C.cost<=S.elix.me;
        var b=document.createElement("button"); b.type="button"; b.className="card"+(sel===key?" sel":"")+(aff?"":" off")+(C.vet?" vet":"");
        var cst=document.createElement("span"); cst.className="cst"; cst.textContent=C.cost; b.appendChild(cst);
        b.appendChild(CARDCACHE[key]?cloneCv(CARDCACHE[key]):(CARDCACHE[key]=cardArt(key,56)));
        var n=document.createElement("span"); n.className="nm2"; n.textContent=nm(key); b.appendChild(n);
        if(C.vet){ var vt=document.createElement("span"); vt.className="vtag"; vt.textContent="✦"; b.appendChild(vt); }
        if(!aff){ var f=document.createElement("span"); f.className="fill"; f.style.height=Math.round((1-S.elix.me/C.cost)*100)+"%"; b.appendChild(f); }
        b.addEventListener("click",function(){ if(!aff) return; audioInit(); SFX.tap();
          sel = sel===key ? null : key; h.dataset.sig="";
          if(sel) toast(nm(key)+" · "+C.cost+" de sal", HINT[key]); });
        h.appendChild(b); }); }
    var nx=S.queue.me[S.queue.me.length-1], nw=$("nextWrap");
    if(nw.dataset.k!==nx){ nw.dataset.k=nx; nw.innerHTML=""; if(nx) nw.appendChild(cardArt(nx,24)); }
    var fc=$("foeCards"), fsig=S.hand.foe.join(",")+"|"+S.queue.foe[S.queue.foe.length-1];
    if(fc.dataset.sig!==fsig){ fc.dataset.sig=fsig; fc.innerHTML="";
      function chip(k,next){ var C=DES.CARDS[k], d=document.createElement("span"); d.className="fc"+(C.vet?" v":"")+(next?" nx":"");
        var em=document.createElement("em"); em.textContent=C.cost; d.appendChild(em); d.appendChild(document.createTextNode(nm(k))); fc.appendChild(d); }
      S.hand.foe.forEach(function(k){ chip(k,false); }); var n2=S.queue.foe[S.queue.foe.length-1]; if(n2) chip(n2,true); }
  }
  function cloneCv(src){ var c=document.createElement("canvas"); c.width=src.width; c.height=src.height; c.getContext("2d").drawImage(src,0,0); return c; }
  var tT=0;
  function toast(a,b){ var t=$("toast"); t.innerHTML=""; var bb=document.createElement("b"); bb.textContent=a; t.appendChild(bb);
    if(b){ t.appendChild(document.createElement("br")); t.appendChild(document.createTextNode(b)); } t.hidden=false; tT=2.6; }

  /* ═══════════ entrada ═══════════ */
  function at(ev){
    audioInit();
    var S=DES.state(); if(S.over||paused) return;
    var p=ev.touches?ev.touches[0]:ev, r=cv.getBoundingClientRect();
    var x=(p.clientX-r.left)/SC, y=(p.clientY-r.top)/SC;
    if(x<0||y<0||x>W||y>H||!sel) return;
    var C=DES.CARDS[sel];
    if(!C.spell && !DES.canDeploy("me",x,y)){ toast("Ahí no","Sólo en tu lado de la quebrada."); FX.push({t:"nope",x:x,y:y,age:0,dur:.4}); return; }
    if(DES.deploy("me",sel,x,y)){ sel=null; $("hand").dataset.sig=""; }
  }
  cv.addEventListener("click",at);
  cv.addEventListener("touchstart",function(e){ e.preventDefault(); at(e); },{passive:false});
  addEventListener("pointerdown",audioInit,{once:true});
  $("btnPause").addEventListener("click",function(){ audioInit(); var S=DES.state(); if(S.over) return;
    paused=!paused; $("btnPause").classList.toggle("on",paused); $("btnPause").textContent=paused?"Seguir":"Pausa";
    if(paused) toast("En pausa","Mirá la mano de la Casa Bermeja y calculá el cambio."); });
  $("btnSnd").addEventListener("click",function(){ audioInit(); muted=!muted; if(MST) MST.gain.value=muted?0:.85; $("btnSnd").classList.toggle("on",muted); $("btnSnd").textContent=muted?"Mudo":"Sonido"; });
  $("btnHelp").addEventListener("click",function(){ help=!help; $("btnHelp").classList.toggle("on",help);
    if(help) toast("Acá nadie muere: se cambia de patrón",
      "Los mercenarios VETERANOS (✦ dorado: Capataz, Cobrador, Acreedor) vencidos por tus tropas se pasan a tu casa. Si los voltea un almacén, una garita o un Embargo, se destruyen. El Pagaré trae de vuelta a los tuyos.");
    else $("toast").hidden=true; });

  function finish(){
    var S=DES.state(), cm=DES.crowns("me"), cf=DES.crowns("foe"), won=S.over==="me", draw=S.over==="draw";
    won?SFX.win():SFX.lose();
    var adv=S.spent.foe-S.spent.me;
    $("overBox").innerHTML='<div class="over'+(won?"":(draw?" draw":" lose"))+'">'+
      '<h2>'+(draw?"Empate":(won?"¡La salina es tuya!":"Te ganaron la salina"))+'</h2>'+
      '<div class="big"><span class="coin m">'+cm+'</span><i>almacenes</i><span class="coin f">'+cf+'</span></div>'+
      '<p>Se pasaron a tu casa <b style="color:var(--me-lt)">'+S.deserts.me+'</b> · se pasaron al rival <b style="color:var(--foe-lt)">'+S.deserts.foe+'</b><br>'+
      'Balance de sal: '+(adv>=0?"+":"")+adv+'</p>'+
      '<button class="btn" id="btnAgain" type="button">Otra partida</button></div>';
    $("btnAgain").addEventListener("click",boot);
  }

  /* ═══════════ jugador automático para pruebas (?auto=1). Juega con la misma API que un dedo. ═══════════ */
  var botCd=1;
  function bot(dt){ botCd-=dt; if(botCd>0) return; botCd=.7;
    var S=DES.state(); if(S.over) return; var hand=S.hand.me.filter(function(k){ return DES.CARDS[k].cost<=S.elix.me; }); if(!hand.length) return;
    var foes=S.units.filter(function(u){ return u.side==="foe"; }), near=foes.filter(function(u){ return u.y>RT-200; });
    if(near.length){ var tx=near[0].x, ty=Math.min(H-200,Math.max(RB+60,near[0].y+150));
      if(near.length>=3&&hand.indexOf("purga")>=0){ DES.deploy("me","purga",near[0].x,near[0].y); return; }
      var pref=["alabardero","reclutas","ballesteras","coloso","mina"]; for(var i=0;i<pref.length;i++) if(hand.indexOf(pref[i])>=0){ if(DES.deploy("me",pref[i],tx,ty)) return; } }
    var lost=S.units.filter(function(u){ return u.side==="foe"&&u.origin==="me"; });
    if(lost.length&&hand.indexOf("estandarte")>=0){ DES.deploy("me","estandarte",lost[0].x,lost[0].y); return; }
    if(S.elix.me>=7){ var lane=Math.random()<.5?260:740, k=hand.filter(function(k){ return !DES.CARDS[k].spell&&k!=="mina"; })[0];
      if(k) DES.deploy("me",k,lane,RB+120); }
  }

  /* ═══════════ bucle: paso fijo de 1/60 con acumulador ═══════════ */
  var last=0, acc=0, STEP=1/60;
  function loop(ts){
    requestAnimationFrame(loop);
    if(!last) last=ts;
    var dt=Math.min(.1,(ts-last)/1000); last=ts; now+=dt;
    var wr=$("fieldwrap").getBoundingClientRect();
    if(Math.round(wr.width)!==lastW||Math.round(wr.height)!==lastH||!FIELD) fit();
    var S=DES.state();
    if(!S.over && !paused){ acc+=dt*FAST; while(acc>=STEP){ DES.tick(STEP); acc-=STEP; if(AUTO) bot(STEP); if(DES.state().over) break; } }
    pump();
    // recordar tropas vivas (para dibujar su caída cuando el motor las saca)
    seenUnits={}; S.units.forEach(function(u){ var v=vsOf(u);
      var dx=u.x-v.px, dy=u.y-v.py, dist=Math.hypot(dx,dy);
      if(dist>.15){ v.ph+=dist*.09; if(Math.abs(dy)>.05) v.hy=v.hy*.85+(dy>0?1:-1)*.15; }
      v.px=u.x; v.py=u.y; v.atk=Math.max(0,v.atk-dt); v.flick=Math.max(0,v.flick-dt);
      var dk=Math.exp(-12*dt); v.kbx*=dk; v.kby*=dk;
      seenUnits[u.id]={x:u.x,y:u.y,art:u.art,turns:u.turns,back:v.hy<0,r:u.r*WITHER[Math.min(2,u.turns)]}; });
    for(var i=FX.length-1;i>=0;i--){ FX[i].age+=dt; if(FX[i].age>FX[i].dur) FX.splice(i,1); }
    S.towers.forEach(function(t){ var v=crackSet(t); v.hit=Math.max(0,v.hit-dt*5); });
    if(tT>0){ tT-=dt; if(tT<=0 && !help) $("toast").hidden=true; }
    if(bnT>0) bnT-=dt;
    shakeA*=Math.exp(-7*dt); if(shakeA<.2) shakeA=0;
    // tictac del último medio minuto, que se acelera
    var left=DES.MATCH-S.t; if(!S.over&&!paused&&left<=30){ var iv=left<=10?.5:1; if(now-lastTick>=iv){ lastTick=now; SFX.tick(left<=10); } }

    var k=SC*DPR; cx.setTransform(k,0,0,k,0,0);
    cx.save();
    if(shakeA>0) cx.translate(Math.sin(now*71)*shakeA*.6,Math.cos(now*53)*shakeA*.5);
    cx.fillStyle="#0a0706"; cx.fillRect(-40,-40,W+80,H+80);
    if(FIELD) cx.drawImage(FIELD,0,0,W,H);
    drawBrine(); drawZone();
    // fantasmas y anillos en el piso primero, después todo ordenado por profundidad
    FX.forEach(function(f){ if(f.age>=0 && (f.t==="ring"||f.t==="spawn"||f.t==="purga"||f.t==="pagare")) drawFX(f); });
    var list=[]; S.towers.forEach(function(t){ list.push({y:t.y,t:t}); }); S.units.forEach(function(u){ list.push({y:u.y,u:u}); });
    list.sort(function(a,b){ return a.y-b.y; });
    list.forEach(function(o){ o.t?drawTower(o.t):drawUnit(o.u); });
    FX.forEach(function(f){ if(f.age>=0 && !(f.t==="ring"||f.t==="spawn"||f.t==="purga"||f.t==="pagare")) drawFX(f); });
    drawProjectiles(dt); drawParticles(dt); drawLate();
    cx.restore();
    hud();
    if(DES.state().over && !$("overBox").firstChild) finish();
  }

  function boot(){
    DES.start(); FX.length=0; PT.length=0; PR.length=0; VS={}; TV={}; openLane=[-1,-1]; wasDbl=false; lateOn=false;
    sel=null; paused=false; last=0; acc=0;
    $("overBox").innerHTML=""; $("hand").dataset.sig=""; $("foeCards").dataset.sig=""; $("nextWrap").dataset.k="";
    $("btnPause").classList.remove("on"); $("btnPause").textContent="Pausa"; $("clk").classList.remove("late");
    fit();
    toast("Acá nadie muere: se cambia de patrón","Vencé a un VETERANO (✦) de la Casa Bermeja con tus tropas y se pasa a tu casa. Tocá una carta y después tu lado de la quebrada.");
    tT=5;
  }
  boot();
  requestAnimationFrame(loop);
  return { fit:fit, boot:boot, dbg:DBG, fx:function(){ return FX; } };
})();
</script>
</body>
</html>
