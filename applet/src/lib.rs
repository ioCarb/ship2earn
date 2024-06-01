use ws_sdk::log::log_info;
//use ws_sdk::log::log_error;
use ws_sdk::database::sql::*;
use ws_sdk::stream::get_data;


const REGISTRY_TABLE: &str = "deviceregistry";
const BINDING_TABLE: &str = "devicebinding";
const DATA_TABLE: &str = "devicedata";
const TEST_DATA: &str = "testdata";


#[no_mangle]
pub extern "C" fn handle_device_registered(rid: i32) -> i32 {
    log_info("New device registration detected").unwrap();

    // Get the message payload from the resource id
    let payload_str = get_data(rid as u32).unwrap();
    let payload_json: serde_json::Value = serde_json::from_str(std::str::from_utf8(&payload_str).unwrap()).unwrap();

    //let topics = message_json["topics"].as_array().unwrap();
    let device_id = payload_json["pebbleId"].as_str().unwrap();
    let vehicle_id = payload_json["vehicleId"].as_str().unwrap();

    log_info(&format!("Device ID: {}", device_id)).unwrap();
    log_info(&format!("Vehicle ID: {}", vehicle_id)).unwrap();

    // Insert the device into the registry table
    let sql = format!(
        "INSERT INTO {} (device_id, vehicle_id, is_registered) VALUES (?,?,?);",
        REGISTRY_TABLE
    );
    execute(
        &sql,
        &[&device_id, &vehicle_id, &true]
    ).unwrap();

    return 0;
}


#[no_mangle]
pub extern "C" fn handle_device_binding(rid: i32) -> i32 {   
     log_info("Binding event detected").unwrap();

    // Get the message payload from the resource id
    let payload_str = get_data(rid as u32).unwrap();
    let payload_json: serde_json::Value = serde_json::from_str(std::str::from_utf8(&payload_str).unwrap()).unwrap();
    
    let device_id = payload_json["pebbleId"].as_str().unwrap();
    let owner_wallet = payload_json["wallet"].as_str().unwrap();
    let binding_status = payload_json["isBound"].as_str().unwrap();

    log_info(&format!("Device ID: {}", device_id)).unwrap();
    log_info(&format!("Owner wallet: {}", owner_wallet)).unwrap();
    
    // Check if the device has been bound or unbound
    if binding_status == "true" {
        log_info("New device has been bound to the wallet").unwrap();

        // Insert the device into the binding table
        let sql = format!(
            "INSERT INTO {} (device_id, owner_wallet, is_bound) VALUES (?,?);",
            BINDING_TABLE
        );
        execute(
            &sql,
            &[&device_id, &owner_wallet, &true]
        ).unwrap();
        return 0;
    } else {
        log_info("Device has been unbound").unwrap();

        // Delete the device from the binding table
        let sql = format!(
            "DELETE FROM {} WHERE device_id = ?;",
            BINDING_TABLE
        );
        execute(
            &sql,
            &[&device_id]
        ).unwrap();        

        return 0;
    }
}


