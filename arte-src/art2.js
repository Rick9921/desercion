
  /* ═══════════ EL CAMPO: salar con la Quebrada al medio ═══════════ */
  function bakeField(k){
    var c=document.createElement("canvas"); c.width=Math.ceil(W*k); c.height=Math.ceil(H*k);
    var g=c.getContext("2d"); g.setTransform(k,0,0,k,0,0);
    var R=rng(7);
    // costra de sal: rival arriba algo más rosada, la tuya algo más verdosa
    var gt=g.createLinearGradient(0,0,0,RT); gt.addColorStop(0,"#bfa98e"); gt.addColorStop(1,"#d8c7aa");
    g.fillStyle=gt; g.fillRect(0,0,W,RT);
    var gb=g.createLinearGradient(0,RB,0,H); gb.addColorStop(0,"#d6c9aa"); gb.addColorStop(1,"#b7a98c");
    g.fillStyle=gb; g.fillRect(0,RB,W,H-RB);
    // tinte de casa muy leve
    g.fillStyle="rgba(214,64,106,.06)"; g.fillRect(0,0,W,RT);
    g.fillStyle="rgba(35,179,155,.06)"; g.fillRect(0,RB,W,H-RB);
    // polígonos de costra (salar): celdas hexagonales con crestas
    var cell=58;
    for(var row=0;row*cell*0.86<H+cell;row++){
      for(var col=0;col*cell<W+cell;col++){
        var cxp=col*cell+(row%2?cell/2:0)+(R()-.5)*14, cyp=row*cell*0.86+(R()-.5)*14;
        if(cyp>RT-8&&cyp<RB+8) continue;
        g.beginPath();
        for(var i=0;i<6;i++){ var a=i*Math.PI/3+Math.PI/6, rr=cell*0.5+(R()-.5)*9;
          var px=cxp+Math.cos(a)*rr, py=cyp+Math.sin(a)*rr*0.86; i?g.lineTo(px,py):g.moveTo(px,py); }
        g.closePath();
        var lum=R(); g.fillStyle="rgba("+(lum>.5?"255,250,238,":"110,90,70,")+(0.03+R()*0.06)+")"; g.fill();
        g.strokeStyle="rgba(255,252,244,.55)"; g.lineWidth=2.2; g.stroke();
        g.save(); g.translate(1.6,2.2); g.strokeStyle="rgba(90,70,50,.18)"; g.lineWidth=1.4; g.stroke(); g.restore();
      }
    }
    // piletas de evaporación (decorado, fuera de los caminos)
    [[70,560,60,40],[935,600,55,36],[90,1130,62,38],[925,1090,58,40],[500,470,46,26],[500,1225,46,26]].forEach(function(p){
      var pg=g.createRadialGradient(p[0],p[1],2,p[0],p[1],p[2]);
      pg.addColorStop(0,"#f1b9b0"); pg.addColorStop(.7,"#d9928c"); pg.addColorStop(1,"#c98b80");
      g.fillStyle="#fffaf0"; g.beginPath(); g.ellipse(p[0],p[1],p[2]+6,p[3]+5,0,0,7); g.fill();
      g.fillStyle=pg; g.beginPath(); g.ellipse(p[0],p[1],p[2],p[3],0,0,7); g.fill();
      g.fillStyle="rgba(255,255,255,.45)"; g.beginPath(); g.ellipse(p[0]-p[2]*.3,p[1]-p[3]*.35,p[2]*.35,p[3]*.18,-.2,0,7); g.fill();
    });
    // huellas de carreta: almacén -> paso, balanza -> almacenes
    function rut(pts){ [[-9,"rgba(95,72,50,.28)"],[9,"rgba(95,72,50,.28)"]].forEach(function(o){
        g.strokeStyle=o[1]; g.lineWidth=7; g.lineCap="round"; g.beginPath();
        pts.forEach(function(p,i){ i?g.lineTo(p[0]+o[0],p[1]):g.moveTo(p[0]+o[0],p[1]); }); g.stroke(); });
      g.strokeStyle="rgba(120,95,70,.10)"; g.lineWidth=34; g.beginPath(); pts.forEach(function(p,i){ i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); }); g.stroke(); }
    BR.forEach(function(bx){ rut([[bx,380],[bx,RT-10]]); rut([[bx,RB+10],[bx,1320]]); });
    rut([[500,205],[380,250],[260,290]]); rut([[500,205],[620,250],[740,290]]);
    rut([[500,1495],[380,1450],[260,1410]]); rut([[500,1495],[620,1450],[740,1410]]);
    // línea de mensura: estacas al medio
    g.setLineDash([10,16]); g.strokeStyle="rgba(70,50,35,.22)"; g.lineWidth=2;
    g.beginPath(); g.moveTo(500,0); g.lineTo(500,RT); g.moveTo(500,RB); g.lineTo(500,H); g.stroke(); g.setLineDash([]);
    for(var sy=60;sy<H;sy+=160){ if(sy>RT-30&&sy<RB+30) continue; g.fillStyle="#6b4a2c"; g.fillRect(497,sy-9,6,14); g.fillStyle="#e8b54a"; g.fillRect(497,sy-9,6,4); }
    // cascotes de sal sueltos
    for(var n=0;n<140;n++){ var x=R()*W, y=R()*H; if(y>RT-20&&y<RB+20) continue;
      var s=2+R()*5; g.fillStyle="rgba(255,253,246,.8)"; g.fillRect(x,y,s,s*0.7); g.fillStyle="rgba(80,60,40,.25)"; g.fillRect(x+1,y+s*0.7,s,1.5); }
    // LA QUEBRADA: grieta con salmuera al fondo (la salmuera se anima en vivo)
    var q=g.createLinearGradient(0,RT,0,RB);
    q.addColorStop(0,"#3a2a22"); q.addColorStop(.25,"#22171a"); q.addColorStop(.75,"#1a1420"); q.addColorStop(1,"#4a3a2c");
    g.fillStyle=q; g.fillRect(0,RT,W,RB-RT);
    // bordes irregulares de la grieta
    function lip(y0,dir){ g.beginPath(); g.moveTo(0,y0); var R2=rng(dir>0?11:23);
      for(var x=0;x<=W;x+=20){ g.lineTo(x,y0+dir*(4+R2()*14)); } g.lineTo(W,y0); g.closePath();
      g.fillStyle=dir>0?"#e9dcc2":"#cdbd9e"; g.fill(); g.strokeStyle="rgba(60,40,30,.5)"; g.lineWidth=2; g.stroke();
      // cara de la pared
      g.beginPath(); R2=rng(dir>0?11:23); g.moveTo(0,y0); for(var x2=0;x2<=W;x2+=20){ g.lineTo(x2,y0+dir*(4+R2()*14)); }
      g.lineTo(W,y0+dir*34); g.lineTo(0,y0+dir*34); g.closePath();
      var wg=g.createLinearGradient(0,y0,0,y0+dir*34); wg.addColorStop(0,dir>0?"rgba(120,90,70,.9)":"rgba(160,130,100,.9)"); wg.addColorStop(1,"rgba(30,20,20,0)");
      g.fillStyle=wg; g.fill(); }
    lip(RT,1); lip(RB,-1);
    // pasos de sal: calzadas de bloques con postes y soga
    BR.forEach(function(bx){
      var x0=bx-BRW, x1=bx+BRW;
      g.fillStyle="rgba(0,0,0,.45)"; g.fillRect(x0-14,RT+6,x1-x0+28,RB-RT-12);
      var cg=g.createLinearGradient(x0,0,x1,0); cg.addColorStop(0,"#bfae90"); cg.addColorStop(.5,"#efe4cc"); cg.addColorStop(1,"#b5a385");
      g.fillStyle=cg; g.fillRect(x0,RT-14,x1-x0,RB-RT+28);
      var R3=rng(bx);
      for(var yy=RT-14;yy<RB+14;yy+=26){ var off=((yy/26)|0)%2?0:28;
        for(var xx=x0-off;xx<x1;xx+=56){ var a0=Math.max(x0,xx), a1=Math.min(x1,xx+56);
          g.strokeStyle="rgba(90,70,50,.45)"; g.lineWidth=2; g.strokeRect(a0+1,yy+1,a1-a0-2,24);
          g.fillStyle="rgba(255,255,255,"+(R3()*.25)+")"; g.fillRect(a0+3,yy+3,a1-a0-6,5); } }
      [x0-4,x1+4].forEach(function(px){
        g.strokeStyle="#5a3a22"; g.lineWidth=3; g.beginPath(); g.moveTo(px,RT-20);
        g.quadraticCurveTo(px+(px<bx?-6:6),(RT+RB)/2,px,RB+20); g.stroke();
        for(var py=RT-20;py<=RB+20;py+=(RB-RT+40)/3){ g.fillStyle="#3b2616"; g.fillRect(px-5,py-14,10,18); g.fillStyle="#8a5d38"; g.fillRect(px-5,py-14,10,4); } });
    });
    // casas al fondo: toldos y fardos (decorado de cada casa)
    function bales(y,col,dir){ [[60,y],[940,y],[120,y+dir*40],[880,y+dir*40]].forEach(function(p){
        g.fillStyle="rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(p[0]+4,p[1]+16,26,9,0,0,7); g.fill();
        g.fillStyle="#efe6d2"; g.fillRect(p[0]-22,p[1]-14,44,28); g.strokeStyle="#7d6448"; g.lineWidth=2; g.strokeRect(p[0]-22,p[1]-14,44,28);
        g.fillStyle=col; g.fillRect(p[0]-22,p[1]-3,44,6); }); }
    bales(60,"#d6406a",1); bales(1640,"#23b39b",-1);
    // oscuridad alrededor
    var vg=g.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,H*.72);
    vg.addColorStop(0,"rgba(10,7,6,0)"); vg.addColorStop(1,"rgba(10,7,6,.55)"); g.fillStyle=vg; g.fillRect(0,0,W,H);
    return c;
  }

  /* salmuera viva en el fondo de la quebrada */
  var BRINE=[]; (function(){ var R=rng(99); for(var i=0;i<46;i++) BRINE.push({y:RT+40+R()*(RB-RT-80),x:R()*W,l:30+R()*90,s:18+R()*40,a:.15+R()*.35}); })();
  function drawBrine(){
    var y0=RT+30, y1=RB-30;
    cx.save(); cx.beginPath(); var xa=0;
    BR.forEach(function(bx){ cx.rect(xa,y0,(bx-BRW-18)-xa,y1-y0); xa=bx+BRW+18; }); cx.rect(xa,y0,W-xa,y1-y0); cx.clip();
    var g=cx.createLinearGradient(0,y0,0,y1); g.addColorStop(0,"#2b5a5e"); g.addColorStop(.5,"#3f7f7a"); g.addColorStop(1,"#244a52");
    cx.fillStyle=g; cx.fillRect(0,y0,W,y1-y0);
    cx.lineCap="round";
    for(var i=0;i<BRINE.length;i++){ var b=BRINE[i], x=((b.x+now*b.s)%(W+200))-100;
      var yy=b.y+Math.sin(now*1.3+i)*3;
      cx.strokeStyle="rgba(220,255,245,"+b.a+")"; cx.lineWidth=2.5;
      cx.beginPath(); cx.moveTo(x,yy); cx.quadraticCurveTo(x+b.l/2,yy-4,x+b.l,yy); cx.stroke(); }
    // espuma salina en las orillas
    cx.fillStyle="rgba(255,255,250,.55)";
    for(var j=0;j<W;j+=34){ var a=Math.sin(now*2+j*.07); cx.fillRect(j,y0+2+a*2,18+a*6,3); cx.fillRect(j+12,y1-5-a*2,16-a*5,3); }
    // bruma
    var m=cx.createLinearGradient(0,y0,0,y1); m.addColorStop(0,"rgba(30,20,20,.75)"); m.addColorStop(.3,"rgba(30,20,20,0)"); m.addColorStop(.7,"rgba(30,20,20,0)"); m.addColorStop(1,"rgba(30,20,20,.6)");
    cx.fillStyle=m; cx.fillRect(0,y0,W,y1-y0);
    cx.restore();
  }
