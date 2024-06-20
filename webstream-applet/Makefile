CC = clang # needs to be --target=wasm32 capable or switch to emscripten
TARGET = wasm32-wasi
#RUSTFLAGS = Zshare-gererics

.PHONY: setup
setup:
	rustup target add wasm32-wasi
# TODO: perform zokrates setup

.PHONY: setup/debug
setup/debug:
	cargo install twiggy cargo-llvm-lines cargo-bloat
	rustup target add wasm32-wasi

.PHONY: clean
clean:
	rm -rf target

wasm:
	@CC=$(CC);\
	cargo build --release --target=$(TARGET)

#############
# debugging #
#############

local:
	@CC=$(CC);\
	cargo build --release

test: local
	@RUST_BACKTRACE=1;\
	cargo test --release test --lib -- --nocapture
check:
	@CC=$(CC);\
	cargo check --release --target=$(TARGET)


##################
# size debugging #
##################

wasm/time:
	@CC=$(CC);\
	cargo build --release --target=$(TARGET) --timings

bloat/crates:
	@CC=$(CC);\
	cargo bloat --release --crates

bloat/functions:
	@CC=$(CC);\
	cargo bloat --release -n 100

twiggy/paths: wasm
	twiggy paths target/wasm32-wasi/release/webstream_applet.wasm

twiggy/monos: wasm
	twiggy monos target/wasm32-wasi/release/webstream_applet.wasm --max-generics 5 --max-monos 30

lines:
	cargo llvm-lines --target=wasm32-wasi --lib --release | head -n 100
