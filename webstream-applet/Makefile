CC=clang # needs to be --target=wasm32 capable or switch with emscripten
TARGET = wasm32-wasi

.PHONY: setup
setup:
	rustup target add wasm32-wasi
# TODO: performat zokrates setup

local:
	@CC=$(CC);\
	cargo build --target=$(TARGET)

test: local
	@RUST_BACKTRACE=1;\
	cargo test test --lib -- --nocapture

wasm:
	@CC=$(CC);\
	cargo build --release --target=$(TARGET)

.PHONY: clean
clean:
	rm -rf target
