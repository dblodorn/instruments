import * as Tone from 'tone'

export const metalSynth = () => {
  const reverb = new Tone.Reverb({
    decay: 75,
    wet: 0.9,
  }).toDestination();
  const vibrato = new Tone.Vibrato("2n", 0.9).toDestination();

  const synth = new Tone.MetalSynth({
    envelope: {
      attack: 0.5,
      decay: 5,
      release: 50
    },
    harmonicity: 5,
    modulationIndex: 30,
    resonance: 1000,
    octaves: 5
  }).connect(vibrato).connect(reverb).toDestination();

  return synth
}
