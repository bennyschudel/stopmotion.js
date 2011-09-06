(function($) {

	$.StopMotion = function(el, options) {
		var self, core, init,
			setState, setDirection,
			isVisible, isForward, isBackward, isPlaying, isPaused, isStopped, changeFps,
			run, getDimensions, moveBackgroundTo, gotoFrame, gotoNextFrame, gotoPreviousFrame;

		self = this;

		defaults = {
			fps: 12,
			frames: 12,
			width: null,
			height: null
		};
		settings = {};

		core = {
			frame: 1,
			offset: null,
			gutter: 0,
			direction: 'forward',
			state: 'stopped',
			oldState: 'stopped'
		};

		// init
		init = function() {
			settings = $.extend(true, {}, defaults, options);

			grabDimensions();
			self.play();
		};

		// public
		self.play = function() {
			if (!isVisible()) { return self; }

			self.pause();
			setDirection('forward');
			setState('playing');
			run();

			return self;
		};

		self.reverse = function() {
			if (!isVisible()) { return self; }

			self.pause();
			setDirection('backward');
			setState('playing');
			run();

			return self;
		};

		self.stop = function(end) {
			end = !!end;

			clearInterval(core.interval);
			setState('stopped');
			gotoFrame((end) ? settings.frames : 1);

			return self;
		};

		self.pause = function() {
			clearInterval(core.interval);
			setState('paused');

			return self;
		};

		self.resume = function(force) {
			if (!isVisible() || isPlaying()) { return self; }

			self[isBackward() ? 'reverse' : 'play']();

			return self;
		};

		self.toggle = function() {
			if (isPlaying()) {
				self.pause();
			}
			else {
				self.resume();
			}

			return self;
		};

		self.changeFps = function(fps) {
			settings.fps = fps;
			run();
		};

		self.show = function(autoplay) {
			if (isVisible()) { return self; }

			autoplay = !!autoplay;

			el.show();
			if (autoplay) {
				self.play();
			}
			else if (['paused', 'stopped'].indexOf(core.oldState) === -1) {
				self.resume();
			}

			return self;
		};

		self.hide = function(pause) {
			if (!isVisible()) { return self; }

			el.hide();
			self.pause();

			return self;
		};

		// private
			// setters
		setState = function(state) {
			core.oldState = core.state;
			core.state = state;
		};
		setDirection = function(direction) {
			core.direction = direction;
		};

			// is methods
		isVisible = function() {
			return (el.is(':visible'));
		};
		isForward = function() {
			return (core.direction === 'forward');
		};
		isBackward = function() {
			return (core.direction === 'backward');
		};
		isPlaying = function() {
			return (core.state === 'playing');
		};
		isPaused = function() {
			return (core.state === 'paused');
		};
		isStopped = function() {
			return (core.state === 'stopped');
		};

			// functions
		grabDimensions = function() {
			settings.width = parseInt(el.css('width'), 10);
			settings.height = parseInt(el.css('height'), 10);
		};

		moveBackgroundTo = function(x, y) {
			core.offset = [x, y];
			el.css('background-position', core.offset.join('px '));
		};

		gotoFrame = function(frame) {
			var x, y;

			// create loop
			if (isBackward() && frame < 1) {
				frame = settings.frames;
			}
			else if (frame > settings.frames) {
				frame = 1;
			}
			core.frame = frame;

			x = -((core.frame - 1) * settings.width);
			y = 0;

			moveBackgroundTo(x, y);
		};

		gotoNextFrame = function(offset) {
			offset = offset || 1;

			return gotoFrame(core.frame + offset);
		};

		gotoPreviousFrame = function(offset) {
			offset = offset || 1;

			return gotoFrame(core.frame - offset);
		};

		run = function() {
			if (!isVisible()) { return; }

			clearInterval(core.interval);
			core.interval = setInterval(function() {
				isBackward() ? gotoPreviousFrame() : gotoNextFrame();
			}, 1e3 / settings.fps);
		};

		init();
	};

})(jQuery);
