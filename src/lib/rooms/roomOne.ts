import * as Tone from 'tone'
import * as Matter from 'matter-js'
import { wallSynth, simpleSynth, bassSynth, metalSynth } from '../synths'
import debounce from 'lodash/debounce'

const highNotes = ['D7', 'E7', 'D6', 'A6', 'A#6', 'A#7', 'E#8']
const lowNotes = ['D3', 'E3', 'D2', 'A2', 'A#2', 'A#3', 'E#4']

const randomNote = (notes: string[] = highNotes) => {
  return notes[Math.ceil(Math.random() * notes.length) - 1]
}

const MASTER_VOLUME = -10

export function roomOne() {
  // module aliases
  let Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events,
      Common = Matter.Common,
      Composite = Matter.Composite,
      w = window.innerWidth,
      h = window.innerHeight;

  // create an engine
  let engine = Engine.create();

  // create a renderer
  let render = Render.create({
      element: document.body,
      engine: engine,
      bounds: {
        min: {
          x: 0,
          y: 0
        },
        max: {
          x: w,
          y: h,
        }
      },
      options: {
        height: h,
        width: w,
        background: 'rgba(0,0,0,0)',
        wireframes: false,
        pixelRatio: window.devicePixelRatio,
        hasBounds: true,
        showInternalEdges: true,
      }
  });

  // create two boxes and a ground
  const boundsHeight = 10
  const offset = boundsHeight / 2

  const addCircle = () => {
    const createCircle = () => Bodies.circle((Math.random() * w), 40, 40);
    const circle = createCircle()
    circle.label = 'Ball'
    Composite.add(engine.world, circle);
  };

  let ground = Bodies.rectangle(w / 2, h - offset, w, boundsHeight, { isStatic: true });
  ground.label = 'Ground'

  let ceiling = Bodies.rectangle(w / 2, 0 + offset, w, boundsHeight + offset, { isStatic: true });
  ceiling.label = 'Cieling'

  let leftWall = Bodies.rectangle(0, h / 2, boundsHeight + offset, h, { isStatic: true });
  leftWall.label = 'LeftWall'

  let rightWall = Bodies.rectangle(w + offset, h / 2, boundsHeight + offset, h, { isStatic: true });
  rightWall.label = 'RightWall'

  let centerWall = Bodies.rectangle((w / 2) - boundsHeight, h / 2, boundsHeight * 1.5, w / 2, { isStatic: true });
  centerWall.label = 'CenterWall'

  leftWall.render.fillStyle = 'pink'
  ground.render.fillStyle = 'red'
  ceiling.render.fillStyle = 'blue'
  rightWall.render.fillStyle = 'yellow'
  centerWall.render.fillStyle = 'beige'

  // add all of the bodies to the world
  Composite.add(engine.world, [leftWall, rightWall, ceiling, centerWall, ground]);
  
  const vol = new Tone.Volume(-20).toDestination();
  // when bodies collide trigger synth
  const wallASynth = wallSynth({reverbDelay: 20}).connect(vol)
  const synth = simpleSynth().connect(vol)
  const bass = bassSynth().connect(vol)
  const metal = metalSynth().connect(vol)

  const explosion = (engine: Matter.Engine, delta: number) => {
    var timeScale = (1000 / 60) / delta;
    var bodies = Composite.allBodies(engine?.world);

    wallASynth.triggerAttackRelease('G#1', '8n')

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (!body.isStatic && body.position.y >= 500) {
        var forceMagnitude = (0.05 * body.mass) * timeScale;
        Body.applyForce(body, body.position, {
          x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
          y: -forceMagnitude + Common.random() * -forceMagnitude
        });
      }
    }
  };

  let lastTime = Common.now();

  Events.on(engine, 'beforeUpdate', function(event) {
    /* @ts-ignore */
    const timeScale = (event.delta || (1000 / 60)) / 1000;

    const py = (h / 2) * Math.sin(engine.timing.timestamp * 0.0005);
    const px = (w / 2) * Math.sin(engine.timing.timestamp * 0.0005);

    Body.setPosition(leftWall, { x: 0 + offset, y: py });
    Body.setPosition(rightWall, { x: w - offset, y: -py + h });
    Body.setPosition(ground, { x: px + offset, y: h - offset });
    Body.setPosition(ceiling, { x: -px - offset, y: 0 + offset });

    Body.setPosition(centerWall, { x: w / 2, y: h / 2 });
    Body.rotate(centerWall, 1 * Math.PI * timeScale / 2 );

    if (w < 640) {
      Body
    }
  })

  Events.on(engine, 'afterUpdate', (event) => {
    if (Common.now() - lastTime >= 5000) {
      /* @ts-ignore */
      explosion(engine, event.delta);
      lastTime = Common.now();
    }
  })

  Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    
    for (let i = 0, j = pairs.length; i != j; ++i) {
      const pair = pairs[i];
      if (pair.bodyB?.label === 'Ball') {
        try {
          synth.triggerAttackRelease(randomNote(), '1n')
          synth.volume.value = MASTER_VOLUME
        } catch (e) {
          console.error(e)
        }
      }

      if (pair.bodyA?.label === 'CenterWall') {
        try {
          const note = randomNote(lowNotes)
          bass.triggerAttackRelease(note, '8n')
          bass.volume.value = MASTER_VOLUME - 5
          metal.triggerAttackRelease(note, '2n')
          metal.volume.value = MASTER_VOLUME - 15
        } catch (e) {
          console.error(e)
        }
      } else if (pair.bodyA?.label === 'Ground') {
        try {
          wallASynth.triggerAttackRelease('D4', '1n')
          wallASynth.volume.value = MASTER_VOLUME - 10
        } catch (e) {
          console.error(e)
        }
      }
    }
  });

  // add mouse control
  let mouse = Matter.Mouse.create(render.canvas),
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          render: { visible: false }
        }
      });

  let initialized = false

  Runner.run(engine);
  Render.run(render);
  Composite.add(engine.world, mouseConstraint);

  const initializeApp = () => {
    initialized = true
    Tone.start()
    addCircle()
  }

  // add window resize event listener that is debounced with lodash debounce to update the w & h variables
  window.addEventListener('resize', debounce(() => {
    w = window.innerWidth
    h = window.innerHeight
  }, 250))

  return {
    addCircle,
    initializeApp,
    initialized,
  }
}
