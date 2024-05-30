use anyhow::Result;
use rust_embed::Embed;
use std::io::Cursor;
#[cfg(not(debug_assertions))]
use ws_sdk::log::log_info;
use zokrates_ast::ir::{self, ProgEnum};
use zokrates_ast::typed::types::{ConcreteSignature, ConcreteType, GTupleType};
use zokrates_circom::write_witness;
use zokrates_field::Field;

#[derive(Embed)]
#[folder = "./inputs/"]
struct Inputs;

#[cfg(debug_assertions)]
fn log_info(str: &str) -> Result<()> {
    println!("{}", str);
    Ok(())
}

#[no_mangle]
pub extern "C" fn log_bye(_: i32) -> i32 {
    match log_info("bye") {
        Ok(_) => return 0,
        _ => return -1,
    };
}

#[no_mangle]
pub extern "C" fn start(_: i32) -> i32 {
    log_info("hello from start");
    witness(0);
    0
}

pub fn witness(_: i32) -> i32 {
    log_info("from witness");
    // read compiled program
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

    log_info("end of witness");
    0
}

fn compute_witness<'a, T: Field, I: Iterator<Item = ir::Statement<'a, T>>>(
    ir_prog: ir::ProgIterator<'a, T, I>,
) -> Result<(), String> {
    log_info("Computing witness...");

    let signature = ConcreteSignature::new()
        .inputs(vec![ConcreteType::FieldElement; ir_prog.arguments.len()])
        .output(ConcreteType::Tuple(GTupleType::new(
            vec![ConcreteType::FieldElement; ir_prog.return_count],
        )));

    // get arguments
    let raw_arguments = "123 456";
    let arguments = raw_arguments
        .split(' ')
        .map(|x| T::try_from_dec_str(x))
        .map(|x| x.unwrap())
        .collect::<Vec<T>>();

    let interpreter = zokrates_interpreter::Interpreter::default();
    let public_inputs = ir_prog.public_inputs();

    let witness = interpreter
        .execute_with_log_stream(
            &arguments,
            ir_prog.statements,
            &ir_prog.arguments,
            &ir_prog.solvers,
            &mut std::io::stdout(),
        )
        .map_err(|e| format!("Execution failed: {}", e))?;

    log_info("2");

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
