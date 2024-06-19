use anyhow::Result;
use rand::rngs::StdRng;
use rand::SeedableRng;
use rust_embed::Embed;
use std::io::{Cursor, Read, Write};
use typed_arena::Arena;
use ws_sdk::database::kv::{get, set};
use ws_sdk::log::log_error;
use zokrates_ark::Ark;
use zokrates_ast::ir::{self, ProgEnum, Witness};
use zokrates_ast::typed::types::{ConcreteSignature, ConcreteType, GTupleType};
use zokrates_core::compile::{compile, CompileError};
use zokrates_field::Field;
use zokrates_proof_systems::rng::get_rng_from_entropy;
use zokrates_proof_systems::{Backend, NonUniversalBackend, Scheme, G16};

#[cfg(not(debug_assertions))]
use ws_sdk::log::log_info;

#[derive(Embed)]
#[folder = "./inputs-test"]
struct Inputs;

// #[derive(Embed)]
// #[folder = "../../ZoKrates/zokrates_stdlib/stdlib/"]
// struct Stdlib;

#[cfg(debug_assertions)]
fn log_info(str: &str) -> Result<()> {
    println!("{}", str);
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
        Ok(()) // since its not a true byte sink, flushing is not possible/nessecary
    }
}

impl<'a> Read for WsFs<'a> {
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
    log_info("hello from start").unwrap();
    witness(0);
    0
}

pub fn witness(_: i32) -> i32 {
    log_info("from witness").unwrap();

    // read compiled program
    let out = Inputs::get("out").unwrap();

    // log_info(std::str::from_utf8(root.data.as_ref()).unwrap()).unwrap();

    let mut out_reader = Cursor::new(out.data.as_ref());

    log_info("1").unwrap();

    // might want to use bellman instead of ark?
    let witness = match ProgEnum::deserialize(&mut out_reader).unwrap() {
        ProgEnum::Bn128Program(p) => compute_witness::<_, _, G16, Ark>(p),
        _ => panic!(),
    }
    .unwrap();

    log_info("computed witness").unwrap();

    let mut out_reader = Cursor::new(out.data.as_ref());

    let pk_reader = match ProgEnum::deserialize(&mut out_reader).unwrap() {
        ProgEnum::Bn128Program(p) => compute_proving_key::<_, _, G16, Ark>(p),
        _ => panic!("asdf"),
    }
    .unwrap();

    log_info("computed pk").unwrap();

    let mut out_reader = Cursor::new(out.data.as_ref());

    match ProgEnum::deserialize(&mut out_reader).unwrap() {
        ProgEnum::Bn128Program(p) => compute_proof::<_, _, G16, Ark>(p, pk_reader, witness),
        _ => panic!("abcdef"),
    }
    .unwrap();

    log_info("end").unwrap();
    0
}

// fn ws_compile<T: Field>() -> Result<(), String> {
//     let path = std::path::Path::from("root.zok");
//     let stdlib_path = std::path::Path::from("root.zok");
//     let root = Inputs::get("root.zok").unwrap();
//     let source = String::from_utf8(root.data.into_owned()).unwrap();
//     let arena = Arena::new();
//     let resolver = zokrates_fs_resolver::FileSystemResolver::with_stdlib_root(stdlib_path);

//     let artifacts = compile::<T, _>(source, path.clone(), Some(&resolver), config, &arena)
//         .map_err(|e| {
//             format!(
//                 "Compilation failed:\n\n{}",
//                 e.0.iter().map(fmt_error).collect::<Vec<_>>().join("\n\n")
//             )
//         })
//         .unwrap();

//     Ok(())
// }

fn compute_witness<
    'a,
    T: Field,
    I: Iterator<Item = ir::Statement<'a, T>>,
    S: Scheme<T> + zokrates_proof_systems::NonUniversalScheme<T>,
    B: Backend<T, S>,
>(
    mut ir_prog: ir::ProgIterator<'a, T, I>,
) -> Result<Witness<T>, String> {
    log_info("Computing witness...").unwrap();

    let signature = ConcreteSignature::new()
        .inputs(vec![ConcreteType::FieldElement; ir_prog.arguments.len()])
        .output(ConcreteType::Tuple(GTupleType::new(
            vec![ConcreteType::FieldElement; ir_prog.return_count],
        )));

    // get arguments
    let raw_arguments = "337 113569";
    log_info(&format!("inputs: {}", raw_arguments)).unwrap();
    let arguments = raw_arguments
        .split(' ')
        .map(|x| T::try_from_dec_str(x))
        .map(|x| x.unwrap())
        .collect::<Vec<T>>();

    let interpreter = zokrates_interpreter::Interpreter::default();
    let public_inputs = ir_prog.public_inputs();

    let witness = interpreter
        .execute(
            &arguments,
            &mut ir_prog.statements,
            &ir_prog.arguments,
            &ir_prog.solvers,
        )
        .map_err(|e| format!("Execution failed: {}", e))?;

    log_info("2").unwrap();

    let mut writer: Vec<u8> = Vec::new();

    witness
        .write(&mut writer)
        .map_err(|why| format!("Could not save witness: {:?}", why))?;

    let test = unsafe { std::str::from_utf8_unchecked(&writer) };
    log_info(&test).unwrap();
    log_info(&format!("witness: {}", test)).unwrap();
    log_info(&format!("size: {}", writer.len().to_string())).unwrap();

    Ok(witness)
}

fn compute_proving_key<
    'a,
    T: Field,
    I: Iterator<Item = ir::Statement<'a, T>>,
    S: Scheme<T> + zokrates_proof_systems::NonUniversalScheme<T>,
    B: NonUniversalBackend<T, S>,
>(
    mut ir_prog: ir::ProgIterator<'a, T, I>,
) -> Result<Cursor<Vec<u8>>, String> {
    // TODO: share entropy maybe
    let mut rng = StdRng::from_entropy();

    let keypair = B::setup(ir_prog, &mut rng);
    let mut pk_reader = Cursor::new(keypair.pk.to_owned());
    
    log_info("in here");
    // let proving_key = Inputs::get("proving.key").unwrap();
    // let pk_reader = Cursor::new(proving_key.data.into_owned());

    Ok(pk_reader)
}

fn compute_proof<
    'a,
    T: Field,
    I: Iterator<Item = ir::Statement<'a, T>>,
    S: Scheme<T>,
    B: Backend<T, S>,
>(
    mut ir_prog: ir::ProgIterator<'a, T, I>,
    pk_reader: impl Read,
    witness: Witness<T>,
) -> Result<(), String> {
    let mut rng = StdRng::from_entropy();

    let proof = B::generate_proof(ir_prog, witness, pk_reader, &mut rng);
    let proof = serde_json::to_string_pretty(&zokrates_proof_systems::TaggedProof::<T, S>::new(
        proof.proof,
        proof.inputs,
    ))
    .unwrap();

    log_info(proof.as_str()).unwrap();

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        println!("asdf");
        witness(0);
    }
}
