
/* ╔══════════════════════════════════════════════════════════════╗
   ║  ART — LAS SALINAS. Todo lo visual y sonoro.                  ║
   ║  Lee DES.state(), vacía DES.drain(), llama DES.tick a 1/60.   ║
   ║  No toca DES: misma geometría, otro mundo encima.             ║
   ╚══════════════════════════════════════════════════════════════╝ */
var ART=(function(){
  "use strict";
  function $(id){ return document.getElementById(id); }
  var W=DES.W, H=DES.H, RT=DES.RT, RB=DES.RB, BR=DES.BR, BRW=DES.BRW;
  var cv=$("field"), cx=cv.getContext("2d"), SC=1, DPR=1;
  var Q=new URLSearchParams(location.search), AUTO=Q.get("auto")==="1", FAST=Math.max(1,+(Q.get("fast")||1));
  var sel=null, paused=false, help=false, now=0, muted=false;

  /* ── el mundo ── */
  var NAMES={reclutas:"Peones",estandarte:"Pagaré",alabardero:"Capataz",ballesteras:"Honderas",
             mina:"Garita",purga:"Embargo",ariete:"Cobrador",coloso:"Acreedor"};
  var HINT={reclutas:"Tres jornaleros baratos y rápidos. No desertan: caen y ya.",
    estandarte:"Hacés valer el contrato: los tuyos que se pasaron vuelven a tu casa.",
    alabardero:"VETERANO. Si lo vence una tropa rival, cambia de patrón y pelea para el otro.",
    ballesteras:"Dos honderas de largo alcance. No desertan: cambio seguro.",
    mina:"Garita fija 30 s. Lo que voltea, lo destruye: nunca regala desertores.",
    purga:"Sello de embargo: daño en área que DESTRUYE. La respuesta a un ejército de desertores.",
    ariete:"VETERANO rápido con un cofre de hierro: sólo golpea almacenes.",
    coloso:"VETERANO enorme. Si te lo compran, se te viene encima." };
  function nm(k){ return NAMES[k]||k; }

  /* ── paletas: color de casa, y su marchitamiento por deserciones ── */
  function hx(h){ return [parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)]; }
  function mix(a,b,k){ var A=hx(a),B=hx(b); return "rgb("+Math.round(A[0]+(B[0]-A[0])*k)+","+Math.round(A[1]+(B[1]-A[1])*k)+","+Math.round(A[2]+(B[2]-A[2])*k)+")"; }
  var HOUSE={ me:{b:"#23b39b",lt:"#8ff0d8",dk:"#0b4f45"}, foe:{b:"#d6406a",lt:"#ffa3bd",dk:"#6a1431"} };
  var PAL={};
  ["me","foe"].forEach(function(s){ PAL[s]=[0,1,2].map(function(t){ var k=[0,.32,.58][t], g="#857c72";
    return {b:mix(HOUSE[s].b,g,k), lt:mix(HOUSE[s].lt,g,k*.8), dk:mix(HOUSE[s].dk,"#3a3530",k), side:s, worn:t}; }); });
  var OUT="#1d1410", SKIN="#e6b48c", SKIN2="#b9825e", METAL="#a9b2b6", METALD="#5d666b", WOOD="#7a4f2c", WOODD="#4a2f1a", GOLD="#e8b54a";

  /* ═══════════ AUDIO: grafo armado en el primer toque, un solo reverb ═══════════ */
  var AC=null, MST=null, REV=null, NB=null, lastS={};
  function audioInit(){
    if(AC){ if(AC.state==="suspended") AC.resume(); return; }
    try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=null; return; }
    var comp=AC.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4; comp.connect(AC.destination);
    MST=AC.createGain(); MST.gain.value=muted?0:.85; MST.connect(comp);
    var len=Math.floor(AC.sampleRate*1.6), ir=AC.createBuffer(2,len,AC.sampleRate);
    for(var c=0;c<2;c++){ var d=ir.getChannelData(c); for(var i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6); }
    var conv=AC.createConvolver(); conv.buffer=ir; REV=AC.createGain(); REV.gain.value=.22; REV.connect(conv); conv.connect(MST);
    NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate); var nd=NB.getChannelData(0); for(var j=0;j<nd.length;j++) nd[j]=Math.random()*2-1;
  }
  function vr(){ return 1+(Math.random()-.5)*.08; }           // ±4%
  function gate(k,ms){ var t=performance.now(); if(lastS[k]&&t-lastS[k]<ms) return false; lastS[k]=t; return true; }
  function out(node,wet){ node.connect(MST); if(wet) { var s=AC.createGain(); s.gain.value=wet; node.connect(s); s.connect(REV); } }
  function nz(at,dur,f0,q,vol,type,f1,wet){ if(!AC) return; var t=AC.currentTime+(at||0);
    var s=AC.createBufferSource(); s.buffer=NB; s.playbackRate.value=vr();
    var f=AC.createBiquadFilter(); f.type=type||"lowpass"; f.frequency.setValueAtTime(f0*vr(),t); f.Q.value=q||1;
    if(f1) f.frequency.exponentialRampToValueAtTime(f1,t+dur);
    var g=AC.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.012,dur*.2)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f); f.connect(g); out(g,wet); s.start(t,Math.random()*.5); s.stop(t+dur+.02); }
  function tn(at,f0,dur,vol,type,f1,wet,atk){ if(!AC) return; var t=AC.currentTime+(at||0), v=vr();
    var o=AC.createOscillator(), g=AC.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f0*v,t);
    if(f1) o.frequency.exponentialRampToValueAtTime(f1*v,t+dur);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(atk||.008)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); out(g,wet); o.start(t); o.stop(t+dur+.02); }
  function bell(at,f,dur,vol){ [1,2.76,5.4,8.9].forEach(function(m,i){ tn(at,f*m,dur/(1+i*.7),vol/(1+i*1.4),"sine",null,.6,.004); }); }
  var SFX={
    land:function(){ if(!gate("land",50)) return; tn(0,120,.16,.22,"sine",50); nz(0,.1,500,1,.18); nz(.05,.05,3200,4,.08,"bandpass"); },
    hitBody:function(){ if(!gate("hit",35)) return; nz(0,.06,900,1.2,.16,"lowpass"); tn(0,180,.06,.08,"sine",90); },
    hitMetal:function(){ if(!gate("hit",35)) return; nz(0,.05,3800,6,.12,"bandpass"); tn(0,1240,.12,.04,"triangle",1100,.2); tn(0,1730,.09,.025,"sine"); },
    sling:function(){ if(!gate("sl",40)) return; nz(0,.09,1800,2,.08,"bandpass",600); tn(0,520,.05,.05,"triangle",260); },
    pebble:function(){ if(!gate("pb",40)) return; nz(0,.04,2600,3,.08,"bandpass"); },
    tshot:function(){ if(!gate("ts",60)) return; tn(0,140,.18,.16,"sine",70); nz(0,.12,700,1.5,.12,"bandpass",300); },
    tland:function(){ if(!gate("tl",60)) return; nz(0,.18,420,1,.2); tn(0,90,.14,.12,"sine",45); },
    stone:function(){ if(!gate("st",60)) return; nz(0,.09,1500,2.5,.12,"bandpass"); tn(0,240,.07,.06,"square",160); },
    die:function(){ if(!gate("die",40)) return; nz(0,.12,600,1.3,.18); tn(0,160,.1,.09,"sine",60); },
    fizz:function(){ if(!gate("fz",50)) return; nz(0,.55,6000,1.5,.1,"highpass",1500,.3); },
    stake:function(){ nz(0,.12,500,1,.2); tn(.02,880,.25,.06,"triangle",820,.3); tn(.02,1320,.2,.04,"sine",null,.3); },
    unscrew:function(){ for(var i=0;i<4;i++) nz(i*.07,.04,2200-i*300,5,.07,"bandpass"); tn(.05,300,.4,.06,"sawtooth",90); },
    /* deserción: tres notas que suben + roce metálico + traba */
    desert:function(good){ var b=good?392:349;
      [1,1.335,1.682].forEach(function(m,i){ tn(i*.085,b*m,.24,.15,"triangle",null,.35); tn(i*.085,b*m*2.01,.14,.04,"square",null,.2); });
      nz(.02,.34,5200,8,.1,"bandpass",2400,.3); tn(.04,2900,.3,.025,"sawtooth",2100);
      nz(.27,.045,2400,3,.2,"bandpass"); tn(.27,170,.09,.14,"square",110);              // clac: se traba
      if(!good) tn(.3,98,.5,.12,"sawtooth",70,.3); },
    recall:function(){ [1.682,1.335,1].forEach(function(m,i){ tn(i*.085,440*m,.26,.14,"triangle",null,.4); });
      nz(0,.3,3000,4,.06,"bandpass",5200,.3); },
    purga:function(){ tn(0,70,.6,.35,"sine",32,.2); nz(0,.25,300,.8,.3); nz(.05,1.0,4200,1.2,.1,"highpass",900,.5); },
    pagare:function(){ nz(0,.4,2400,2,.06,"bandpass",5000,.4); },
    fall:function(){ nz(0,1.4,380,.7,.42,"lowpass",90,.4); tn(0,64,1.1,.32,"sine",30); for(var i=0;i<7;i++) nz(.08+i*.11+Math.random()*.05,.12,900+Math.random()*900,2,.12,"bandpass"); },
    wake:function(){ bell(0,98,2.4,.3); bell(.02,147,1.8,.12); },
    dbl:function(){ [523,659,784,1046,1318].forEach(function(f,i){ tn(i*.07,f,.3,.09,"triangle",null,.5); }); },
    tick:function(hi){ tn(0,hi?1760:1320,.05,.06,"square"); nz(0,.02,5000,4,.05,"bandpass"); },
    win:function(){ [523,659,784,1046].forEach(function(f,i){ tn(i*.13,f,.5,.14,"triangle",null,.5); tn(i*.13,f/2,.5,.07,"sine"); }); bell(.55,262,2,.15); },
    lose:function(){ [392,349,311,262].forEach(function(f,i){ tn(i*.18,f,.45,.12,"sawtooth",f*.94,.4); }); tn(.75,65,1.4,.25,"sine",40); },
    tap:function(){ tn(0,900,.04,.03,"sine",700); }
  };
  function buzz(p){ try{ if(navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); }catch(e){} }

  /* ═══════════ lienzo ═══════════ */
  var lastW=0,lastH=0, FIELD=null;
  function fit(){
    var r=$("fieldwrap").getBoundingClientRect();
    lastW=Math.round(r.width); lastH=Math.round(r.height);
    if(r.width<10||r.height<10) return;
    DPR=Math.min(window.devicePixelRatio||1,2);
    var sc=Math.min(r.width/W, r.height/H);
    cv.style.width=Math.floor(W*sc)+"px"; cv.style.height=Math.floor(H*sc)+"px";
    cv.width=Math.floor(W*sc*DPR); cv.height=Math.floor(H*sc*DPR);
    SC=sc; FIELD=bakeField(sc*DPR);
  }
  addEventListener("resize",fit);
  addEventListener("orientationchange",function(){ setTimeout(fit,140); });

  /* PRNG fijo: el mundo es el mismo en cada partida */
  function rng(seed){ var s=seed>>>0||1; return function(){ s^=s<<13; s^=s>>>17; s^=s<<5; return ((s>>>0)%100000)/100000; }; }
