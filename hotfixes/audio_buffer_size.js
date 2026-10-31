// Chrome on Android plays a ScriptProcessorNode smaller than 1024 frames with gaps, which
// crackles. On the web, Allegro asks SDL for 512 (ZQuestClassic's web/patches/allegro5.patch),
// so this makes such nodes 1024 frames, filling each by calling the original handler once per
// smaller chunk. It does nothing once the wasm is built with a buffer of at least 1024.
(() => {
	const MIN_SIZE = 1024;
	const proto = (window.BaseAudioContext || window.AudioContext)?.prototype;
	const handlerProp = window.ScriptProcessorNode &&
		Object.getOwnPropertyDescriptor(ScriptProcessorNode.prototype, 'onaudioprocess');
	if (!proto?.createScriptProcessor || !handlerProp) return;

	const createScriptProcessor = proto.createScriptProcessor;
	proto.createScriptProcessor = function(bufferSize, numInputs, numOutputs) {
		// Only output nodes (like SDL's) with a size that evenly divides MIN_SIZE.
		if (!(bufferSize > 0 && bufferSize < MIN_SIZE && MIN_SIZE % bufferSize === 0) ||
			numInputs !== 0 || !(numOutputs > 0)) {
			return createScriptProcessor.apply(this, arguments);
		}

		const ctx = this;
		const node = createScriptProcessor.call(ctx, MIN_SIZE, numInputs, numOutputs);
		const chunk = ctx.createBuffer(numOutputs, bufferSize, ctx.sampleRate);
		let handler = null;
		Object.defineProperty(node, 'onaudioprocess', {
			get: () => handler,
			set(fn) {
				handler = fn;
				handlerProp.set.call(node, typeof fn !== 'function' ? fn : e => {
					const out = e.outputBuffer;
					for (let offset = 0; offset < MIN_SIZE; offset += bufferSize) {
						fn.call(node, {
							outputBuffer: chunk,
							playbackTime: e.playbackTime + offset / ctx.sampleRate,
						});
						for (let c = 0; c < numOutputs; c++)
							out.getChannelData(c).set(chunk.getChannelData(c), offset);
					}
				});
			},
		});
		return node;
	};
})();
