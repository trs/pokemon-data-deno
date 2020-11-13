.PHONY: all install_deno generate_data

all: install_deno generate_data

install_deno:
	curl -fsSL https://deno.land/x/install/install.sh | sh

generate_data:
	${HOME}/.deno/bin/deno run --allow-net --allow-read --allow-write ./generate/main.ts ./api/_data

.DEFAULT_GOAL := all
