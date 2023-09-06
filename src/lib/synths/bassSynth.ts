import * as Tone from 'tone'

export const bassSynth = () => {
  const reverb = new Tone.Reverb({
    decay: 35,
    wet: 0.15,
  }).toDestination();
  const vibrato = new Tone.Vibrato("2n", 0.9).toDestination();
  const vol = new Tone.Volume(1).toDestination();
  
  const synth = new Tone.MonoSynth({
    oscillator: {
      type: "sine12"
    },
    envelope: {
      attack: 0.1,
      decay: 3,
      release: 1.5,
    },
    portamento: 0.2,
  }).connect(vol).connect(vibrato).connect(reverb).toDestination();

  return synth
}
