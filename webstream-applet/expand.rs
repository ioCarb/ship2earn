#![feature(prelude_import)]
#[prelude_import]
use std::prelude::rust_2021::*;
#[macro_use]
extern crate std;
use anyhow::Result;
use rust_embed::Embed;
use std::io::{Cursor, Read, Write};
use ws_sdk::database::kv::{get, set};
use ws_sdk::log::log_error;
use zokrates_ast::ir::{self, ProgEnum};
use zokrates_ast::typed::types::{ConcreteSignature, ConcreteType, GTupleType};
use zokrates_field::Field;
#[folder = "./inputs/"]
struct Inputs;
#[cfg(debug_assertions)]
impl Inputs {
    fn matcher() -> ::rust_embed::utils::PathMatcher {
        const INCLUDES: &[&str] = &[];
        const EXCLUDES: &[&str] = &[];
        static PATH_MATCHER: ::std::sync::OnceLock<::rust_embed::utils::PathMatcher> = ::std::sync::OnceLock::new();
        PATH_MATCHER
            .get_or_init(|| rust_embed::utils::PathMatcher::new(INCLUDES, EXCLUDES))
            .clone()
    }
    /// Get an embedded file and its metadata.
    pub fn get(file_path: &str) -> ::std::option::Option<rust_embed::EmbeddedFile> {
        let rel_file_path = file_path.replace("\\", "/");
        let file_path = ::std::path::Path::new(
                "/home/felix/Documents/ship2earn/webstream-applet/./inputs/",
            )
            .join(&rel_file_path);
        let canonical_file_path = file_path.canonicalize().ok()?;
        if !canonical_file_path
            .starts_with("/home/felix/Documents/ship2earn/webstream-applet/inputs")
        {
            let metadata = ::std::fs::symlink_metadata(&file_path).ok()?;
            if !metadata.is_symlink() {
                return ::std::option::Option::None;
            }
        }
        let path_matcher = Self::matcher();
        if path_matcher.is_path_included(&rel_file_path) {
            rust_embed::utils::read_file_from_fs(&canonical_file_path).ok()
        } else {
            ::std::option::Option::None
        }
    }
    /// Iterates over the file paths in the folder.
    pub fn iter() -> impl ::std::iter::Iterator<
        Item = ::std::borrow::Cow<'static, str>,
    > {
        use ::std::path::Path;
        rust_embed::utils::get_files(
                ::std::string::String::from(
                    "/home/felix/Documents/ship2earn/webstream-applet/./inputs/",
                ),
                Self::matcher(),
            )
            .map(|e| ::std::borrow::Cow::from(e.rel_path))
    }
}
#[cfg(debug_assertions)]
impl rust_embed::RustEmbed for Inputs {
    fn get(file_path: &str) -> ::std::option::Option<rust_embed::EmbeddedFile> {
        Inputs::get(file_path)
    }
    fn iter() -> rust_embed::Filenames {
        rust_embed::Filenames::Dynamic(::std::boxed::Box::new(Inputs::iter()))
    }
}
#[cfg(debug_assertions)]
fn log_info(str: &str) -> Result<()> {
    {
        ::std::io::_print(format_args!("{0}\n", str));
    };
    Ok(())
}
pub struct WsFs<'a> {
    name: &'a str,
    buf: Vec<u8>,
    panicked: bool,
}
impl<'a> Write for WsFs<'a> {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        match set(&self.name, buf.into()) {
            Ok(()) => Ok(buf.len()),
            Err(e) => Err(std::io::Error::new(std::io::ErrorKind::NotFound, e)),
        }
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}
#[no_mangle]
pub extern "C" fn start(_: i32) -> i32 {
    log_info("hello from start");
    witness(0);
    0
}
pub fn witness(_: i32) -> i32 {
    log_info("from witness");
    let proving_key = Inputs::get("proving.key").unwrap();
    let out = Inputs::get("out").unwrap();
    let root = Inputs::get("root.zok").unwrap();
    log_info(std::str::from_utf8(root.data.as_ref()).unwrap());
    let mut reader = Cursor::new(out.data.as_ref());
    log_info("1");
    match ProgEnum::deserialize(&mut reader).unwrap() {
        ProgEnum::Bn128Program(p) => compute_witness(p),
        ProgEnum::Bls12_377Program(p) => compute_witness(p),
        ProgEnum::Bls12_381Program(p) => compute_witness(p),
        ProgEnum::Bw6_761Program(p) => compute_witness(p),
        ProgEnum::PallasProgram(p) => compute_witness(p),
        ProgEnum::VestaProgram(p) => compute_witness(p),
    }
        .unwrap();
    log_info("end");
    0
}
fn compute_witness<'a, T: Field, I: Iterator<Item = ir::Statement<'a, T>>>(
    ir_prog: ir::ProgIterator<'a, T, I>,
) -> Result<(), String> {
    log_info("Computing witness...");
    let signature = ConcreteSignature::new()
        .inputs(
            ::alloc::vec::from_elem(ConcreteType::FieldElement, ir_prog.arguments.len()),
        )
        .output(
            ConcreteType::Tuple(
                GTupleType::new(
                    ::alloc::vec::from_elem(
                        ConcreteType::FieldElement,
                        ir_prog.return_count,
                    ),
                ),
            ),
        );
    let raw_arguments = "123 456";
    let arguments = raw_arguments
        .split(' ')
        .map(|x| T::try_from_dec_str(x))
        .map(|x| x.unwrap())
        .collect::<Vec<T>>();
    let interpreter = zokrates_interpreter::Interpreter::default();
    let public_inputs = ir_prog.public_inputs();
    let witness = interpreter
        .execute(&arguments, ir_prog.statements, &ir_prog.arguments, &ir_prog.solvers)
        .map_err(|e| {
            let res = ::alloc::fmt::format(format_args!("Execution failed: {0}", e));
            res
        })?;
    return Ok(());
    log_info("2");
    let mut writer = WsFs {
        name: "witness",
        buf: Vec::<u8>::new(),
        panicked: false,
    };
    witness
        .write(writer)
        .map_err(|why| {
            let res = ::alloc::fmt::format(
                format_args!("Could not save witness: {0:?}", why),
            );
            res
        })?;
    let output = get("witness").unwrap();
    let output = match get("witness") {
        Ok(str) => str,
        Err(_) => {
            log_error("couldnt find witness");
            {
                #[cold]
                #[track_caller]
                #[inline(never)]
                const fn panic_cold_explicit() -> ! {
                    ::core::panicking::panic_explicit()
                }
                panic_cold_explicit();
            }
        }
    };
    log_info(std::str::from_utf8(output.as_ref()).unwrap());
    log_info("finished computing witness");
    Ok(())
}
