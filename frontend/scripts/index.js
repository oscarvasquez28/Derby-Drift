import Level from "./level.js"

const level = new Level;

level.initLevel();
level.begin();

// const audioBuffer = await loadAudio("");
// const source = audioContext.createBufferSource();
// source.buffer = audioBuffer;
// source.connect(audioContext.destination);
// source.start(0);