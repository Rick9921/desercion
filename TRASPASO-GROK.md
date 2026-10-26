# DESERCIÓN — TRASPASO TÉCNICO

**De:** Claude (Anthropic) · **Para:** Grok (xAI) · **Cliente:** Rick · 2026-10-26

**Yo hice el motor y el balance. Vos hacés todos los gráficos, todos los efectos y el
mundo entero.** Rick dijo que esta versión todavía parece Clash Royale y tiene razón:
cambié la mecánica pero no el marco. Cambiar el marco es tu parte — sección 0 del brief.

Leé primero `BRIEF-ARTE-GROK.md`. Ahí está qué es el juego, el inventario cerrado de lo
que se ve, los efectos uno por uno, el contrato con el motor y el balance que no hay que
romper. Este documento es el código y el proyecto Android.

| | |
|---|---|
| Tipo | Arena 1v1 en tiempo real, vertical, con una mecánica nueva: las tropas veteranas desertan |
| Objetivo visual | **Calidad Clash Royale.** Lo que hay ahora son formas planas: es andamio, no propuesta |
| Stack | HTML + CSS + JS vanilla, un archivo, cero dependencias |
| Peso | ~46 KB |
| Assets binarios | **Ninguno.** Audio sintetizado, gráficos generados, icono VectorDrawable |
| Envoltorio | Capacitor 6.2.0 · minSdk 23 · targetSdk 35 · **portrait** |

## Arquitectura

```
DES  →  motor en tiempo real.  CERO DOM, cero dibujo.   NO TOCAR.
ART  →  todo lo visual y sonoro.                        REESCRIBIR ENTERO.
```

El motor no dibuja y no toca el DOM. Vos leés `DES.state()` y vaciás `DES.drain()`.
El contrato completo está en la sección 5 del brief.

**Lo único que el motor te exige:** llamar a `DES.tick(dt)` con **paso fijo de 1/60**.
Si pasás el delta crudo, la simulación cambia con los FPS del teléfono y el balance
medido deja de valer.

---

## 1. CÓDIGO COMPLETO — `www/index.html`

Íntegro, sin recortes.