#[no_mangle]
pub extern "C" fn handle_device_data(rid: i32) -> i32{
    log_info("New device data message detected").unwrap();

    let payload_str = get_data(rid as u32).unwrap();
    let payload_json: serde_json::Value = serde_json::from_str(std::str::from_utf8(&payload_str).unwrap()).unwrap();

    let device_id = payload_json["device_id"].as_str().unwrap();
    let data = payload_json["message"].as_str().unwrap();
    let timestamp = payload_json["timestamp"].as_str().unwrap();
    //let signature = payload_json["signature"].as_str().unwrap();

    log_info(&format!("Device ID: {}", device_id)).unwrap();
    log_info(&format!("Data: {}", data)).unwrap();
    log_info(&format!("Timestamp: {}", timestamp)).unwrap();

     // Check if the device is registered
    let sql_check_registry = format!(
        "SELECT device_id FROM {} WHERE device_id = ?;",
        REGISTRY_TABLE        
    );
    let result_registry = query(&sql_check_registry, &[&device_id]).unwrap();

    if result_registry.is_empty() {
        log_info(&format!("Device {} is not registered", device_id)).unwrap();
        return 0;
    }

    // Check if the device is bound
    let sql_check_binding = format!(
        "SELECT owner_address FROM {} WHERE device_id = ?;",
        BINDING_TABLE
    );
    let result_binding = query(&sql_check_binding, &[&device_id]).unwrap();

    if result_binding.is_empty() {
        log_info(&format!("Device {} is not bound", device_id)).unwrap();
        return 0;
    }

    /*if verify_signature(&data, &signature) {
        log_info("Signature verification succeeded").unwrap();*/

        // Insert data into the database
        let sql = format!(
            "INSERT INTO {} (device_id, data, timestamp) VALUES (?,?,?);",
            DATA_TABLE
        );
        execute(
            &sql,
            &[&device_id, &data, &timestamp]
        ).unwrap();
    /*} else {
        log_info("Signature verification failed").unwrap();
    }*/
    return 0;
}


// Used for testing for now
#[no_mangle]
pub extern "C" fn handle_registration_call(rid: i32) -> i32 {
    log_info("New device registration call detected").unwrap();
    
    let payload_str = get_data(rid as u32).unwrap();
    let payload_json: serde_json::Value = serde_json::from_str(std::str::from_utf8(&payload_str).unwrap()).unwrap();
    //let web3_url = std::env::var("WEB3_HTTP_URL").unwrap_or_else(|_| "http://localhost:8545".to_string());
    //let web3 = web3::Web3::new(web3::transports::Http::new(&web3_url).unwrap());
   
    // Parse the payload into a DeviceRegistrationRequest struct
    let device_id = payload_json["device_id"].as_str().unwrap();
    let vehicle_id = payload_json["vehicle_id"].as_str().unwrap();  
    let wallet_address = payload_json["wallet_address"].as_str().unwrap();

    log_info(&format!("Device ID: {}", device_id)).unwrap();
    log_info(&format!("Vehicle ID: {}", vehicle_id)).unwrap();
    log_info(&format!("Wallet Address: {}", wallet_address)).unwrap();

    // Insert into the TestData table
    let sql = &format!("INSERT INTO {} (device_id, vehicle_id, wallet_address) VALUES (?,?,?);" ,
    TEST_DATA
);
    execute(
        &sql,
        &[&device_id, &vehicle_id, &wallet_address]
        ).unwrap();


    /*let public_key = get_public_key_for_device(device_id).await.unwrap();
    //let signature = get_signature_for_device(device_id).await.unwrap();

    if verify_signature(&public_key, &registration_request.device_id, &registration_request.user_id).await {
        log("Signature verification succeeded");

         // Call the registerDevice function
         let register_tx = contract_registry.call("registerDevice", (device_id,), None, Options::default()).await;

         match register_tx {
             Ok(tx) => {
                 log(&format!("Device registered with transaction: {:?}", tx));
                 // Wait for the transaction receipt to confirm success
                 let receipt = web3.eth().transaction_receipt(tx).await.unwrap();
 
                 if receipt.status == Some(U256::from(1)) {
                     // Registration successful, proceed with binding
                     let owner_address: Address = registration_request.wallet_address.parse().unwrap();
 
                     let bind_tx = contract_binding.call("bindDevice", (device_id, owner_address), None, Options::default()).await;
 
                     match bind_tx {
                         Ok(tx) => {
                             log(&format!("Device bound with transaction: {:?}", tx));
                         }
                         Err(e) => {
                             log(&format!("Failed to bind device: {:?}", e));
                         }
                     }
                 } else {
                     log("Device registration transaction failed");
                 }
             }
             Err(e) => {
                 log(&format!("Device registration failed: {:?}", e));
             }
         }
     } else {
         log("Signature verification failed");
     }*/

    return 0;
}