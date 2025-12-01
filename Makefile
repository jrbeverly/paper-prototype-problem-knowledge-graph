.PHONY: build decompose dev generate install lint preview

install:
	npm install

generate:
	npm run generate

build: generate
	npm run build

dev:
	npm run dev

preview:
	npm run preview

lint:
	npm run lint

# Decompose source docs into draft knowledge objects via Claude.
# Requires ANTHROPIC_API_KEY.  Default sources: VISION.md and README.md.
# Override with: make decompose DOCS="path/to/doc.md other.md"
DOCS ?= VISION.md README.md
decompose:
	node tools/decompose.js $(DOCS)
