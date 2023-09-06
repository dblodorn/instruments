import * as Tone from 'tone'

export const wallSynth = ({
  reverbDelay = 10,
}: {
  reverbDelay?: number,
}) => {
  let params = {
    reverbDelay: reverbDelay,
  }

  const delay = new Tone.PingPongDelay("4n", 0.8).toDestination();
  const reverb = new Tone.Reverb({
    decay: params.reverbDelay,
    wet: 0.75,
  }).toDestination();

  const synth =  new Tone.FMSynth({
    harmonicity: 5,
    modulationIndex: 40,
    detune: 4,
    modulationEnvelope: {
      attack: 0.5,
      decay: 0.9,
      release: 0.5,
      sustain: 0.272,
    },
    envelope: {
      attack: 0.964,
      decay: .9,
      release: 1,
      sustain: 0.9,
    },
    modulation: {
      type: "amsawtooth29"
    },
  }).connect(delay).connect(reverb).toDestination();

  return synth
}