```html
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#0d1316">
<title>Deserción</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bitter:wght@600;800&family=Oswald:wght@300;400;600&display=swap">
<style>html{color-scheme:dark;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
body{margin:0}</style>
<style>
/* ARQUITECTURA: DES (motor, cero DOM) + ART (todo lo visual, reemplazable).
   Grok reescribe ART completo. DES no se toca: el balance está medido. */
:root{
  --ink:#0d1316; --panel:#161f24; --line:#2a3a42; --bone:#ece5d6; --dim:#8a9aa2;
  --me:#4aa3d8; --me-lt:#9bd4f2; --me-dk:#14415e;
  --foe:#d9574e; --foe-lt:#f3a299; --foe-dk:#6f2520;
  --elix:#c563d9; --gold:#dfa83f; --vet:#f0c44a;
  --fd:"Bitter",Georgia,serif; --fu:"Oswald","Arial Narrow",sans-serif;
  color-scheme:dark;
}
*{box-sizing:border-box}
html,body{height:100%;margin:0;overflow:hidden}
body{background:var(--ink);color:var(--bone);font-family:var(--fu);
  -webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;user-select:none;touch-action:manipulation}
#app{position:fixed;inset:0;display:flex;flex-direction:column;
  padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);
  padding-left:max(0px,env(safe-area-inset-left,0px));padding-right:max(0px,env(safe-area-inset-right,0px))}

.hdr{display:flex;align-items:center;gap:8px;padding:5px 11px 4px;border-bottom:1px solid var(--line)}
.hdr .nm{font-family:var(--fd);font-weight:800;font-size:15px;color:var(--gold)}
.hdr .cr{display:flex;gap:5px;margin-left:auto;align-items:center;font-family:var(--fd);font-weight:800;font-size:14px}
.hdr .cr .m{color:var(--me)} .hdr .cr .f{color:var(--foe)} .hdr .cr i{color:var(--dim);font-style:normal}
.hdr b{font-family:var(--fd);font-weight:800;font-size:16px;font-variant-numeric:tabular-nums;margin-left:6px}
.x2{font-family:var(--fd);font-weight:800;font-size:11px;background:var(--elix);color:#1a1020;padding:1px 5px}
.x2[hidden]{display:none}

.meters{display:flex;align-items:center;gap:7px;padding:4px 11px;border-bottom:1px solid var(--line);
  font-size:9.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--dim)}
.mbar{flex:1;height:5px;background:#0f1a1f;border:1px solid var(--line);position:relative;overflow:hidden}
.mbar i{position:absolute;top:0;bottom:0;left:50%;background:var(--me);transform-origin:left}
.mbar i.neg{background:var(--foe);transform-origin:right;left:auto;right:50%}
.meters b{font-variant-numeric:tabular-nums;color:var(--bone);font-size:11px;min-width:3em;text-align:right}

.fieldwrap{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;
  background:#080d0f;overflow:hidden}
#field{display:block;touch-action:none}
.toast{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;
  background:rgba(8,13,15,.88);border:1px solid var(--line);padding:9px 14px;font-size:12.5px;color:var(--dim);max-width:80%}
.toast b{color:var(--bone)} .toast[hidden]{display:none}
.banner{position:absolute;left:0;right:0;top:34%;text-align:center;pointer-events:none;opacity:0;
  font-family:var(--fd);font-weight:800;font-size:clamp(20px,7vw,34px);letter-spacing:.04em;
  text-shadow:0 3px 0 #000,0 0 26px rgba(0,0,0,.8)}
.banner.show{animation:bn 1.5s ease-out}
@keyframes bn{0%{opacity:0;transform:scale(.7)}18%{opacity:1;transform:scale(1.06)}
  30%{transform:scale(1)}78%{opacity:1}100%{opacity:0;transform:scale(1.02)}}

.foerow{display:flex;align-items:center;gap:5px;padding:4px 9px;border-top:1px solid var(--line);
  font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.foerow>span{flex:none}
.foerow .cards{display:flex;gap:3px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end;min-width:0}
.fc{display:flex;align-items:center;gap:3px;border:1px solid var(--foe-dk);padding:2px 4px;font-size:9px;
  letter-spacing:.03em;color:var(--bone);background:rgba(111,37,32,.18);white-space:nowrap}
.fc em{font-style:normal;font-family:var(--fd);font-weight:800;color:var(--foe);font-size:9.5px}
.fc.v{border-color:var(--vet)} .fc.v em{color:var(--vet)}
.fc.nx{border-style:dashed;opacity:.7}

.bottom{padding:6px 9px 8px;display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);background:var(--panel)}
.elixrow{display:flex;align-items:center;gap:7px}
.elixbar{flex:1;height:13px;background:#0f1a1f;border:1px solid var(--line);display:flex;gap:2px;padding:2px}
.elixbar i{flex:1;background:#17222a}
.elixbar i.on{background:linear-gradient(180deg,#e994f7,var(--elix))}
.elixbar i.part{background:linear-gradient(90deg,var(--elix) var(--p),#17222a var(--p))}
.elixn{font-family:var(--fd);font-weight:800;font-size:16px;color:var(--elix);font-variant-numeric:tabular-nums;min-width:1.3em;text-align:right}

.hand{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.card{position:relative;background:#111a1f;border:1px solid var(--line);padding:4px 3px 3px;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:1px;overflow:hidden;transition:border-color .1s,transform .08s}
.card.sel{border-color:var(--gold);transform:translateY(-4px);background:#1b262d}
.card.off{opacity:.44}
.card.vet{border-left:3px solid var(--vet)}
.card canvas{width:clamp(26px,8.4vw,42px);height:clamp(26px,8.4vw,42px)}
.card .nm2{font-size:9px;letter-spacing:.04em;text-transform:uppercase;text-align:center;line-height:1.06;color:var(--bone)}
.card .cst{font-family:var(--fd);font-weight:800;font-size:11.5px;color:var(--elix);font-variant-numeric:tabular-nums}
.card.off .cst{color:#6b4a73}
.card .fill{position:absolute;left:0;right:0;bottom:0;background:rgba(197,99,217,.18);pointer-events:none}
.card .vtag{position:absolute;right:2px;top:2px;font-size:7.5px;letter-spacing:.08em;color:var(--vet)}

.nxt{display:flex;align-items:center;gap:5px;font-size:9px;letter-spacing:.11em;text-transform:uppercase;color:var(--dim)}
.nxt canvas{width:21px;height:21px}
.nxt .sp{margin-left:auto;display:flex;gap:5px}
.sbtn{font-family:var(--fu);font-weight:600;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  padding:3px 8px;border:1px solid var(--line);background:transparent;color:var(--dim);cursor:pointer}
.sbtn.on{border-color:var(--gold);color:var(--gold)}

.over{position:absolute;inset:0;z-index:9;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:9px;background:rgba(6,10,12,.92);text-align:center;padding:18px}
.over h2{font-family:var(--fd);font-weight:800;margin:0;font-size:26px;color:var(--gold)}
.over.lose h2{color:var(--foe)} .over.draw h2{color:var(--dim)}
.over p{margin:0;font-size:12.5px;color:var(--dim);max-width:30em;line-height:1.5}
.over .big{display:flex;gap:9px;font-family:var(--fd);font-weight:800;font-size:20px}
.over .big span{color:var(--me)} .over .big i{font-style:normal;color:var(--dim)} .over .big b{color:var(--foe)}
.btn{font-family:var(--fu);font-weight:600;font-size:12px;letter-spacing:.11em;text-transform:uppercase;
  padding:10px 20px;border:1px solid var(--gold);background:transparent;color:var(--gold);cursor:pointer}
.btn:active{background:var(--gold);color:var(--ink)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<div id="app">
  <div class="hdr">
    <span class="nm">Deserción</span>
    <div class="cr"><span class="m" id="crM">0</span><i>—</i><span class="f" id="crF">0</span></div>
    <span class="x2" id="x2" hidden>×2</span><b id="clk">3:00</b>
  </div>

  <div class="meters">
    <span>Elixir</span>
    <div class="mbar"><i id="advI"></i></div>
    <b id="advN">0.0</b>
    <span style="margin-left:6px">Desertores</span>
    <b id="desN" style="min-width:2.6em">0–0</b>
  </div>

  <div class="fieldwrap" id="fieldwrap">
    <canvas id="field"></canvas>
    <div class="banner" id="banner"></div>
    <div class="toast" id="toast"></div>
    <div id="overBox"></div>
  </div>

  <div class="foerow"><span>Rival</span><div class="cards" id="foeCards"></div></div>

  <div class="bottom">
    <div class="elixrow">
      <div class="elixbar" id="elixbar"></div>
      <div class="elixn" id="elixn">5</div>
    </div>
    <div class="hand" id="hand"></div>
    <div class="nxt">
      <span>Próxima</span><span id="nextWrap"></span>
      <div class="sp">
        <button class="sbtn" id="btnHelp" type="button">Cómo</button>
        <button class="sbtn" id="btnPause" type="button">Pausa</button>
      </div>
    </div>
  </div>
</div>

<script>
/* ╔══════════════════════════════════════════════════════════════╗
   ║  DESERCIÓN — MOTOR                                            ║
   ║  Lógica pura en tiempo real. CERO DOM, cero dibujo.           ║
   ║  La capa gráfica lee DES.state() y vacía DES.drain().         ║
   ║  NO MODIFICAR: el balance está medido.                        ║
   ╚══════════════════════════════════════════════════════════════╝ */
var DES = (function(){
  "use strict";

  /* ── campo ── */
  var W=1000, H=1700;
  var RT=760, RB=880;                  // río
  var BR=[260,740], BRW=84;            // puentes
  var MATCH=180, DOUBLE=60;            // segundos de partido / de elixir doble
  var MAXE=10, REGEN=2.8;              // 1 elixir cada REGEN segundos

  /* ── reglas de deserción ──
     Una tropa vencida POR OTRA TROPA cambia de bando con el 40% de su vida
     máxima actual, y esa vida pasa a ser su nuevo máximo: cada vez que cambia
     de manos se marchita. A la tercera deserción se destruye.
     Las torres y los edificios NO convierten: destruyen. Los hechizos tampoco. */
  /* Medido en 140 partidas por configuración:
       · si desertan TODAS las tropas -> 45 deserciones por partido y la bola de
         nieve sube al 65%: la mecánica se vuelve ruido y el que gana el primer
         cambio gana el partido.
       · sólo las VETERANAS (Alabardero, Ariete, Coloso) -> 13 por partido y la
         bola de nieve queda en 52%, o sea neutra. Esta es la configuración.
     Las tropas baratas caen y ya está: el drama es perder a las caras. */
  var DESERT_HP=0.40, DESERT_MAX=2;

  var CARDS={
    reclutas:  {name:"Reclutas",   cost:2, n:3, hp:130,  dmg:58,  rate:1.2, range:28,  sight:280, spd:142, r:16, art:"recluta", tag:"enjambre"},
    estandarte:{name:"Estandarte", cost:2, spell:"recall", radius:230, art:"estandarte", tag:"hechizo"},
    alabardero:{name:"Alabardero", vet:1, cost:3, n:1, hp:640,  dmg:155, rate:1.1, range:30,  sight:300, spd:86,  r:22, art:"alabardero", tag:"tropa"},
    ballesteras:{name:"Ballesteras",cost:3, n:2, hp:210, dmg:102, rate:1.1, range:250, sight:300, spd:82,  r:17, art:"ballestera", tag:"a distancia"},
    mina:      {name:"Mina",       cost:3, build:true, hp:620, dmg:132, rate:1.2, range:285, sight:285, spd:0, r:26, life:30, art:"mina", tag:"edificio"},
    purga:     {name:"Purga",      cost:3, spell:"damage", dmg:430, radius:195, art:"purga", tag:"hechizo"},
    ariete:    {name:"Ariete", vet:1,     cost:4, n:1, hp:1050, dmg:205, rate:1.5, range:30, sight:0, spd:150, r:24, onlyB:true, art:"ariete", tag:"asedio"},
    coloso:    {name:"Coloso", vet:1,     cost:5, n:1, hp:3050, dmg:265, rate:0.8, range:32, sight:0, spd:52,  r:34, onlyB:true, art:"coloso", tag:"tanque"}
  };
  var DECK=["reclutas","estandarte","alabardero","ballesteras","mina","purga","ariete","coloso"];

  var S=null, EV=[];
  function ev(o){ EV.push(o); if(EV.length>240) EV.shift(); }

  function shuf(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t; } return a; }

  function fresh(){
    var s={
      t:0, over:null, units:[], uid:1,
      elix:{me:5,foe:5}, spent:{me:0,foe:0}, deserts:{me:0,foe:0},
      hand:{me:[],foe:[]}, queue:{me:[],foe:[]},
      towers:[
        {id:"f0",side:"foe",kind:"guard", lane:0,x:260,y:320, hp:1000,max:1000,dmg:100,rate:1.2,range:340,r:48,cd:0,on:true},
        {id:"f1",side:"foe",kind:"guard", lane:1,x:740,y:320, hp:1000,max:1000,dmg:100,rate:1.2,range:340,r:48,cd:0,on:true},
        {id:"fK",side:"foe",kind:"throne",lane:-1,x:500,y:150,hp:1700,max:1700,dmg:120,rate:1.0,range:320,r:60,cd:0,on:false},
        {id:"m0",side:"me", kind:"guard", lane:0,x:260,y:1380,hp:1000,max:1000,dmg:100,rate:1.2,range:340,r:48,cd:0,on:true},
        {id:"m1",side:"me", kind:"guard", lane:1,x:740,y:1380,hp:1000,max:1000,dmg:100,rate:1.2,range:340,r:48,cd:0,on:true},
        {id:"mK",side:"me", kind:"throne",lane:-1,x:500,y:1550,hp:1700,max:1700,dmg:120,rate:1.0,range:320,r:60,cd:0,on:false}
      ],
      aiCd:0.7
    };
    ["me","foe"].forEach(function(sd){
      s.queue[sd]=shuf(DECK.slice());
      s.hand[sd]=[s.queue[sd].pop(),s.queue[sd].pop(),s.queue[sd].pop(),s.queue[sd].pop()];
    });
    return s;
  }

  function dbl(){ return S.t > MATCH-DOUBLE; }
  function regen(){ return (dbl()?2:1)/REGEN; }
  function crowns(side){ var n=0; S.towers.forEach(function(t){ if(t.side!==side&&t.hp<=0) n++; }); return n; }
  function noGuards(side){ return S.towers.filter(function(t){ return t.side===side&&t.kind==="guard"&&t.hp>0; }).length===0; }

  /* ── despliegue ── */
  function canDeploy(side,x,y){
    if(side==="me"){
      if(y>RB+30) return true;
      for(var i=0;i<S.towers.length;i++){
        var t=S.towers[i];
        if(t.side==="foe"&&t.kind==="guard"&&t.hp<=0){
          var c0=t.lane===0?0:500;
          if(x>=c0&&x<=c0+500&&y>240) return true;
        }
      }
      return false;
    }
    if(y<RT-30) return true;
    for(var j=0;j<S.towers.length;j++){
      var t2=S.towers[j];
      if(t2.side==="me"&&t2.kind==="guard"&&t2.hp<=0){
        var c1=t2.lane===0?0:500;
        if(x>=c1&&x<=c1+500&&y<H-240) return true;
      }
    }
    return false;
  }

  function deploy(side,key,x,y){
    var C=CARDS[key];
    if(!C || S.over || S.elix[side] < C.cost) return false;
    var hi=S.hand[side].indexOf(key);
    if(hi<0) return false;
    if(!C.spell && !canDeploy(side,x,y)) return false;

    S.elix[side]-=C.cost; S.spent[side]+=C.cost;
    S.hand[side].splice(hi,1);
    if(!S.queue[side].length) S.queue[side]=shuf(DECK.slice());
    S.hand[side].push(S.queue[side].pop());
    S.queue[side].unshift(key);

    if(C.spell==="damage"){
      ev({t:"spell",kind:"purga",x:x,y:y,r:C.radius,side:side});
      S.units.forEach(function(u){
        if(u.side===side||u.hp<=0) return;
        if(Math.hypot(u.x-x,u.y-y)<=C.radius+u.r){ u.hp-=C.dmg; u.killer="spell"; }
      });
      S.towers.forEach(function(t){
        if(t.side===side||t.hp<=0) return;
        if(Math.hypot(t.x-x,t.y-y)<=C.radius+t.r) hurtTower(t,Math.round(C.dmg*0.32),side);
      });
      reap();
      return true;
    }
    if(C.spell==="recall"){
      /* Estandarte: los que desertaron de tu lado vuelven con vos. */
      ev({t:"spell",kind:"estandarte",x:x,y:y,r:C.radius,side:side});
      var back=0;
      S.units.forEach(function(u){
        if(u.side===side||u.hp<=0) return;
        if(u.origin!==side) return;
        if(Math.hypot(u.x-x,u.y-y)>C.radius+u.r) return;
        u.side=side; u.tgt=null; u.cd=0.4; back++;
        ev({t:"desert",x:u.x,y:u.y,to:side,id:u.id,recall:true,art:u.art});
      });
      ev({t:"recallDone",n:back,side:side});
      return true;
    }

    var n=C.n||1, lane = x<500?0:1;
    for(var i=0;i<n;i++){
      var off=(i-(n-1)/2)*44;
      S.units.push({
        id:S.uid++, side:side, origin:side, key:key, art:C.art,
        x:Math.max(34,Math.min(W-34,x+off)), y:y,
        hp:C.hp, max:C.hp, base:C.hp, turns:0,
        cd:0.35, lane:lane, life:C.life||0, born:0.3, killer:null,
        r:C.r, spd:C.spd, dmg:C.dmg, rate:C.rate, range:C.range, sight:C.sight,
        onlyB:!!C.onlyB, build:!!C.build, vet:!!C.vet
      });
      ev({t:"spawn",x:x+off,y:y,side:side,art:C.art});
    }
    return true;
  }

  function hurtTower(t,d,bySide){
    if(t.hp<=0) return;
    t.hp-=d;
    var k=S.towers.filter(function(x){ return x.side===t.side&&x.kind==="throne"; })[0];
    if(k) k.on=true;
    ev({t:"hit",x:t.x,y:t.y,dmg:d,tower:true,side:bySide});
    if(t.hp<=0){
      t.hp=0;
      ev({t:"towerFall",x:t.x,y:t.y,side:t.side,kind:t.kind});
      if(t.kind==="throne") S.over = t.side==="me" ? "foe" : "me";
    }
  }

  /* ── el corazón del juego ── */
  function reap(){
    for(var i=S.units.length-1;i>=0;i--){
      var u=S.units[i];
      if(u.hp>0) continue;
      // Sólo las veteranas desertan. Las demás simplemente caen.
      var byTroop = u.killer && u.killer!=="spell" && u.killer!=="tower" && u.killer!=="expire" && !!u.vet;
      if(byTroop && u.turns < DESERT_MAX && !u.build){
        var to = u.killer;
        u.turns++;
        u.max = Math.max(1, Math.round(u.max*DESERT_HP));
        u.hp  = u.max;
        u.side = to;
        u.tgt=null; u.cd=0.45; u.killer=null;
        ev({t:"desert",x:u.x,y:u.y,to:to,id:u.id,turns:u.turns,art:u.art});
        S.deserts[to]++;
        continue;
      }
      ev({t:"destroy",x:u.x,y:u.y,side:u.side,art:u.art,
          why: u.killer==="spell"?"spell":(u.killer==="tower"?"tower":(u.killer==="expire"?"expire":"withered"))});
      S.units.splice(i,1);
    }
  }

  /* ── objetivos ── */
  function targetTowers(side){
    var ts=S.towers.filter(function(t){ return t.side!==side&&t.hp>0&&(t.kind!=="throne"||noGuards(t.side)); });
    if(ts.length) return ts;
    return S.towers.filter(function(t){ return t.side!==side&&t.kind==="throne"&&t.hp>0; });
  }
  function laneTower(u){
    var ts=targetTowers(u.side), best=null, bd=1e9;
    ts.forEach(function(t){
      var d=Math.hypot(t.x-u.x,t.y-u.y);
      if(t.lane===u.lane) d-=280;
      if(d<bd){ bd=d; best=t; }
    });
    return best;
  }
  function findTarget(u){
    if(!u.onlyB){
      var best=null,bd=1e9;
      for(var i=0;i<S.units.length;i++){
        var e=S.units[i];
        if(e.side===u.side||e.hp<=0) continue;
        var d=Math.hypot(e.x-u.x,e.y-u.y);
        if(d<=u.sight && d<bd){ bd=d; best=e; }
      }
      if(best) return best;
      var bt=null,btd=1e9;
      S.towers.forEach(function(t){
        if(t.side===u.side||t.hp<=0) return;
        var d=Math.hypot(t.x-u.x,t.y-u.y);
        if(d<=u.sight+t.r && d<btd){ btd=d; bt=t; }
      });
      if(bt) return bt;
    }
    if(u.build) return null;
    return laneTower(u);
  }

  /* ── paso fijo ── */
  function step(dt){
    if(S.over) return;
    S.t+=dt;
    S.elix.me=Math.min(MAXE,S.elix.me+regen()*dt);
    S.elix.foe=Math.min(MAXE,S.elix.foe+regen()*dt);

    for(var i=0;i<S.units.length;i++){
      var u=S.units[i];
      if(u.hp<=0) continue;
      if(u.born>0) u.born-=dt;
      if(u.life>0){ u.life-=dt; if(u.life<=0){ u.hp=0; u.killer="expire"; continue; } }

      var tgt=findTarget(u);
      u.tgt = tgt ? (tgt.id||tgt.kind) : null;
      if(!tgt) continue;
      var d=Math.hypot(tgt.x-u.x,tgt.y-u.y);

      if(d <= u.range + (tgt.r||0) + u.r){
        u.cd-=dt;
        if(u.cd<=0){
          u.cd=1/u.rate;
          if(tgt.kind) hurtTower(tgt,u.dmg,u.side);
          else { tgt.hp-=u.dmg; tgt.killer = u.build ? "tower" : u.side;   // los edificios destruyen
                 ev({t:"hit",x:tgt.x,y:tgt.y,dmg:u.dmg,side:u.side}); }
        }
        continue;
      }
      if(u.spd<=0) continue;

      var tx=tgt.x, ty=tgt.y;
      var uB=u.y>RB, uA=u.y<RT, tB=tgt.y>RB, tA=tgt.y<RT;
      if((uB&&tA)||(uA&&tB)){
        var bx = Math.abs(u.x-BR[0])<Math.abs(u.x-BR[1]) ? BR[0] : BR[1];
        if(Math.abs(u.x-bx) > BRW-12){ tx=bx; ty = uB ? RB+28 : RT-28; }
        else { tx=bx; ty = uB ? RT-32 : RB+32; }
      }
      var dx=tx-u.x, dy=ty-u.y, m=Math.hypot(dx,dy)||1;
      u.x += dx/m*u.spd*dt;
      u.y += dy/m*u.spd*dt;
      u.x = Math.max(u.r, Math.min(W-u.r, u.x));
    }

    for(var a=0;a<S.units.length;a++){
      var A=S.units[a]; if(A.hp<=0||A.build) continue;
      for(var b=a+1;b<S.units.length;b++){
        var B=S.units[b]; if(B.hp<=0||B.build) continue;
        var ddx=B.x-A.x, ddy=B.y-A.y, dd=Math.hypot(ddx,ddy), mn=A.r+B.r;
        if(dd>0.01 && dd<mn){
          var p=(mn-dd)/2/dd;
          A.x-=ddx*p; A.y-=ddy*p; B.x+=ddx*p; B.y+=ddy*p;
        }
      }
    }

    S.towers.forEach(function(t){
      if(t.hp<=0||!t.on) return;
      t.cd-=dt;
      var best=null,bd=1e9;
      S.units.forEach(function(u){
        if(u.side===t.side||u.hp<=0) return;
        var d=Math.hypot(u.x-t.x,u.y-t.y);
        if(d<=t.range+u.r && d<bd){ bd=d; best=u; }
      });
      if(best && t.cd<=0){
        t.cd=1/t.rate;
        best.hp-=t.dmg; best.killer="tower";      // las torres destruyen: no hay deserción
        ev({t:"shot",x:t.x,y:t.y,tx:best.x,ty:best.y,side:t.side});
      }
    });

    reap();

    S.aiCd-=dt;
    if(S.aiCd<=0){ S.aiCd=0.5; ai(); }

    if(!S.over && S.t>=MATCH){
      var cm=crowns("me"), cf=crowns("foe");
      if(cm!==cf) S.over = cm>cf ? "me":"foe";
      else {
        var lm=lowGuard("me"), lf=lowGuard("foe");
        S.over = lm===lf ? "draw" : (lm>lf ? "me":"foe");
      }
    }
  }
  function lowGuard(side){
    var v=1e9; S.towers.forEach(function(t){ if(t.side===side&&t.kind==="guard") v=Math.min(v,t.hp); });
    return v===1e9?0:v;
  }

  /* ── IA ──
     Juega con la regla de deserción en la cabeza: prefiere limpiar con torre o
     con Purga antes que arriesgar un cambio, y usa Estandarte cuando el rival
     tiene tropas que desertaron de su lado. */
  function ai(){
    if(S.over) return;
    var hand=S.hand.foe.filter(function(k){ return CARDS[k].cost<=S.elix.foe; });
    if(!hand.length) return;

    var threats=S.units.filter(function(u){ return u.side==="me" && u.y<RB+140; });
    var mine=S.units.filter(function(u){ return u.side==="foe"; });

    // ¿tengo desertores míos peleando para el rival cerca? recuperarlos
    var lost=S.units.filter(function(u){ return u.side==="me" && u.origin==="foe" && u.y<RB+200; });
    if(lost.length>=2 && hand.indexOf("estandarte")>=0){
      var lx=lost.reduce(function(a,u){return a+u.x;},0)/lost.length;
      var ly=lost.reduce(function(a,u){return a+u.y;},0)/lost.length;
      if(deploy("foe","estandarte",lx,ly)) return;
    }

    if(threats.length){
      var lane = threats.reduce(function(a,u){ return a+(u.x<500?-1:1); },0) <= 0 ? 0 : 1;
      var tx = lane===0?260:740;
      var front = threats.reduce(function(a,u){ return Math.min(a,u.y); },1e9);
      var ty = Math.max(240, Math.min(RT-70, front-170));
      var swarm = threats.filter(function(u){ return u.r<=17; }).length;
      var tank  = threats.some(function(u){ return u.max>=1000; });
      var clump = threats.length>=3;

      // limpiar sin regalar deserciones
      if((swarm>=3||clump) && hand.indexOf("purga")>=0){
        var px=threats.reduce(function(a,u){return a+u.x;},0)/threats.length;
        var py=threats.reduce(function(a,u){return a+u.y;},0)/threats.length;
        if(deploy("foe","purga",px,py)) return;
      }
      if(tank && hand.indexOf("mina")>=0 && S.elix.foe>=5){ if(deploy("foe","mina",tx<500?360:640,430)) return; }
      if(hand.indexOf("ballesteras")>=0){ if(deploy("foe","ballesteras",tx,300)) return; }
      if(tank && hand.indexOf("reclutas")>=0){ if(deploy("foe","reclutas",tx,ty)) return; }
      if(hand.indexOf("alabardero")>=0){ if(deploy("foe","alabardero",tx,ty)) return; }
      if(hand.indexOf("reclutas")>=0){ if(deploy("foe","reclutas",tx,ty)) return; }
      return;
    }

    var save = dbl()?7:8;
    if(S.elix.foe>=save){
      var hpL=0,hpR=0;
      S.towers.forEach(function(t){ if(t.side==="me"&&t.kind==="guard"){ if(t.lane===0) hpL=t.hp; else hpR=t.hp; } });
      var weak = hpL<=hpR ? 0 : 1, x = weak===0?260:740;
      if(hand.indexOf("coloso")>=0) { if(deploy("foe","coloso",x,130)) return; }
      if(mine.some(function(u){ return u.max>=2000; }) && hand.indexOf("ballesteras")>=0){
        if(deploy("foe","ballesteras",x,180)) return;
      }
      if(hand.indexOf("ariete")>=0) { if(deploy("foe","ariete",x,RT-80)) return; }
      if(hand.indexOf("alabardero")>=0) { if(deploy("foe","alabardero",x,180)) return; }
    }
  }

  /* ── API pública para la capa gráfica ── */
  return {
    W:W, H:H, RT:RT, RB:RB, BR:BR, BRW:BRW, MATCH:MATCH, DOUBLE:DOUBLE, MAXE:MAXE,
    CARDS:CARDS, DECK:DECK, DESERT_HP:DESERT_HP, DESERT_MAX:DESERT_MAX,
    VETS:DECK.filter(function(k){ return !!CARDS[k].vet; }),
    start:function(){ S=fresh(); EV.length=0; },
    tick:function(dt){ step(dt); },
    deploy:function(side,key,x,y){ return deploy(side,key,x,y); },
    canDeploy:function(side,x,y){ return canDeploy(side,x,y); },
    drain:function(){ var e=EV.slice(); EV.length=0; return e; },
    doubleElixir:function(){ return dbl(); },
    crowns:crowns,
    state:function(){ return S; }
  };
})();

/* ╔══════════════════════════════════════════════════════════════╗
   ║  ART — TODO lo visual. GROK REEMPLAZA ESTE BLOQUE ENTERO.     ║
   ║  Sólo necesita: leer DES.state(), vaciar DES.drain() y dibujar.║
   ║  Puntos de dibujo que se reemplazan uno por uno:              ║
   ║    drawField()   el campo, el río, los puentes                 ║
   ║    drawTower(t)  cada torre                                    ║
   ║    drawUnit(u)   cada tropa                                    ║
   ║    drawFX(f)     cada efecto                                   ║
   ║    cardArt(key)  el dibujo de cada carta en la mano            ║
   ╚══════════════════════════════════════════════════════════════╝ */
var ART=(function(){
  "use strict";
  function $(id){ return document.getElementById(id); }
  var W=DES.W, H=DES.H, RT=DES.RT, RB=DES.RB, BR=DES.BR, BRW=DES.BRW;
  var cv=$("field"), cx=cv.getContext("2d"), SC=1;
  var fx=[], sel=null, paused=false, help=false, shakeT=0, shakeM=0;

  /* ── audio sintetizado, sin archivos ── */
  var AC=null,nb=null;
  function ac(){ if(!AC){ try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;} }
    if(AC&&AC.state==="suspended") AC.resume(); return AC; }
  function noise(){ var c=ac(); if(!c) return null;
    if(!nb){ nb=c.createBuffer(1,c.sampleRate,c.sampleRate);
      var d=nb.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=Math.random()*2-1; } return nb; }
  function brst(dur,f0,q,vol,type){ var c=ac(); if(!c) return;
    var s=c.createBufferSource(); s.buffer=noise();
    var f=c.createBiquadFilter(); f.type=type||"lowpass"; f.frequency.value=f0; f.Q.value=q||1;
    var g=c.createGain(); g.gain.setValueAtTime(vol,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(); s.stop(c.currentTime+dur); }
  function tone(f0,dur,vol,type,to){ var c=ac(); if(!c) return;
    var o=c.createOscillator(),g=c.createGain(); o.type=type||"sine";
    o.frequency.setValueAtTime(f0,c.currentTime);
    if(to) o.frequency.exponentialRampToValueAtTime(to,c.currentTime+dur);
    g.gain.setValueAtTime(vol,c.currentTime); g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+dur); }
  var SFX={
    deploy:function(){ brst(.08,900,1.4,.16,"lowpass"); tone(180,.1,.09,"sine",300); },
    hit:function(){ brst(.04,2200,2.6,.09,"bandpass"); },
    shot:function(){ brst(.05,1500,3,.07,"bandpass"); tone(620,.05,.04,"square",420); },
    destroy:function(){ brst(.16,420,1.2,.2,"lowpass"); tone(140,.14,.1,"sine",70); },
    /* el sonido clave del juego: la deserción */
    desert:function(){ [392,523,659].forEach(function(f,i){ setTimeout(function(){ tone(f,.17,.13,"triangle"); }, i*72); });
      brst(.2,1100,1.8,.14,"bandpass"); },
    recall:function(){ [659,523,392].forEach(function(f,i){ setTimeout(function(){ tone(f,.16,.12,"triangle"); }, i*70); }); },
    spell:function(){ brst(.3,700,.9,.3,"lowpass"); tone(90,.26,.2,"sawtooth",40); },
    fall:function(){ brst(.5,300,.8,.4,"lowpass"); tone(70,.4,.26,"sine",34);
      setTimeout(function(){ brst(.3,900,1.4,.2,"lowpass"); },120); },
    win:function(){ [523,659,784,1046].forEach(function(f,i){ setTimeout(function(){ tone(f,.2,.14,"triangle"); }, i*110); }); },
    lose:function(){ [392,330,262,196].forEach(function(f,i){ setTimeout(function(){ tone(f,.3,.14,"sawtooth"); }, i*150); }); }
  };

  var lastW=0,lastH=0;
  function fit(){
    var r=$("fieldwrap").getBoundingClientRect();
    lastW=Math.round(r.width); lastH=Math.round(r.height);
    var d=Math.min(window.devicePixelRatio||1,2);
    var sc=Math.min(r.width/W, r.height/H);
    cv.style.width=Math.floor(W*sc)+"px"; cv.style.height=Math.floor(H*sc)+"px";
    cv.width=Math.floor(W*sc*d); cv.height=Math.floor(H*sc*d);
    cx.setTransform(d*sc,0,0,d*sc,0,0); SC=sc;
  }
  addEventListener("resize",fit);
  addEventListener("orientationchange",function(){ setTimeout(fit,140); });

  /* ─────────── DIBUJO: campo ─────────── */
  function drawField(){
    cx.fillStyle="#1c3326"; cx.fillRect(0,0,W,RT);
    cx.fillStyle="#1e3728"; cx.fillRect(0,RB,W,H-RB);
    var g=cx.createLinearGradient(0,RT,0,RB);
    g.addColorStop(0,"#123048"); g.addColorStop(.5,"#1a4568"); g.addColorStop(1,"#123048");
    cx.fillStyle=g; cx.fillRect(0,RT,W,RB-RT);
    cx.strokeStyle="#2b5c86"; cx.lineWidth=3;
    cx.beginPath(); cx.moveTo(0,RT); cx.lineTo(W,RT); cx.moveTo(0,RB); cx.lineTo(W,RB); cx.stroke();
    BR.forEach(function(bx){
      cx.fillStyle="#6d5431"; cx.fillRect(bx-BRW,RT-7,BRW*2,RB-RT+14);
      cx.strokeStyle="#3b2c19"; cx.lineWidth=2;
      for(var y=RT-4;y<=RB+4;y+=22){ cx.beginPath(); cx.moveTo(bx-BRW,y); cx.lineTo(bx+BRW,y); cx.stroke(); }
    });
    cx.setLineDash([14,12]); cx.strokeStyle="rgba(236,229,214,.13)"; cx.lineWidth=2;
    cx.beginPath(); cx.moveTo(500,0); cx.lineTo(500,H); cx.stroke(); cx.setLineDash([]);
    if(sel && !DES.CARDS[sel].spell){
      cx.fillStyle="rgba(74,163,216,.10)";
      for(var yy=0;yy<H;yy+=14) for(var xx=0;xx<W;xx+=14)
        if(DES.canDeploy("me",xx+7,yy+7)) cx.fillRect(xx,yy,14,14);
    }
  }

  /* ─────────── DIBUJO: torres ─────────── */
  function drawTower(t){
    var mine=t.side==="me", dead=t.hp<=0;
    var body = dead?"#2a3237":(mine?"#2b6a92":"#9a3a32");
    var edge = dead?"#1b2226":(mine?"var-me-lt":"var-foe-lt");
    edge = dead?"#1b2226":(mine?"#9bd4f2":"#f3a299");
    var s=t.r;
    cx.fillStyle="rgba(0,0,0,.3)";
    cx.beginPath(); cx.ellipse(t.x,t.y+s*0.95,s*1.05,s*0.3,0,0,6.284); cx.fill();
    cx.fillStyle=body; cx.strokeStyle=edge; cx.lineWidth=3;
    cx.beginPath(); cx.rect(t.x-s,t.y-s,s*2,s*2); cx.fill(); cx.stroke();
    cx.fillStyle=edge;
    var m=t.kind==="throne"?4:3;
    for(var i=0;i<m;i++) cx.fillRect(t.x-s+i*(s*2/m)+2,t.y-s-10,s*2/m-4,11);
    if(!dead){
      cx.fillStyle="#0c1215"; cx.fillRect(t.x-s,t.y+s+6,s*2,10);
      cx.fillStyle=mine?"#4aa3d8":"#d9574e";
      cx.fillRect(t.x-s+1,t.y+s+7,(s*2-2)*(t.hp/t.max),8);
      cx.fillStyle="rgba(236,229,214,.92)"; cx.font="600 21px Oswald, sans-serif"; cx.textAlign="center";
      cx.fillText(Math.ceil(t.hp),t.x,t.y+7);
      if(!t.on){ cx.fillStyle="rgba(0,0,0,.34)"; cx.fillRect(t.x-s,t.y-s,s*2,s*2); }
    }
  }

  /* ─────────── DIBUJO: tropas ─────────── */
  function drawUnit(u){
    var mine=u.side==="me";
    var col=mine?"#4aa3d8":"#d9574e", dk=mine?"#14415e":"#6f2520", lt=mine?"#9bd4f2":"#f3a299";
    var r=u.r*(u.born>0?(1-u.born/0.3)*0.45+0.55:1);
    cx.save();
    cx.fillStyle="rgba(0,0,0,.26)";
    cx.beginPath(); cx.ellipse(u.x,u.y+r*0.85,r*0.9,r*0.32,0,0,6.284); cx.fill();
    cx.fillStyle=col; cx.strokeStyle=dk; cx.lineWidth=2.4;
    cx.beginPath();
    var a=u.art;
    if(a==="recluta"){ cx.moveTo(u.x,u.y-r); cx.lineTo(u.x+r*.9,u.y+r*.7); cx.lineTo(u.x-r*.9,u.y+r*.7); cx.closePath(); }
    else if(a==="mina"){ cx.rect(u.x-r*.85,u.y-r*.85,r*1.7,r*1.7); }
    else if(a==="coloso"){ for(var i=0;i<6;i++){ var an=i*1.0472-0.5236,px=u.x+Math.cos(an)*r,py=u.y+Math.sin(an)*r; i?cx.lineTo(px,py):cx.moveTo(px,py);} cx.closePath(); }
    else cx.arc(u.x,u.y,r,0,6.284);
    cx.fill(); cx.stroke();
    cx.fillStyle=dk;
    if(a==="ballestera"){ cx.fillRect(u.x-1.5,u.y-r*.7,3,r*1.4); cx.beginPath(); cx.arc(u.x,u.y,r*.42,0,6.284); cx.fill(); }
    if(a==="ariete"){ cx.beginPath(); cx.moveTo(u.x-r*.5,u.y+r*.22); cx.lineTo(u.x+r*.5,u.y+r*.22); cx.lineTo(u.x,u.y-r*.55); cx.closePath(); cx.fill(); }
    if(a==="alabardero"){ cx.fillRect(u.x-r*.12,u.y-r*1.1,r*.24,r*1.5); }
    if(a==="coloso"){ cx.fillRect(u.x-r*.4,u.y-r*.14,r*.8,r*.28); }
    if(a==="mina"){ cx.beginPath(); cx.arc(u.x,u.y,r*.34,0,6.284); cx.fill(); }
    /* marca de veterano: las únicas tropas que desertan */
    if(u.vet){
      cx.strokeStyle="#f0c44a"; cx.lineWidth=2;
      cx.beginPath(); cx.arc(u.x,u.y,r+4.5,0,6.284); cx.stroke();
      if(u.turns>0){
        cx.fillStyle="#f0c44a"; cx.font="600 15px Oswald, sans-serif"; cx.textAlign="center";
        cx.fillText("↻"+u.turns,u.x,u.y-r-9);
      }
    }
    if(u.hp<u.max){
      cx.fillStyle="#0c1215"; cx.fillRect(u.x-r,u.y-r-9,r*2,5);
      cx.fillStyle=lt; cx.fillRect(u.x-r+1,u.y-r-8,(r*2-2)*(u.hp/u.max),3);
    }
    cx.restore();
  }

  /* ─────────── DIBUJO: efectos ─────────── */
  function drawFX(f){
    var k=f.age/f.dur;
    cx.save(); cx.globalAlpha=Math.max(0,1-k);
    var col = f.side==="me" ? "#9bd4f2" : "#f3a299";
    if(f.t==="hit"){ cx.fillStyle="#ffe6b0"; cx.beginPath(); cx.arc(f.x,f.y,6+k*13,0,6.284); cx.fill(); }
    else if(f.t==="shot"){ cx.strokeStyle=col; cx.lineWidth=3;
      cx.beginPath(); cx.moveTo(f.x,f.y); cx.lineTo(f.tx,f.ty); cx.stroke(); }
    else if(f.t==="spawn"){ cx.strokeStyle=col; cx.lineWidth=3;
      cx.beginPath(); cx.arc(f.x,f.y,40-k*28,0,6.284); cx.stroke(); }
    else if(f.t==="destroy"){ cx.strokeStyle=f.side==="me"?"#4aa3d8":"#d9574e"; cx.lineWidth=3;
      cx.beginPath(); cx.arc(f.x,f.y,12+k*30,0,6.284); cx.stroke(); }
    else if(f.t==="spell"){
      cx.strokeStyle=f.kind==="purga"?"#f0a0ff":"#f0c44a"; cx.lineWidth=7;
      cx.beginPath(); cx.arc(f.x,f.y,f.r*(0.35+k*0.78),0,6.284); cx.stroke();
      cx.fillStyle=f.kind==="purga"?"rgba(240,160,255,.17)":"rgba(240,196,74,.15)";
      cx.beginPath(); cx.arc(f.x,f.y,f.r,0,6.284); cx.fill();
    }
    else if(f.t==="desert"){
      /* el efecto central del juego: anillos que cambian de color */
      var to=f.to==="me"?"#9bd4f2":"#f3a299", from=f.to==="me"?"#f3a299":"#9bd4f2";
      cx.strokeStyle=from; cx.lineWidth=6; cx.globalAlpha=Math.max(0,1-k)*0.8;
      cx.beginPath(); cx.arc(f.x,f.y,20+k*54,0,6.284); cx.stroke();
      cx.strokeStyle=to; cx.lineWidth=4; cx.globalAlpha=Math.max(0,1-k);
      cx.beginPath(); cx.arc(f.x,f.y,66-k*48,0,6.284); cx.stroke();
      cx.fillStyle=to; cx.font="700 26px Bitter, serif"; cx.textAlign="center";
      cx.globalAlpha=Math.max(0,1-k)*0.95;
      cx.fillText("↻", f.x, f.y - 40 - k*26);
    }
    else if(f.t==="towerFall"){ cx.strokeStyle="#ffe6b0"; cx.lineWidth=6;
      cx.beginPath(); cx.arc(f.x,f.y,34+k*150,0,6.284); cx.stroke(); }
    cx.restore();
  }

  /* ─────────── DIBUJO: cartas ─────────── */
  function cardArt(key,size){
    var c=document.createElement("canvas"); c.width=c.height=size*2;
    var g=c.getContext("2d"); g.scale(2,2);
    var C=DES.CARDS[key];
    g.fillStyle="#0e171b"; g.fillRect(0,0,size,size);
    var mx=size/2, my=size/2, r=size*0.29;
    if(C.spell){
      var sc=C.spell==="damage"?"#f0a0ff":"#f0c44a";
      g.strokeStyle=sc; g.lineWidth=2.2;
      g.beginPath(); g.arc(mx,my,r,0,6.284); g.stroke();
      g.fillStyle=sc;
      if(C.spell==="damage"){ g.beginPath(); g.arc(mx,my,r*.46,0,6.284); g.fill(); }
      else { g.beginPath(); g.moveTo(mx,my-r*.8); g.lineTo(mx+r*.6,my); g.lineTo(mx,my+r*.8); g.lineTo(mx-r*.6,my); g.closePath(); g.fill(); }
    } else {
      g.fillStyle="#4aa3d8"; g.strokeStyle="#14415e"; g.lineWidth=2;
      g.beginPath();
      if(C.art==="recluta"){ g.moveTo(mx,my-r); g.lineTo(mx+r*.9,my+r*.7); g.lineTo(mx-r*.9,my+r*.7); g.closePath(); }
      else if(C.art==="mina"){ g.rect(mx-r*.85,my-r*.85,r*1.7,r*1.7); }
      else if(C.art==="coloso"){ for(var i=0;i<6;i++){ var a=i*1.0472-0.5236,px=mx+Math.cos(a)*r,py=my+Math.sin(a)*r; i?g.lineTo(px,py):g.moveTo(px,py);} g.closePath(); }
      else g.arc(mx,my,r,0,6.284);
      g.fill(); g.stroke();
      if(C.n>1){ g.fillStyle="#ece5d6"; g.font="600 "+(size*0.24)+"px Oswald, sans-serif"; g.textAlign="right"; g.fillText("x"+C.n,size-2,size-2); }
    }
    return c;
  }

  /* ─────────── eventos del motor -> efectos y sonido ─────────── */
  function pump(){
    var evs=DES.drain();
    for(var i=0;i<evs.length;i++){
      var e=evs[i];
      if(e.t==="hit"){ if(!e.tower) SFX.hit(); fx.push({t:"hit",x:e.x,y:e.y,age:0,dur:.3,side:e.side}); }
      else if(e.t==="shot"){ SFX.shot(); fx.push({t:"shot",x:e.x,y:e.y,tx:e.tx,ty:e.ty,age:0,dur:.18,side:e.side}); }
      else if(e.t==="spawn"){ SFX.deploy(); fx.push({t:"spawn",x:e.x,y:e.y,age:0,dur:.4,side:e.side}); }
      else if(e.t==="destroy"){ SFX.destroy(); fx.push({t:"destroy",x:e.x,y:e.y,age:0,dur:.45,side:e.side}); }
      else if(e.t==="spell"){ SFX.spell(); fx.push({t:"spell",x:e.x,y:e.y,r:e.r,kind:e.kind,age:0,dur:.55,side:e.side});
        shakeT=.22; shakeM=9; }
      else if(e.t==="desert"){
        if(e.recall) SFX.recall(); else SFX.desert();
        fx.push({t:"desert",x:e.x,y:e.y,to:e.to,age:0,dur:.75});
        shakeT=.18; shakeM=6;
        if(!e.recall) banner(e.to==="me"?"¡Desertó para vos!":"¡Te desertó una tropa!", e.to==="me"?"#9bd4f2":"#f3a299");
      }
      else if(e.t==="recallDone" && e.n>0){ banner(e.side==="me"?"Volvieron "+e.n:"Le volvieron "+e.n, "#f0c44a"); }
      else if(e.t==="towerFall"){ SFX.fall(); fx.push({t:"towerFall",x:e.x,y:e.y,age:0,dur:.9});
        shakeT=.5; shakeM=18;
        banner(e.side==="me"?"Perdiste una torre":"¡Torre derribada!", e.side==="me"?"#f3a299":"#9bd4f2"); }
    }
  }
  var bnT=0;
  function banner(txt,col){
    var b=$("banner"); b.textContent=txt; b.style.color=col;
    b.classList.remove("show"); void b.offsetWidth; b.classList.add("show"); bnT=1.5;
  }

  /* ─────────── HUD ─────────── */
  function hud(){
    var S=DES.state();
    var left=Math.max(0,DES.MATCH-S.t);
    $("clk").textContent=Math.floor(left/60)+":"+String(Math.floor(left%60)).padStart(2,"0");
    $("x2").hidden=!DES.doubleElixir();
    $("crM").textContent=DES.crowns("me"); $("crF").textContent=DES.crowns("foe");

    var e=S.elix.me, full=Math.floor(e), frac=e-full, bar=$("elixbar");
    if(bar.children.length!==DES.MAXE){ bar.innerHTML=""; for(var i=0;i<DES.MAXE;i++) bar.appendChild(document.createElement("i")); }
    for(var j=0;j<DES.MAXE;j++){
      var el=bar.children[j];
      el.className = j<full ? "on" : (j===full && frac>0.02 ? "part" : "");
      if(j===full) el.style.setProperty("--p",(frac*100).toFixed(0)+"%");
    }
    $("elixn").textContent=full;

    var adv=Math.round(((S.spent.foe-S.spent.me)+(S.elix.me-S.elix.foe))*10)/10;
    if(Object.is(adv,-0)) adv=0;
    $("advN").textContent=(adv>0?"+":"")+adv.toFixed(1);
    var bi=$("advI"); bi.className=adv<0?"neg":"";
    bi.style.transform="scaleX("+Math.min(1,Math.abs(adv)/8)+")";
    $("desN").textContent=S.deserts.me+"–"+S.deserts.foe;

    var h=$("hand"), sig=S.hand.me.join(",")+"|"+sel+"|"+full;
    if(h.dataset.sig!==sig){
      h.dataset.sig=sig; h.innerHTML="";
      S.hand.me.forEach(function(key){
        var C=DES.CARDS[key], aff=C.cost<=S.elix.me;
        var b=document.createElement("button");
        b.type="button"; b.className="card"+(sel===key?" sel":"")+(aff?"":" off")+(C.vet?" vet":"");
        var cst=document.createElement("span"); cst.className="cst"; cst.textContent=C.cost; b.appendChild(cst);
        b.appendChild(cardArt(key,42));
        var nm=document.createElement("span"); nm.className="nm2"; nm.textContent=C.name; b.appendChild(nm);
        if(C.vet){ var vt=document.createElement("span"); vt.className="vtag"; vt.textContent="VET"; b.appendChild(vt); }
        if(!aff){ var f=document.createElement("span"); f.className="fill";
          f.style.height=Math.round((1-S.elix.me/C.cost)*100)+"%"; b.appendChild(f); }
        b.addEventListener("click",function(){
          if(!aff) return; ac();
          sel = sel===key ? null : key; h.dataset.sig="";
          if(sel) toast(C.name+" · "+C.cost+" elixir", hint(key));
        });
        h.appendChild(b);
      });
    }
    var nx=S.queue.me[S.queue.me.length-1], nw=$("nextWrap");
    if(nw.dataset.k!==nx){ nw.dataset.k=nx; nw.innerHTML=""; if(nx) nw.appendChild(cardArt(nx,21)); }

    var fc=$("foeCards"), fsig=S.hand.foe.join(",")+"|"+S.queue.foe[S.queue.foe.length-1];
    if(fc.dataset.sig!==fsig){
      fc.dataset.sig=fsig; fc.innerHTML="";
      S.hand.foe.forEach(function(k){
        var C=DES.CARDS[k], d=document.createElement("span");
        d.className="fc"+(C.vet?" v":"");
        d.innerHTML='<em>'+C.cost+'</em>'+C.name; fc.appendChild(d);
      });
      var n2=S.queue.foe[S.queue.foe.length-1];
      if(n2){ var d2=document.createElement("span"); d2.className="fc nx"+(DES.CARDS[n2].vet?" v":"");
        d2.innerHTML='<em>'+DES.CARDS[n2].cost+'</em>'+DES.CARDS[n2].name; fc.appendChild(d2); }
    }
  }
  function hint(k){
    return { reclutas:"Tres cuerpos baratos. No desertan: caen y ya.",
      estandarte:"Trae de vuelta a los tuyos que desertaron. Castiga al que se apoya en ellos.",
      alabardero:"VETERANO: si lo matan en combate, pelea para el otro.",
      ballesteras:"Pegan de lejos y no desertan. Cambio seguro.",
      mina:"Edificio. Lo que mata, lo destruye: nunca regala deserciones.",
      purga:"Daño en área que DESTRUYE. Es la respuesta a un ejército de desertores.",
      ariete:"VETERANO rápido, sólo pega edificios. Perderlo duele doble.",
      coloso:"VETERANO enorme. Si te lo dan vuelta, se te viene encima." }[k]||"";
  }
  var tT=0;
  function toast(a,b){ var t=$("toast"); t.innerHTML="<b>"+a+"</b>"+(b?"<br>"+b:""); t.hidden=false; tT=2.6; }

  /* ─────────── entrada ─────────── */
  function at(ev){
    var S=DES.state();
    if(S.over||paused) return;
    var p=ev.touches?ev.touches[0]:ev, r=cv.getBoundingClientRect();
    var x=(p.clientX-r.left)/SC, y=(p.clientY-r.top)/SC;
    if(x<0||y<0||x>W||y>H||!sel) return;
    var C=DES.CARDS[sel];
    if(!C.spell && !DES.canDeploy("me",x,y)){ toast("Ahí no","Sólo en tu mitad del campo."); return; }
    if(DES.deploy("me",sel,x,y)){ sel=null; $("hand").dataset.sig=""; }
  }
  cv.addEventListener("click",at);
  cv.addEventListener("touchstart",function(e){ e.preventDefault(); at(e); },{passive:false});

  $("btnPause").addEventListener("click",function(){
    var S=DES.state(); if(S.over) return;
    paused=!paused; $("btnPause").classList.toggle("on",paused);
    $("btnPause").textContent=paused?"Seguir":"Pausa";
    if(paused) toast("En pausa","Mirá la mano del rival y calculá el cambio.");
  });
  $("btnHelp").addEventListener("click",function(){
    help=!help; $("btnHelp").classList.toggle("on",help);
    if(help) toast("Las tropas no mueren: desertan",
      "Si tu tropa vence a una VETERANA rival, esa tropa pasa a pelear para vos. Si la matan tu torre o un hechizo, se destruye. Las cartas con borde dorado son las que desertan.");
    else $("toast").hidden=true;
  });

  function finish(){
    var S=DES.state(), cm=DES.crowns("me"), cf=DES.crowns("foe");
    var won=S.over==="me", draw=S.over==="draw";
    won?SFX.win():SFX.lose();
    $("overBox").innerHTML='<div class="over'+(won?"":(draw?" draw":" lose"))+'">'+
      '<h2>'+(draw?"Empate":(won?"Ganaste":"Perdiste"))+'</h2>'+
      '<div class="big"><span>'+cm+'</span><i>—</i><b>'+cf+'</b></div>'+
      '<p>Desertaron para vos <b style="color:var(--me-lt)">'+S.deserts.me+'</b> y para el rival '+
      '<b style="color:var(--foe-lt)">'+S.deserts.foe+'</b>.<br>'+
      'Ventaja final de elixir: '+((S.spent.foe-S.spent.me)>=0?"+":"")+(S.spent.foe-S.spent.me)+'.</p>'+
      '<button class="btn" id="btnAgain" type="button">Otra partida</button></div>';
    $("btnAgain").addEventListener("click",boot);
  }

  var last=0, acc=0, STEP=1/60;
  function loop(ts){
    requestAnimationFrame(loop);
    if(!last) last=ts;
    var dt=Math.min(.1,(ts-last)/1000); last=ts;
    // el alto disponible cambia cuando la mano y las filas terminan de acomodarse
    var wr=$("fieldwrap").getBoundingClientRect();
    if(Math.round(wr.width)!==lastW||Math.round(wr.height)!==lastH) fit();
    var S=DES.state();
    if(!S.over && !paused){ acc+=dt; while(acc>=STEP){ DES.tick(STEP); acc-=STEP; if(DES.state().over) break; } }
    pump();
    for(var i=fx.length-1;i>=0;i--){ fx[i].age+=dt; if(fx[i].age>fx[i].dur) fx.splice(i,1); }
    if(tT>0){ tT-=dt; if(tT<=0 && !help) $("toast").hidden=true; }
    if(bnT>0) bnT-=dt;
    if(shakeT>0) shakeT-=dt;

    cx.save();
    if(shakeT>0){ var k=shakeT/.5;
      cx.translate((Math.random()-.5)*shakeM*k,(Math.random()-.5)*shakeM*k); }
    cx.clearRect(-30,-30,W+60,H+60);
    drawField();
    DES.state().towers.forEach(drawTower);
    DES.state().units.forEach(drawUnit);
    fx.forEach(drawFX);
    cx.restore();

    hud();
    if(DES.state().over && !$("overBox").firstChild) finish();
  }

  function boot(){
    DES.start(); fx.length=0; sel=null; paused=false; last=0; acc=0;
    $("overBox").innerHTML=""; $("hand").dataset.sig=""; $("foeCards").dataset.sig=""; $("nextWrap").dataset.k="";
    $("btnPause").classList.remove("on"); $("btnPause").textContent="Pausa";
    fit();
    toast("Las tropas no mueren: desertan","Vencé a una VETERANA rival con tus tropas y se pasa a tu bando. Tocá una carta y después tu mitad del campo.");
    tT=5;
  }

  boot();
  requestAnimationFrame(loop);
  return { fit:fit, boot:boot };
})();
</script>
</body>
</html>
```

