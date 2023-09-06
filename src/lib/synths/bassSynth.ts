import * as Tone from 'tone'

export const bassSynth = () => {
  const reverb = new Tone.Reverb({
    decay: 50,
    wet: 0.5,
  }).toDestination();
  const synth = new Tone.MonoSynth({
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0,
      decay: .9,
      sustain: 0.85,
      release: 2,
    },
  }).connect(reverb).toDestination();

  return synth
}
