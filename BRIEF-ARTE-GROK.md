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
