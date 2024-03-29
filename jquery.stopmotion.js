;(function($, undefined) {

	$.StopMotion = function(element, options) {
		var self, el, core, init,
			setState, setDirection, changeFps,
			run, grabDimensions, moveBackgroundTo;

		self = this;

		defaults = {
			fps: 12,
			frames: 12,
			width: null,
			height: null,
			columns: null,
			gutterWidth: 0,
			gutterHeight: 0,
			loop: true
		};
		settings = {};

		core = {
			frame: 1,
			width: null,
			height: null,
			columns: null,
			offset: null,
			direction: 'forward',
			state: 'stopped',
			oldState: 'stopped'
		};

		// init
		init = function() {
			settings = $.extend(true, {}, defaults, options);
			el = $(element);

			core.columns = settings.columns || settings.frames;

			grabDimensions();
			self.play();
		};

		// public
		self.play = function() {
			if (!self.isVisible()) { return self; }

			self.pause();
			setDirection('forward');
			setState('playing');
			run();

			return self;
		};

		self.reverse = function() {
			if (!self.isVisible()) { return self; }

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
			self.gotoFrame((end) ? settings.frames : 1);

			return self;
		};

		self.pause = function() {
			clearInterval(core.interval);
			setState('paused');

			return self;
		};

		self.resume = function(force) {
			if (!self.isVisible() || self.isPlaying()) { return self; }

			self[self.isBackward() ? 'reverse' : 'play']();

			return self;
		};

		self.toggle = function() {
			if (self.isPlaying()) {
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

		self.loop = function(loop) {
			settings.loop = loop;
		};

		self.show = function(autoplay) {
			if (self.isVisible()) { return self; }

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
			if (!self.isVisible()) { return self; }

			el.hide();
			self.pause();

			return self;
		};

			// frame methods
		self.gotoFrame = function(frame) {
			var row, col, x, y, exit;

			// create loop
			if (self.isBackward() && frame < 1) {
				if (!settings.loop) { self.pause(); return; }
				frame = settings.frames;
			}
			else if (frame > settings.frames) {
				if (!settings.loop) { self.pause(); return; }
				frame = 1;
			}
			core.frame = frame;

			row = Math.ceil(frame / core.columns);
			col = frame - Math.floor(frame / core.columns) * core.columns;

			x = -((col - 1) * (core.width + settings.gutterWidth * 2));
			y = -((row - 1) * (core.height + settings.gutterHeight * 2));

			moveBackgroundTo(x, y);
		};

		self.gotoNextFrame = function(offset) {
			offset = offset || 1;

			self.gotoFrame(core.frame + offset);
		};

		self.gotoPreviousFrame = function(offset) {
			offset = offset || 1;

			self.gotoFrame(core.frame - offset);
		};

			// is methods
		self.isVisible = function() {
			return (el.is(':visible'));
		};
		self.isForward = function() {
			return (core.direction === 'forward');
		};
		self.isBackward = function() {
			return (core.direction === 'backward');
		};
		self.isPlaying = function() {
			return (core.state === 'playing');
		};
		self.isPaused = function() {
			return (core.state === 'paused');
		};
		self.isStopped = function() {
			return (core.state === 'stopped');
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

			// functions
		grabDimensions = function() {
			core.width = settings.width || parseInt(el.css('width'), 10);
			core.height = settings.height || parseInt(el.css('height'), 10);
		};

		moveBackgroundTo = function(x, y) {
			core.offset = [x, y];
			el.css('background-position', x+'px '+y+'px');
		};

		run = function() {
			if (!self.isVisible()) { return; }

			clearInterval(core.interval);
			core.interval = setInterval(function() {
				self.isBackward() ? self.gotoPreviousFrame() : self.gotoNextFrame();
			}, 1e3 / settings.fps);
		};

		init();
	};

})(jQuery);
