CC = closure
CC_OPTS = --compilation_level=ADVANCED_OPTIMIZATIONS
UG = uglifyjs
UG_OPTS = --unsafe
all:
	$(CC) $(CC_OPTS) --js=jst.js --js_output_file=jst.pack.js
	$(UG) $(UG_OPTS) jst.js > jst.min.js