---

## 2. PROYECTO ANDROID

### 2.1 `package.json`
```json
{
  "name": "desercion",
  "version": "1.0.0",
  "private": true,
  "description": "Desercion - arena en tiempo real donde las tropas veteranas cambian de bando",
  "scripts": {
    "sync": "cap sync android",
    "open": "cap open android"
  },
  "devDependencies": {
    "@capacitor/cli": "6.2.0"
  },
  "dependencies": {
    "@capacitor/android": "6.2.0",
    "@capacitor/core": "6.2.0"
  }
}
```

### 2.2 `capacitor.config.json`
```json
{
  "appId": "uy.rick.desercion",
  "appName": "Desercion",
  "webDir": "www",
  "bundledWebRuntime": false,
  "android": {
    "backgroundColor": "#0d1316",
    "allowMixedContent": false,
    "webContentsDebuggingEnabled": false
  },
  "server": {
    "androidScheme": "https"
  }
}
```

### 2.3 AndroidManifest — bloque activity (VERTICAL)
```xml
<!-- android/app/src/main/AndroidManifest.xml
     Sustituir el bloque <activity> por este. Claves:
     screenOrientation=portrait -> bloquea VERTICAL (la arena es de calles verticales)
     Theme.NoActionBar           -> saca la barra de titulo
     configChanges               -> evita que la WebView se recree y se pierda la partida -->
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name=".MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:screenOrientation="portrait"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

### 2.4 `res/values/styles.xml`
```xml
<!-- android/app/src/main/res/values/styles.xml
     Fondo del splash y de la ventana en el mismo tono que el juego (#0e1618),
     para que no haya flash blanco al abrir. -->
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar" />

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@color/ink</item>
        <item name="android:statusBarColor">@color/ink</item>
        <item name="android:navigationBarColor">@color/ink</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="android:statusBarColor">@color/ink</item>
        <item name="android:navigationBarColor">@color/ink</item>
    </style>
</resources>
```

### 2.5 `res/values/colors.xml`
```xml
<!-- android/app/src/main/res/values/colors.xml -->
<resources>
    <color name="ink">#FF0D1316</color>
    <color name="citrus">#FFF2A516</color>
    <color name="ic_launcher_background">#FF0D1316</color>
</resources>
```

### 2.6 `res/drawable/splash.xml`
```xml
<!-- android/app/src/main/res/drawable/splash.xml -->
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/ink" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/ic_launcher_foreground" />
    </item>
</layer-list>
```

### 2.7 Icono vectorial
```xml
<!-- android/app/src/main/res/drawable/ic_launcher_foreground.xml
     Icono: dos flechas cruzando de bando. Vector puro, sin PNG. -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#4AA3D8"
        android:pathData="M30,38 L62,38 L62,28 L80,46 L62,64 L62,54 L30,54 Z" />
    <path android:fillColor="#D9574E"
        android:pathData="M78,70 L46,70 L46,80 L28,62 L46,44 L46,54 L78,54 Z" />
    <path android:fillColor="#DFA83F"
        android:pathData="M54,20 m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0" />
</vector>
```

### 2.8 `res/mipmap-anydpi-v26/ic_launcher.xml`
```xml
<!-- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
     y el mismo contenido en ic_launcher_round.xml -->
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
```

### 2.9 `android/app/build.gradle`
```gradle
// android/app/build.gradle - bloques a ajustar

android {
    namespace "uy.rick.desercion"
    compileSdk 35

    defaultConfig {
        applicationId "uy.rick.desercion"   // NO se puede cambiar despues de publicar
        minSdkVersion 23
        targetSdkVersion 35
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_PATH") ?: "prensa-citrica.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS") ?: "prensacitrica"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false        // el JS va en assets, R8 no lo toca
            shrinkResources false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2.10 `MainActivity.java`
```java
// android/app/src/main/java/uy/rick/prensacitrica/MainActivity.java
// Capacitor genera este archivo. Agregar solo lo marcado para modo inmersivo
// y para que la pantalla no se apague durante una partida.
package uy.rick.desercion;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // El juego dibuja hasta el borde; el CSS ya respeta env(safe-area-inset-*).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // La barra de navegacion se esconde pero vuelve al deslizar.
        WindowInsetsControllerCompat c =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.hide(WindowInsetsCompat.Type.navigationBars());
        c.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

        // Sin esto la pantalla se apaga mientras el jugador piensa su turno.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
}
```

### 2.11 `build.sh`
```bash
#!/usr/bin/env bash
# Desercion - de index.html a APK firmado.
# Requisitos: Node 18+, JDK 17, Android SDK (API 35), Android Studio.
set -euo pipefail

APP_ID="uy.rick.desercion"
APP_NAME="Desercion"

# 1. Proyecto y dependencias
npm install

# 2. El juego entero vive en www/index.html
mkdir -p www
# (copiar aqui el index.html entregado)
test -f www/index.html || { echo "Falta www/index.html"; exit 1; }

# 3. Plataforma Android
npx cap add android || true
npx cap sync android

# 4. Keystore (UNA sola vez - guardalo, sin el no podes actualizar la app nunca mas)
if [ ! -f desercion.keystore ]; then
  keytool -genkey -v \
    -keystore desercion.keystore \
    -alias prensacitrica \
    -keyalg RSA -keysize 2048 -validity 10000
fi

# 5. Build
export KEYSTORE_PATH="$(pwd)/desercion.keystore"
cd android

./gradlew assembleDebug      # APK de prueba, instalable directo
echo "Debug  -> android/app/build/outputs/apk/debug/app-debug.apk"

# Para Play Store hace falta el .aab, no el .apk:
# ./gradlew bundleRelease
# echo "Bundle -> android/app/build/outputs/bundle/release/app-release.aab"
```

---

## 3. PASOS

```bash
mkdir desercion && cd desercion
npm install
mkdir www                      # pegar index.html adentro
npx cap add android
npx cap sync android
# aplicar los fragmentos de la sección 2
cd android && ./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`
Play Store necesita `.aab`: `./gradlew bundleRelease`

**Si ya compilaste una versión anterior:** Capacitor copia el `index.html` dentro del APK
en el momento del build. Reemplazá `www/index.html`, corré `npx cap sync android` y
recompilá, o Rick sigue viendo la versión vieja. **Esto ya pasó antes.**

---

## 4. TRAMPAS

**El keystore es irreemplazable.** Perderlo significa no poder actualizar nunca más la app
en Play Store. Guardalo fuera del repo, con backup.

**El applicationId es permanente** una vez publicada la primera versión.

**El audio necesita un toque previo.** Android bloquea WebAudio hasta la primera
interacción. Construí el grafo ahí, no al cargar.

**Un solo reverb compartido.** Uno por sonido mata un celular de gama media.

**Paso fijo obligatorio.** Ya está dicho arriba, pero es el error que más fácil se comete.

**El canvas mide 0 mientras su contenedor no terminó de acomodarse.** La versión actual
remide en cada cuadro comparando el tamaño del contenedor; si cambiás eso, el canvas se
desborda y tapa el HUD. Ya me pasó.

**No habilites `minifyEnabled`.** El JS vive en assets, R8 no lo procesa.

**`configChanges` en el manifest es obligatorio**, o se pierde la partida en curso.

**Sin permisos.** El juego no usa red, cámara ni almacenamiento. `navigator.vibrate()` no
necesita permiso. Pedir permisos de más es motivo de rechazo en Play.

**Google Fonts es la única llamada externa.** Para 100% offline, sacá el `<link>`.

---

## 5. LO QUE NO TENÉS QUE HACER

- No modifiques `DES`. Ni el balance, ni las reglas de deserción, ni las estadísticas de
  las cartas
- **No pongas a desertar a los Reclutas ni a las Ballesteras.** Es lo primero que uno
  querría hacer y rompe el juego: 45 deserciones por partido y bola de nieve del 65%.
  Está medido, sección 7 del brief
- No hagas que los edificios ni las torres conviertan. Tienen que destruir
- No agregues archivos de imagen ni de audio. Todo generado
- No agregues modos de juego, multijugador ni cuentas de usuario
- **Nada de assets, nombres, personajes ni arte de Clash Royale ni de ningún otro juego.**
  Tiene que ser original. Es lo más importante de esta lista
- No agregues cuentas de usuario, multijugador, modos nuevos ni construcción de mazo. Eso
  lo decide Rick

---

## 6. PENDIENTE (decisión de Rick, no tuya)

- **Testeo con jugadores reales.** Nadie lo jugó. Mi balance sale de dos jugadores
  automáticos conservadores, que es un proxy pobre
- Construcción de mazo: hoy las ocho cartas son fijas. Es de donde sale la profundidad
  real en este género
- Más cartas, una vez que el núcleo esté probado
- Ficha de Play Store: capturas, descripción, clasificación por edad

---

# DESERCIÓN — BRIEF DE ARTE Y EFECTOS

**De:** Claude (Anthropic) · **Para:** Grok (xAI) · **Cliente:** Rick

Yo hice el motor y el balance. **Vos hacés todos los gráficos y todos los efectos.**

```
DES  →  motor en tiempo real. CERO DOM, cero dibujo.   NO TOCAR: el balance está medido.
ART  →  todo lo visual y sonoro.                       ESTO ES TUYO, ENTERO.
```

El objetivo es **calidad de Clash Royale**: 3D estilizado, lectura instantánea, animación
con peso, efectos que se sienten. Lo que hay ahora son formas geométricas planas: es un
andamio para que el juego se pueda probar, no una propuesta visual. Tiralo.

---

## 0. QUÉ ESTÁ CERRADO Y QUÉ ES TUYO

Esto es lo primero que tenés que leer, porque define tu margen.

**CERRADO — está medido con cientos de partidas simuladas:**

- Las reglas de deserción: sólo desertan las veteranas, dos cambios máximo, 40% de vida al
  cambiar, los edificios y las torres destruyen en vez de convertir (§7)
- La disciplina de arquitectura: el motor no dibuja ni toca el DOM, y `DES.tick` va a paso
  fijo de 1/60

**ABIERTO — es tuyo y Rick quiere que lo uses:**

- **Todo el arte, todos los efectos y todo el sonido.** Sin excepción
- **El mundo y la ambientación.** Ver abajo: esto es lo que más importa
- Las proporciones del campo, la cantidad de torres, la forma de la arena
- Los nombres y el aspecto de las ocho cartas
- Cualquier capa visual que quieras agregar

### El encargo real de Rick

Rick miró esta versión y dijo, con razón, que **sigue pareciendo Clash Royale**. Tiene
razón: la mecánica de deserción es nueva, pero el marco que la rodea —dos calles, un río
con dos puentes, tres torres por lado, el elixir en la esquina— es Clash Royale calcado.
Yo cambié la mecánica y no cambié el mundo.

**Tu encargo es cambiar el mundo.** Rick quiere algo que se sienta original, con la
*jugabilidad* de Clash Royale y la *profundidad de pensamiento* del ajedrez, pero que no
se vea ni se lea como una copia.

Cosas que podés reemplazar y que te invito a reemplazar:

| Hoy (prestado de Clash Royale) | Pensá en otra cosa |
|---|---|
| Dos calles separadas por un río con puentes | Cualquier geometría que genere cuellos de botella: un desfiladero, una grieta, una red de corredores, un tablero con pasos marcados |
| Tres torres en fila al fondo | Otra condición de victoria espacial que siga siendo legible de un vistazo |
| Césped verde y agua azul | Cualquier mundo: hay un bando que convence tropas del otro — eso sugiere estandartes, fe, dinero, miedo. Elegí uno y comprometete |
| "Elixir" en una barra morada | El mismo recurso con otro nombre, otra forma y otra lectura |
| Nombres genéricos de tropas | Nombres que vengan del mundo que elijas |

Lo único que la jugabilidad necesita del espacio es: **dos lados, caminos que obliguen a
elegir por dónde atacar, y objetivos al fondo que se puedan derribar**. Todo lo demás es
decisión tuya.

Si cambiás la geometría, avisá qué constantes del motor hay que mover (`DES.W`, `DES.H`,
`DES.RT`, `DES.RB`, `DES.BR`, `DES.BRW`) y las posiciones de las torres. Son números, no
reglas: moverlos no rompe el balance medido mientras mantengas las distancias relativas.

---

## 1. QUÉ ES ESTE JUEGO Y POR QUÉ ES NUEVO

Arena 1v1 en tiempo real, vertical, dos calles, río con dos puentes, tres torres por lado.
Elixir que se regenera, mano de cuatro cartas que cicla. Hasta ahí, Clash Royale.

**La mecánica nueva: las tropas veteranas no mueren, desertan.**

Cuando una tropa tuya reduce a cero a una tropa **veterana** rival, esa tropa **cambia de
bando** y sigue peleando para vos, con el 40% de su vida máxima. Ese 40% pasa a ser su
nuevo máximo: cada vez que cambia de manos se marchita. Al segundo cambio, se destruye.

Eso crea tres maneras distintas de sacar una tropa del tablero, y cada una cuesta algo
diferente. Es la decisión central del juego:

| Forma | Resultado | Costo |
|---|---|---|
| **Tu torre** la mata | Se destruye, limpio | Gratis, pero sólo cerca de tus torres |
| **Un hechizo** la mata | Se destruye, limpio | Elixir |
| **Una tropa tuya** la mata | **Deserta y pelea para vos** | Elixir, y arriesgás armar al rival |

Perder una pelea no te cuesta una tropa: **se la regalás al rival**. Por eso el jugador
calcula antes de cada combate, y por eso esto atrae a las tres audiencias que pidió Rick:
los de Clash Royale juegan igual, los ajedrecistas reconocen la captura de material, y
cualquiera entiende el drama en diez segundos.

**Sólo tres cartas desertan:** Alabardero, Ariete y Coloso. Están marcadas como
**VETERANAS** y tienen borde dorado. Las demás caen y ya está. Esto está medido: ver §7.

---

## 2. ESTO ES TODO LO QUE SE TIENE QUE VER

Inventario cerrado. **Si algo no está acá, no va en pantalla.**

### 2.1 La arena

Campo vertical de 1000 × 1700 unidades. El río cruza de 760 a 880. Los puentes están
centrados en x=260 y x=740, con 84 unidades de medio ancho.

| Elemento | Qué es |
|---|---|
| **Césped** | Dos mitades, la de arriba del rival y la de abajo tuya, con tono apenas distinto |
| **Río** | Corre de lado a lado. **Tiene que verse agua en movimiento**, no una franja azul |
| **Puentes** | Dos, de madera con tablones. Es por donde pasa todo: son el punto caliente |
| **Línea de media cancha** | Marca punteada vertical, discreta |
| **Zona de despliegue** | Cuando el jugador tiene una carta elegida, su mitad se ilumina. Al caer una torre guardiana rival, se abre esa mitad de la calle: hay que **verse cómo se extiende** |
| **Bordes** | La arena está rodeada de oscuridad; nada se dibuja fuera |

### 2.2 Las torres

Tres por lado: dos **guardianas** (1000 de vida) en las calles y un **trono** (1700) al
fondo. El trono arranca apagado y **se enciende** cuando le pegan a cualquier torre propia
o cae una guardiana. Eso debe notarse: apagado se ve inerte y oscurecido, encendido se ve
vivo y disparando.

Cada torre necesita: vida visible, estado de apagada/encendida, disparo hacia su objetivo,
daño recibido, y una **caída espectacular** cuando llega a cero.

### 2.3 Las ocho cartas

| Carta | Elixir | Qué es | Veterana |
|---|---|---|---|
| **Reclutas** | 2 | Tres cuerpos baratos, rápidos, débiles | no |
| **Estandarte** | 2 | Hechizo: recupera a tus desertores en el área | — |
| **Alabardero** | 3 | Un bruto de cuerpo a cuerpo | **SÍ** |
| **Ballesteras** | 3 | Dos tiradoras de largo alcance | no |
| **Mina** | 3 | Edificio defensivo, dura 30s, destruye lo que mata | no |
| **Purga** | 3 | Hechizo: daño en área que **destruye** (no deserta) | — |
| **Ariete** | 4 | Rápido, sólo pega edificios | **SÍ** |
| **Coloso** | 5 | Tanque enorme, sólo pega edificios | **SÍ** |

Cada tropa necesita, como mínimo: **reposo, caminar, atacar, recibir daño, morir**. Las
veteranas necesitan además **desertar** (§3).

**Las veteranas tienen que leerse como veteranas de un vistazo**, aun fuera del juego: más
armadura, más cicatrices, un estandarte propio, lo que elijas. El jugador tiene que saber
cuáles son sin leer el texto.

Cuando una tropa deserta, **cambia de color de bando y conserva su forma**. El jugador
tiene que reconocer "ese Coloso era mío". No la rediseñes al cambiar de bando: repintala.

### 2.4 El HUD

| Zona | Qué muestra |
|---|---|
| Arriba | Nombre, coronas, el ×2 de elixir doble, el reloj |
| Debajo | Ventaja de elixir y marcador de desertores |
| Sobre la arena | Cartel grande cuando deserta una tropa o cae una torre |
| Debajo de la arena | La mano del rival, a la vista, con las veteranas marcadas |
| Abajo | Barra de elixir, cuatro cartas, próxima carta, botones |

**La mano del rival se ve siempre.** No es un error: es la capa de cálculo. El jugador
tiene que poder pensar "tiene Purga en mano, no le mando los Reclutas juntos".

### 2.5 Lo que NO va

- Nada de marcas, logos, personajes ni assets de Clash Royale ni de ningún otro juego.
  **Tiene que ser arte original.** Esto es lo más importante de esta lista, y no es sólo
  legal: es el encargo. Si se parece, fallamos
- Nada de sangre ni gore: es un juego de arena, no de violencia
- Nada de texto en inglés: el juego es rioplatense

El inventario de arriba describe **lo que el juego necesita que exista funcionalmente**,
no una lista cerrada de formas. Si tu mundo pide otros elementos, agregalos; lo único que
no puede faltar es que cada cosa que el motor necesita mostrar tenga una representación
clara en pantalla.

---

## 3. LA DESERCIÓN — EL EFECTO MÁS IMPORTANTE DEL JUEGO

Si un solo efecto queda perfecto, que sea éste. Es lo que hace memorable al juego y lo que
va a aparecer en cada video que alguien grabe.

Secuencia, en orden:

1. **Congelado.** La tropa vencida se queda quieta un instante, con el golpe final marcado
2. **Fractura de color.** Su color de bando se **agrieta y se desprende** como una cáscara,
   dejando ver debajo el color del bando que la venció
3. **Onda doble.** Un anillo del color viejo que se expande y se desvanece, y otro del color
   nuevo que se contrae hacia la tropa
4. **Giro.** La tropa gira sobre sí misma y **se da vuelta** hacia su antiguo bando
5. **Símbolo.** El símbolo de deserción sube desde la tropa y se disuelve
6. **Marchitamiento.** Queda más chica y más apagada que antes: perdió vida máxima. A la
   segunda deserción se ve claramente gastada
7. **Sacudón de pantalla** corto y **vibración** del teléfono
8. **Cartel** sobre la arena: «¡Desertó para vos!» o «¡Te desertó una tropa!»

El sonido tiene que ser **ascendente y mecánico a la vez**: algo que se traba en una
posición nueva. Tres notas que suben, con un roce metálico encima. Que dé ganas de que
pase otra vez cuando es a favor, y que duela cuando es en contra.

**El Estandarte** (recuperar desertores) usa la misma gramática visual pero **al revés**:
la onda va hacia adentro, el color vuelve de golpe en vez de agrietarse, y el sonido son
las mismas tres notas en orden descendente.

---

## 4. TODOS LOS DEMÁS EFECTOS

| Evento | Qué tiene que verse | Qué tiene que oírse |
|---|---|---|
| **Despliegue** | Un destello en el suelo, la tropa **cae desde arriba** y levanta polvo al aterrizar | Golpe sordo + un chasquido de aparición |
| **Golpe cuerpo a cuerpo** | Chispa en el punto de impacto, la tropa golpeada **retrocede** un poco | Impacto corto y seco, distinto según si pega metal o cuerpo |
| **Disparo de ballestera** | **El proyectil viaja**, no un rayo instantáneo. Deja estela fina | Cuerda que suelta + impacto al llegar |
| **Disparo de torre** | Proyectil pesado con arco, polvo al impactar | Más grave que la ballestera |
| **Muerte normal** (no veterana) | Se desarma en pedazos que caen y se desvanecen | Golpe seco y corto |
| **Muerte por hechizo** | Se **desintegra** desde los bordes hacia el centro | Siseo que se apaga |
| **Purga** | Onda expansiva violeta, el césped se oscurece un instante, todo lo alcanzado parpadea | Golpe grave + siseo largo |
| **Estandarte** | Onda dorada que converge, los recuperados brillan | Tres notas descendentes |
| **Mina** colocada | Se clava en el suelo, tierra que salta | Metal que se hinca |
| **Mina** expirando | Se hunde y desaparece | Mecanismo que se afloja |
| **Torre recibiendo daño** | Esquirlas, grietas que se acumulan según la vida que le queda | Piedra golpeada |
| **Torre cayendo** | **Se derrumba de verdad**: se parte, cae en pedazos, polvo, onda expansiva, sacudón fuerte | Derrumbe largo con cola |
| **Trono encendiéndose** | Se ilumina, despierta | Campana grave |
| **Elixir doble** | La barra cambia, pulso en el HUD | Repique ascendente |
| **Último medio minuto** | El reloj late, el borde de la arena pulsa | Tictac que se acelera |
| **Victoria / derrota** | Pantalla final con las coronas y el recuento de desertores | Fanfarria / caída |

**Reglas de efectos:**

- **Todo generado o vectorial. Ningún archivo de imagen ni de audio.** El peso del APK
  importa y el juego tiene que funcionar sin internet
- **60 fps en un celular de gama media.** Si un efecto no entra, bajalo; no lo saques
- **Variación:** ningún golpe suena ni se ve idéntico dos veces. Variá tono ±4% y el ataque
- **Un solo reverb compartido** en el grafo de audio. Uno por sonido mata el rendimiento
- El audio se desbloquea con el **primer toque**: el grafo complejo se construye ahí, no al
  cargar, o Android lo bloquea

---

## 5. CONTRATO: CÓMO HABLÁS CON EL MOTOR

El motor no dibuja nada y no toca el DOM. Vos leés el estado y vaciás la cola de eventos.

```js
DES.start()                      // nueva partida
DES.tick(dt)                     // avanzar la simulación. Usá paso fijo de 1/60
DES.state()                      // el estado completo (abajo)
DES.drain()                      // devuelve los eventos nuevos y vacía la cola
DES.deploy(side, key, x, y)      // desplegar. side "me"|"foe". Devuelve true si entró
DES.canDeploy(side, x, y)        // si esa posición es legal
DES.doubleElixir()               // si estamos en elixir doble
DES.crowns(side)                 // torres derribadas por ese lado
```

Constantes que te sirven para dibujar: `DES.W, DES.H, DES.RT, DES.RB, DES.BR, DES.BRW,
DES.MATCH, DES.DOUBLE, DES.MAXE, DES.CARDS, DES.DECK, DES.VETS, DES.DESERT_HP, DES.DESERT_MAX`.

### El estado

```js
{
  t,                                  // segundos transcurridos
  over: null | "me" | "foe" | "draw",
  elix:{me,foe},                      // 0..10, con decimales
  spent:{me,foe},                     // elixir gastado en todo el partido
  deserts:{me,foe},                   // deserciones ganadas por cada lado
  hand:{me:[key],foe:[key]},          // las dos manos: la del rival se muestra
  queue:{me:[],foe:[]},               // el último del array es la próxima carta
  units:[{
    id, side, origin,                 // origin = de quién era al nacer
    key, art,                         // art = qué figura dibujar
    x, y, hp, max, base,              // base = vida original, max = la actual tras marchitarse
    turns,                            // cuántas veces desertó: 0, 1 o 2
    vet,                              // si puede desertar
    r, spd, dmg, rate, range, sight,
    onlyB, build, born, life, tgt
  }],
  towers:[{ id, side, kind, lane, x, y, hp, max, dmg, rate, range, r, on }]
}
```

`kind` es `"guard"` o `"throne"`. `on` es si la torre está activa. `lane` es 0 (izquierda)
o 1 (derecha), y -1 para el trono.

### Los eventos

Cada uno es un efecto que tenés que dibujar y sonar:

```js
{t:"spawn",     x, y, side, art}                    // apareció una tropa
{t:"hit",       x, y, dmg, side, tower?}            // golpe
{t:"shot",      x, y, tx, ty, side}                 // disparo de torre
{t:"spell",     x, y, r, kind, side}                // kind: "purga" | "estandarte"
{t:"desert",    x, y, to, id, turns, art, recall?}  // ← EL IMPORTANTE
{t:"recallDone",n, side}                            // cuántos volvieron con el Estandarte
{t:"destroy",   x, y, side, art, why}               // why: spell|tower|expire|withered
{t:"towerFall", x, y, side, kind}                   // cayó una torre
```

En `desert`, `to` es el bando que la gana y `turns` cuántas veces ya cambió de manos
(1 o 2). Con `recall:true` es el Estandarte, no un combate.

### Cómo se arma el bucle

```js
var last=0, acc=0, STEP=1/60;
function loop(ts){
  requestAnimationFrame(loop);
  var dt=Math.min(.1,(ts-last)/1000); last=ts;
  if(!DES.state().over && !pausa){
    acc+=dt;
    while(acc>=STEP){ DES.tick(STEP); acc-=STEP; }   // paso fijo: no depende de los FPS
  }
  DES.drain().forEach(manejarEvento);                 // efectos y sonido
  dibujar();
}
```

El paso fijo es obligatorio: si pasás `dt` crudo, la simulación cambia según los FPS del
teléfono y el balance medido deja de valer.

---

## 6. QUÉ REEMPLAZAR, UNO POR UNO

La capa `ART` ya está dividida en funciones de dibujo. Reemplazalas de a una y el juego
sigue andando en cada paso:

```js
drawField()       // césped, río, puentes, línea de media cancha, zona de despliegue
drawTower(t)      // una torre, con su vida y su estado
drawUnit(u)       // una tropa, con su marca de veterana y su vida
drawFX(f)         // un efecto. f.t dice cuál
cardArt(key,size) // el dibujo de una carta para la mano
```

Si tu versión necesita más capas (sombras, partículas, iluminación), agregalas; lo único
que importa es que el motor siga recibiendo `DES.tick` a paso fijo y que `DES.deploy` se
llame cuando el jugador toca.

Si necesitás una librería, cargala de CDN con versión exacta y avisá. Si necesitás
imágenes, no: todo generado.

---

## 7. BALANCE YA MEDIDO — NO LO ROMPAS

Corrí 140 partidas por configuración con jugadores automáticos en los dos lados. Los
resultados están comentados en el código. Lo que hay que respetar:

**Sólo desertan las veteranas.** Lo probé de las dos formas:

| Configuración | Deserciones por partido | Bola de nieve |
|---|---|---|
| Todas las tropas desertan | **45** | **65%** |
| Sólo las veteranas | **13** | **52%** |

"Bola de nieve" es cuánto gana el primero que saca dos deserciones de ventaja. Con todas
las tropas desertando, la mecánica se vuelve ruido de fondo (una cada cuatro segundos) y
el que gana el primer cambio gana el partido: eso es un juego roto. Con sólo las veteranas,
hay una deserción cada catorce segundos — un evento dramático, no un goteo — y la ventaja
inicial no decide nada: 52% es azar puro.

**No pongas a desertar a los Reclutas ni a las Ballesteras.** Es lo primero que uno
querría hacer y es exactamente lo que rompe el juego.

**Dos cambios como máximo** (`DESERT_MAX = 2`) y **40% de vida** al cambiar
(`DESERT_HP = 0.40`). El marchitamiento es lo que impide que una tropa sea eterna.

**Los edificios y las torres destruyen, no convierten.** Si los hacés convertir,
defender deja de tener costo y el juego se cae.

Si cambiás un número, medilo igual que yo: simulación sin gráficos, cientos de partidas,
y mirá deserciones por partido y bola de nieve. No lo ajustes a ojo.

---

## 8. LO QUE TODAVÍA NO ESTÁ MEDIDO

Sé honesto con Rick sobre esto en vez de prometerle que está terminado:

- **Nadie lo jugó.** Mi balance sale de dos jugadores automáticos bastante conservadores:
  guardan 8 de elixir antes de atacar, no faroleen y no castigan errores. Un humano juega
  distinto
- En mis pruebas **sólo el 13% de los partidos termina derribando el trono**; el resto se
  define por torres al terminar el tiempo. En Clash Royale pasa algo parecido, pero esto
  hay que verlo con gente
- El mazo es **fijo**: las ocho cartas son siempre esas. La construcción de mazo es de
  donde sale la profundidad real en este género, y todavía no está
- La ventaja entre bandos en mi medición dio 55/38, pero las dos políticas automáticas no
  son idénticas, así que ese número **no prueba** que haya desbalance de reglas. Hace falta
  medirlo con humanos

---

## 9. ENTREGABLE

Un solo `index.html` con `DES` intacto y tu `ART` nuevo. Sin dependencias, sin archivos de
assets, sin build. Después va a Capacitor como está.

No agregues modos de juego, multijugador, cuentas de usuario ni construcción de mazo: eso
lo decide Rick y todavía no lo decidió.

Sí podés, y Rick quiere que lo hagas: **cambiar el mundo entero, el arte, los efectos, los
nombres, la geometría del campo y la identidad visual del juego.** Si al terminar no se
parece en nada a Clash Royale pero se juega igual de bien, el trabajo salió bien.

Si tomás una decisión fuerte de diseño, contala en una línea cuando entregues: Rick quiere
saber qué cambiaste y por qué.
