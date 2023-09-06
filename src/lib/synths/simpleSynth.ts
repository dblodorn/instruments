import * as Tone from 'tone'

export const simpleSynth = () => {
  const reverb = new Tone.Reverb({
    decay: 80,
    wet: 0.75,
  }).toDestination();

  const delay2 = new Tone.PingPongDelay("16n", .5).toDestination();
  const vibrato = new Tone.Vibrato("4n", 0.8).toDestination();
  const vol = new Tone.Volume(1).toDestination();
  
  const synth = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 1,
    detune: 5,
    modulationEnvelope: {
      attack: 0.1,
      decay: 0.9,
      release: 0.5,
      sustain: 0.272,
    },
    envelope: {
      attack: 0.01,
      decay: .2,
      release: .3,
      sustain: 0.62,
    },
    modulation: {
      type: "sine32"
    },
  }).connect(vol).connect(vibrato).connect(reverb).connect(delay2).toDestination();

  return synth
}
