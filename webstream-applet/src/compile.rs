use anyhow::{Error, Result};
use rust_embed::{Embed, EmbeddedFile};
use serde_json::to_writer_pretty;
use zokrates_ast::ir::{self, ProgEnum};
use zokrates_field::Field;

use std::fmt::Display;
use std::io::{self, BufReader, Cursor, ErrorKind, Read, Seek};
use std::path::{Path, PathBuf};
use std::{
    fs::File,
    io::{BufWriter, Write},
};
use typed_arena::Arena;
use ws_sdk::database::kv::{get, set};
#[cfg(not(debug_assertions))]
use ws_sdk::log::log_info;
use zokrates_circom::write_r1cs;
use zokrates_common::CompileConfig;
use zokrates_core::compile::CompileError;
use zokrates_fs_resolver::FileSystemResolver;

#[derive(Embed)]
#[folder = "./inputs/"]
struct Inputs;

#[cfg(debug_assertions)]
fn log_info(str: &str) -> Result<()> {
    println!("{}", str);
    Ok(())
}

pub struct WsFs {
    name: String,
    buf: Vec<u8>,
    panicked: bool,
}

impl Write for WsFs {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        match set(&self.name, buf.into()) {
            Ok(()) => Ok(buf.len()),
            Err(e) => Err(std::io::Error::new(std::io::ErrorKind::NotFound, e)),
        }
    }

    fn flush(&mut self) -> std::io::Result<()> {
        Ok(()) // since its not a true byte sink, flushing is not possible/nessecary
    }
}

impl Read for WsFs {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        match get(&self.name) {
            Ok(value) => {
                assert!(buf.len() >= value.len());
                let len = value.len().min(buf.len());
                buf[..len].copy_from_slice(&value[..len]);
                Ok(len)
            }
            Err(e) => Err(std::io::Error::new(std::io::ErrorKind::NotFound, e)),
        }
    }
}

#[no_mangle]
pub extern "C" fn start(_: i32) -> i32 {
    log_info("hello world!").unwrap();

    let proving_key = Inputs::get("proving.key").unwrap();
    let out = Inputs::get("out").unwrap();
    println!("{:?}", std::str::from_utf8(proving_key.data.as_ref()));

    //let mut reader = Cursor::new(out.data.as_ref());
    let path = Path::new("./inputs/out");
    let file = File::open(path)
        .map_err(|why| format!("Could not open {}: {}", path.display(), why))
        .unwrap();

    let mut reader = BufReader::new(file);
    let asdf = ProgEnum::deserialize(&mut reader).unwrap();
    match asdf {
        ProgEnum::Bn128Program(p) => cli_compute(p),
        ProgEnum::Bls12_377Program(p) => cli_compute(p),
        ProgEnum::Bls12_381Program(p) => cli_compute(p),
        ProgEnum::Bw6_761Program(p) => cli_compute(p),
        ProgEnum::PallasProgram(p) => cli_compute(p),
        ProgEnum::VestaProgram(p) => cli_compute(p),
    };
    return 0;
}

fn cli_compute<'a, T: Field, I: Iterator<Item = ir::Statement<'a, T>>>(
    ir_prog: ir::ProgIterator<'a, T, I>,
) -> Result<(), String> {
    todo!()
}
fn compile() -> Result<(), String> {
    log_info("Compiling").unwrap();

    let path = PathBuf::from("input");
    let bin_output_path = Path::new("output");
    let r1cs_output_path = Path::new("r1cs");
    let abi_spec_path = Path::new("abi-spec");

    let source = String::from(
        "def main(private field a, field b) {
    assert(a * a == b);
    return;}",
    );

    // might need to get stdlib and stuff from above

    let config = CompileConfig::default();
    //let resolver = FileSystemResolver::with_stdlib_root(stdlib_path);
    let resolver = FileSystemResolver::default();

    log_info("Compile").unwrap();

    let arena: Arena<String> = Arena::new();

    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        println!("asdf");
        start(3);
    }
}
