
  /* ═══════════ FIGURAS: mercenarios dibujados a mano en vector ═══════════
     Coordenadas locales en "radios": el cuerpo vive en [-1,1].
     o.back: de espaldas (mirando al rival de arriba). o.ph: fase de paso. o.atk: 0..1 golpe. */
  function E(x,y,rx,ry,f){ cx.beginPath(); cx.ellipse(x,y,rx,ry,0,0,6.2832); cx.fillStyle=f; cx.fill(); cx.stroke(); }
  function RR(x,y,w,h,r,f){ cx.beginPath(); cx.moveTo(x+r,y); cx.arcTo(x+w,y,x+w,y+h,r); cx.arcTo(x+w,y+h,x,y+h,r); cx.arcTo(x,y+h,x,y,r); cx.arcTo(x,y,x+w,y,r); cx.closePath(); cx.fillStyle=f; cx.fill(); cx.stroke(); }
  function LN(x0,y0,x1,y1,c,w){ cx.beginPath(); cx.moveTo(x0,y0); cx.lineTo(x1,y1); cx.strokeStyle=c; cx.lineWidth=w; cx.stroke(); cx.strokeStyle=OUT; }
  function hl(x,y,rx,ry,a){ cx.beginPath(); cx.ellipse(x,y,rx,ry,-.4,0,6.2832); cx.fillStyle="rgba(255,255,255,"+(a||.28)+")"; cx.fill(); }
  function legs(P,ph,sp,w){ var a=Math.sin(ph)*sp; E(-w,.72+a*.12,.2,.17,P.dk); E(w,.72-a*.12,.2,.17,P.dk); }
  function face(y,r,back,P){ if(back){ cx.beginPath(); cx.arc(0,y,r,0,6.2832); cx.fillStyle=SKIN2; cx.fill(); cx.stroke(); return; }
    cx.beginPath(); cx.arc(0,y,r,0,6.2832); cx.fillStyle=SKIN; cx.fill(); cx.stroke();
    cx.fillStyle=OUT; cx.fillRect(-r*.42,y-r*.05,r*.18,r*.26); cx.fillRect(r*.24,y-r*.05,r*.18,r*.26); }
  /* el estandarte propio de las veteranas: banderín de contrato a la espalda, con medalla */
  function pennant(P,t,turns){ cx.save();
    LN(-.55,.1,-.7,-1.9,WOODD,.09);
    var w=Math.sin(t*6)*.08;
    cx.beginPath(); cx.moveTo(-.7,-1.88); cx.lineTo(.15,-1.72+w); 
    if(turns>0){ cx.lineTo(-.15,-1.52+w); cx.lineTo(.12,-1.32+w); } else cx.lineTo(.15,-1.36+w);
    cx.lineTo(-.68,-1.28); cx.closePath(); cx.fillStyle=P.b; cx.fill(); cx.lineWidth=.06; cx.stroke();
    cx.beginPath(); cx.arc(-.33,-1.58+w*.5,.11,0,6.2832); cx.fillStyle=GOLD; cx.fill();
    if(turns>1){ cx.strokeStyle="rgba(30,20,15,.8)"; cx.lineWidth=.05; cx.beginPath(); cx.moveTo(-.6,-1.8); cx.lineTo(-.2,-1.45); cx.moveTo(-.1,-1.7); cx.lineTo(-.4,-1.35); cx.stroke(); }
    cx.restore(); cx.strokeStyle=OUT; }
  function medal(x,y,s){ cx.save(); cx.lineWidth=.05;
    cx.beginPath(); cx.moveTo(x-s*.6,y-s*1.4); cx.lineTo(x,y); cx.lineTo(x+s*.6,y-s*1.4); cx.strokeStyle="#b2212f"; cx.lineWidth=.1; cx.stroke();
    cx.strokeStyle=OUT; cx.lineWidth=.05; E(x,y,s,s,GOLD); cx.fillStyle="#fff3c0"; cx.beginPath(); cx.arc(x-s*.3,y-s*.3,s*.3,0,6.2832); cx.fill(); cx.restore(); }

  var FIG={
    recluta:function(P,o){ var back=o.back, sw=o.atk;
      legs(P,o.ph,1,.3);
      E(0,.22,.62,.58,P.b); cx.beginPath(); cx.moveTo(-.58,.32); cx.lineTo(.58,.32); cx.strokeStyle=P.dk; cx.lineWidth=.14; cx.stroke(); cx.strokeStyle=OUT; cx.lineWidth=.09;
      hl(-.2,.02,.22,.14);
      // pico al hombro
      cx.save(); cx.translate(.55,.15); cx.rotate(-.5+sw*1.6); LN(0,.2,0,-.95,WOOD,.12);
      cx.beginPath(); cx.moveTo(-.38,-.9); cx.quadraticCurveTo(0,-1.12,.38,-.9); cx.strokeStyle=METALD; cx.lineWidth=.14; cx.stroke(); cx.strokeStyle=OUT; cx.restore(); cx.lineWidth=.09;
      E(-.6,.28,.17,.17,SKIN); E(.6,.28,.17,.17,SKIN);
      face(-.42,.36,back,P);
      E(0,-.62,.7,.2,"#d9b85c"); E(0,-.75,.34,.2,"#e8cc78"); cx.fillStyle=P.b; cx.fillRect(-.34,-.72,.68,.07);
    },
    ballestera:function(P,o){ var back=o.back;
      legs(P,o.ph,1,.22);
      cx.beginPath(); cx.moveTo(-.42,-.2); cx.lineTo(.42,-.2); cx.lineTo(.66,.75); cx.lineTo(-.66,.75); cx.closePath(); cx.fillStyle=P.b; cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(-.6,-.1); cx.lineTo(.6,-.1); cx.lineTo(0,.42); cx.closePath(); cx.fillStyle=P.lt; cx.fill(); cx.stroke();
      // honda girando
      var ang=now*(o.atk>0?22:5)+o.seed, hx=.62, hy=-.2;
      E(-.55,.05,.15,.15,SKIN); E(hx,hy,.15,.15,SKIN);
      cx.beginPath(); cx.moveTo(hx,hy); var px=hx+Math.cos(ang)*.75, py=hy-.35+Math.sin(ang)*.3; cx.lineTo(px,py); cx.strokeStyle="#4a3424"; cx.lineWidth=.06; cx.stroke(); cx.strokeStyle=OUT; cx.lineWidth=.09;
      E(px,py,.11,.09,"#d8d0c0");
      face(-.52,.34,back,P);
      cx.beginPath(); cx.arc(0,-.58,.4,Math.PI*1.05,Math.PI*1.95); cx.lineTo(.36,-.3); cx.lineTo(-.36,-.3); cx.closePath(); cx.fillStyle=P.dk; cx.fill(); cx.stroke();
      if(back){ cx.beginPath(); cx.moveTo(-.1,-.35); cx.lineTo(.05,.1); cx.lineTo(.18,-.35); cx.fillStyle=P.dk; cx.fill(); }
    },
    alabardero:function(P,o){ var back=o.back, a=o.atk;
      if(!back) pennant(P,now+o.seed,o.turns);
      legs(P,o.ph,.8,.38);
      RR(-.78,-.25,1.56,1.05,.35,P.b);
      E(0,.12,.56,.46,METAL); hl(-.18,-.02,.24,.14,.45);
      cx.fillStyle=P.dk; cx.fillRect(-.56,.42,1.12,.12);
      E(-.82,-.18,.36,.3,METAL); E(.82,-.18,.36,.3,METAL);
      if(!back) medal(-.3,.18,.16);
      // garfio de capataz
      cx.save(); cx.translate(.95,.2); cx.rotate(a*1.1); LN(0,.7,0,-1.75,WOOD,.13);
      cx.beginPath(); cx.moveTo(0,-1.75); cx.lineTo(.38,-1.55); cx.quadraticCurveTo(.5,-1.25,.2,-1.1); cx.lineTo(0,-1.2); cx.closePath(); cx.fillStyle=METAL; cx.lineWidth=.07; cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(0,-1.75); cx.lineTo(-.12,-2.05); cx.lineTo(.08,-1.75); cx.fillStyle=METALD; cx.fill(); cx.restore(); cx.lineWidth=.09;
      E(.95,.18,.18,.18,SKIN);
      cx.beginPath(); cx.arc(0,-.62,.44,0,6.2832); cx.fillStyle=METAL; cx.fill(); cx.stroke(); hl(-.15,-.78,.15,.09,.5);
      if(!back){ cx.fillStyle=OUT; cx.fillRect(-.3,-.62,.6,.1); }
      cx.beginPath(); cx.moveTo(-.1,-1.02); cx.quadraticCurveTo(.1,-1.5,.55,-1.25); cx.quadraticCurveTo(.25,-1.15,.1,-1.0); cx.fillStyle=P.lt; cx.fill(); cx.stroke();
      if(back) pennant(P,now+o.seed,o.turns);
    },
    ariete:function(P,o){ var back=o.back, d=back?-1:1, lunge=o.atk*.35;
      if(!back) pennant(P,now+o.seed,o.turns);
      // cuerpo empujando
      legs(P,o.ph*1.5,1.2,.36);
      E(0,.1-d*.05,.66,.56,P.b); E(-.66,-.05,.26,.24,METAL); E(.66,-.05,.26,.24,METAL);
      if(!back) medal(.3,.25,.13);
      cx.beginPath(); cx.arc(0,-.45,.36,0,6.2832); cx.fillStyle=METAL; cx.fill(); cx.stroke(); hl(-.12,-.58,.12,.07,.5);
      // cofre de hierro sobre ruedas, delante según hacia dónde va
      var cy0=(back?-1.05:.95)-lunge*(back?1:-1);
      cx.save(); cx.translate(0,cy0);
      E(-.7,.38,.2,.2,"#2c2420"); E(.7,.38,.2,.2,"#2c2420");
      RR(-.9,-.42,1.8,.84,.12,WOOD); cx.fillStyle="#9a6a3c"; cx.fillRect(-.86,-.4,1.72,.18);
      cx.fillStyle=METALD; cx.fillRect(-.62,-.42,.14,.84); cx.fillRect(.48,-.42,.14,.84);
      cx.beginPath(); cx.arc(0,.02,.2,0,6.2832); cx.fillStyle=GOLD; cx.fill(); cx.stroke();
      cx.fillStyle=P.b; cx.fillRect(-.86,-.08,.24,.2); cx.fillRect(.62,-.08,.24,.2);
      cx.restore();
      if(back) pennant(P,now+o.seed,o.turns);
    },
    coloso:function(P,o){ var back=o.back, sw=Math.sin(o.ph)*.12;
      if(!back) pennant(P,now+o.seed,o.turns);
      // arcón del acreedor a la espalda
      if(back){ RR(-.62,-.95,1.24,1.0,.12,"#6a4426"); cx.fillStyle=GOLD; cx.fillRect(-.62,-.6,1.24,.1); cx.fillRect(-.05,-.95,.1,1.0); }
      legs(P,o.ph,.7,.42);
      E(-.95,.25+sw,.26,.42,P.dk); E(.95,.25-sw,.26,.42,P.dk);
      E(-.95,.62+sw,.22,.2,SKIN); E(.95,.62-sw-o.atk*.4,.22,.2,SKIN);
      E(0,.12,.92,.82,P.b); hl(-.35,-.15,.32,.2,.25);
      if(!back){ cx.beginPath(); cx.moveTo(-.4,-.6); cx.lineTo(0,.3); cx.lineTo(.4,-.6); cx.fillStyle=P.lt; cx.fill(); cx.stroke();
        RR(-.42,.25,.84,.42,.08,"#f1e3c2"); cx.fillStyle=OUT; for(var i=0;i<3;i++) cx.fillRect(-.32,.34+i*.1,.64,.025);
        medal(.48,-.05,.18); }
      E(-.82,-.42,.36,.26,METAL); E(.82,-.42,.36,.26,METAL);
      face(-.78,.3,back,P);
      RR(-.3,-1.42,.6,.5,.06,P.dk); cx.fillStyle=GOLD; cx.fillRect(-.3,-1.04,.6,.08); E(0,-.92,.46,.1,P.dk);
      if(back) pennant(P,now+o.seed,o.turns);
    },
    mina:function(P,o){ var a=o.atk;
      [[-.7,.2],[.7,.2],[-.6,.8],[.6,.8]].forEach(function(p){ LN(p[0],p[1]-.6,p[0],p[1]+.15,WOODD,.16); });
      RR(-.9,-.5,1.8,.7,.08,WOOD); cx.fillStyle="#9a6a3c"; cx.fillRect(-.88,-.48,1.76,.15);
      cx.fillStyle=P.b; cx.fillRect(-.88,-.1,1.76,.18);
      cx.save(); cx.translate(0,-.55); cx.rotate(-.9+a*1.8); LN(0,0,0,-.9,WOODD,.12); E(0,-.95,.16,.13,"#d8d0c0"); cx.restore(); cx.lineWidth=.09;
      cx.beginPath(); cx.moveTo(-1.05,-.62); cx.lineTo(0,-1.35); cx.lineTo(1.05,-.62); cx.closePath(); cx.fillStyle=P.b; cx.fill(); cx.stroke();
      cx.beginPath(); cx.moveTo(-1.05,-.62); cx.lineTo(0,-1.35); cx.strokeStyle=P.lt; cx.lineWidth=.1; cx.stroke(); cx.strokeStyle=OUT; cx.lineWidth=.09;
      E(0,-1.38,.1,.1,GOLD);
    }
  };
  /* dibuja una figura completa en (x,y) de mundo con radio r */
  function figure(art,P,x,y,r,o){
    cx.save(); cx.translate(x,y); cx.scale(r*(o.sx||1),r*(o.sy||1));
    cx.strokeStyle=OUT; cx.lineWidth=.09; cx.lineJoin="round";
    (FIG[art]||FIG.recluta)(P,o);
    cx.restore();
  }
