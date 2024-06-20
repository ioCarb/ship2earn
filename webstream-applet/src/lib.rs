use anyhow::Result;
use rand::rngs::StdRng;
use rand::SeedableRng;
use rust_embed::Embed;
use std::io::{Cursor, Read};
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
#[folder = "./inputs-benchmark"]
struct Inputs;

// #[derive(Embed)]
// #[folder = "../../ZoKrates/zokrates_stdlib/stdlib/"]
// struct Stdlib;

#[cfg(debug_assertions)]
fn log_info(str: &str) -> Result<()> {
    println!("{}", str);
    Ok(())
}

#[no_mangle]
pub extern "C" fn start(_: i32) -> i32 {
    // log_info("staring").unwrap();
    witness(0);
    0
}

pub fn witness(_: i32) -> i32 {
    // log_info(std::str::from_utf8(root.data.as_ref()).unwrap()).unwrap();
    // read compiled program

    let out = Inputs::get("out").unwrap();
    let out_reader = Cursor::new(out.data.as_ref());

    // let proving_key = Inputs::get("proving.key").unwrap();
    // let pk_reader = Cursor::new(proving_key.data.into_owned());

    let now = std::time::Instant::now();
    // TODO: look into saving pos instead of cloning whole cursor
    let witness = match ProgEnum::deserialize(out_reader).unwrap() {
        ProgEnum::Bn128Program(p) => compute_witness::<_, _, G16, Ark>(p),
        _ => unreachable!("no witness for curve"),
    }
    .unwrap();
    // log_info("computed witness").unwrap();

    // let pk_reader = match ProgEnum::deserialize(out_reader.clone()).unwrap() {
    //     ProgEnum::Bn128Program(p) => compute_proving_key::<_, _, G16, Ark>(p),
    //     _ => unreachable!("no proving.key for curve"),
    // }
    // .unwrap();
    // // log_info("computed pk").unwrap();

    // let proof = match ProgEnum::deserialize(out_reader).unwrap() {
    //     ProgEnum::Bn128Program(p) => compute_proof::<_, _, G16, Ark>(p, pk_reader, witness),
    //     _ => unreachable!("no proof for curve"),
    // }
    // .unwrap();

    let elapsed = now.elapsed();
    print!("{:.2?}", elapsed);
    // print!("{}", proof.as_str());

    // log_info(&format!("{:.2?}", elapsed)).unwrap();
    // log_info(proof.as_str()).unwrap();

    // log_info("end").unwrap();
    0
}

fn compute_witness<
    'a,
    T: Field,
    I: Iterator<Item = ir::Statement<'a, T>>,
    S: Scheme<T> + zokrates_proof_systems::NonUniversalScheme<T>,
    B: Backend<T, S>,
>(
    mut ir_prog: ir::ProgIterator<'a, T, I>,
) -> Result<Witness<T>, String> {
    // log_info("Computing witness...").unwrap();

    // let signature = ConcreteSignature::new()
    //     .inputs(vec![ConcreteType::FieldElement; ir_prog.arguments.len()])
    //     .output(ConcreteType::Tuple(GTupleType::new(
    //         vec![ConcreteType::FieldElement; ir_prog.return_count],
    //     )));

    // get arguments
    let raw_arguments = "0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 510";
    // log_info(&format!("inputs: {}", raw_arguments)).unwrap();
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

    let mut writer: Vec<u8> = Vec::new();

    witness
        .write(&mut writer)
        .map_err(|why| format!("Could not save witness: {:?}", why))?;

    // let test = unsafe { std::str::from_utf8_unchecked(&writer) };
    // log_info(&test).unwrap();
    // log_info(&format!("witness: {}", test)).unwrap();
    // log_info(&format!("size: {}", writer.len().to_string())).unwrap();

    Ok(witness)
}

fn compute_proving_key<
    'a,
    T: Field,
    I: Iterator<Item = ir::Statement<'a, T>>,
    S: Scheme<T> + zokrates_proof_systems::NonUniversalScheme<T>,
    B: NonUniversalBackend<T, S>,
>(
    ir_prog: ir::ProgIterator<'a, T, I>,
) -> Result<Cursor<Vec<u8>>, String> {
    // TODO: share entropy maybe
    let mut rng = StdRng::from_entropy();
    let keypair = B::setup(ir_prog, &mut rng);
    let mut pk_reader = Cursor::new(keypair.pk.to_owned());

    Ok(pk_reader)
}

fn compute_proof<
    'a,
    T: Field,
    I: Iterator<Item = ir::Statement<'a, T>>,
    S: Scheme<T>,
    B: Backend<T, S>,
>(
    ir_prog: ir::ProgIterator<'a, T, I>,
    pk_reader: impl Read,
    witness: Witness<T>,
) -> Result<String, String> {
    let mut rng = StdRng::from_entropy();

    let proof = B::generate_proof(ir_prog, witness, pk_reader, &mut rng);
    let proof = serde_json::to_string_pretty(&zokrates_proof_systems::TaggedProof::<T, S>::new(
        proof.proof,
        proof.inputs,
    ))
    .unwrap();

    Ok(proof)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        witness(0);
    }
}
