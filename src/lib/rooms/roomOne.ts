import * as Tone from 'tone'
import * as Matter from 'matter-js'
import { wallSynth, simpleSynth, bassSynth } from '../synths'

const highNotes = ['D7', 'E7', 'D6', 'A6', 'A#6', 'A#6', 'E#8']
const lowNotes = ['D2', 'E2', 'C2', 'A2', 'A#3', 'C3', 'D3', 'E#3']

const randomNote = (notes: string[] = highNotes) => {
  return notes[Math.ceil(Math.random() * notes.length) - 1]
}

export function roomOne() {
  // module aliases
  let Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events,
      Common = Matter.Common,
      Composite = Matter.Composite;

  const w = window.innerWidth
  const h = window.innerHeight

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
    const py = 300 + 100 * Math.sin(engine.timing.timestamp * 0.002);

    Body.setPosition(leftWall, { x: 0 + offset, y: py });
    Body.setPosition(rightWall, { x: w - offset, y: -py + h });
    Body.rotate(centerWall, 1 * Math.PI * timeScale / 2 )
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
        synth.triggerAttackRelease(randomNote(), '1n')
        synth.volume.value = -30
      }

      if (pair.bodyA?.label === 'CenterWall') {
        const note = randomNote(lowNotes)
        bass.triggerAttackRelease(note, '8n')
        bass.volume.value = -20
      } else if (pair.bodyA?.label === 'Ground') {
        wallASynth.triggerAttackRelease('D4', '1n')
        wallASynth.volume.value = -40
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

  const initializeApp = () => {
    initialized = true
    Tone.start()
    
    Runner.run(engine);
    Render.run(render);
    Composite.add(engine.world, mouseConstraint);
  }

  return {
    addCircle,
    initializeApp,
    initialized,
  }
}
