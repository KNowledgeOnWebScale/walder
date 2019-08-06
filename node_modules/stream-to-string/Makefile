.PHONY: help test check-cover view-cover npm-test travis-test clean

BIN = ./node_modules/.bin

# Determine reporter
reporter=tap
ifdef npm_config_dot
	reporter=dot
endif
ifdef npm_config_spec
	reporter=spec
endif

all: help

help:
	@echo
	@echo "To run tests:"
	@echo "  npm test [--dot | --spec] [--coverage | --grep=<test file pattern>]"
	@echo

lint:
	@jshint --exclude '**/{coverage,node_modules}/*' **/*.js

test: node_modules
	$(if $(npm_config_grep), @echo "Running test files that match pattern: $(npm_config_grep)\n",)
	$(if $(filter tap, $(reporter)), @find ./test -maxdepth 1 -name "*.js" -type f | grep ""$(npm_config_grep) | xargs $(BIN)/istanbul cover --report lcovonly --print none $(BIN)/tape --)
	$(if $(filter dot, $(reporter)), @find ./test -maxdepth 1 -name "*.js" -type f | grep ""$(npm_config_grep) | xargs $(BIN)/istanbul cover --report lcovonly --print none $(BIN)/tape -- | $(BIN)/tap-dot)
	$(if $(filter spec, $(reporter)), @find ./test -maxdepth 1 -name "*.js" -type f | grep ""$(npm_config_grep) | xargs $(BIN)/istanbul cover --report lcovonly --print none $(BIN)/tape -- | $(BIN)/tap-spec)
ifdef npm_config_coverage
	@echo
	@$(BIN)/istanbul report text | grep -v "Using reporter" | grep -v "Done"
endif
	@$(BIN)/istanbul report html > /dev/null

npm-test: lint test check-cover

travis-test: lint test check-cover
	@(cat coverage/lcov.info | coveralls) || exit 0

check-cover: coverage
	@rm -f coverage/error
	@$(BIN)/istanbul check-coverage --statements 100 --branches 100 --functions 100 --lines 100 2>&1 | cat > coverage/error
	$(if $(npm_config_grep),,@if [ -s coverage/error ]; then echo; grep ERROR coverage/error; echo; exit 1; fi)

view-cover: coverage
	@$(BIN)/opn coverage/index.html

coverage:
	@make test

node_modules:
	@echo '# *** running "npm install" for you ***'
	@npm install
	@mkdir -p node_modules
	@touch node_modules

clean:
	@rm -rf node_modules coverage
