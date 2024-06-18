use crate::utils::{is_bound, is_registered};
use ws_sdk::database::sql::*;
use ws_sdk::log::{log_error, log_info};
use ws_sdk::stream::get_data;

mod utils;

const REGISTRY_TABLE: &str = "deviceregistry";
const BINDING_TABLE: &str = "devicebinding";
const DATA_TABLE: &str = "devicedata";

#[no_mangle]
pub extern "C" fn handle_device_registered(rid: i32) -> i32 {
    log_info("New device registration event detected").unwrap();

    // Get the message payload from the resource id
    let payload_str = get_data(rid as u32).unwrap();
    let payload_json: serde_json::Value =
        serde_json::from_str(std::str::from_utf8(&payload_str).unwrap()).unwrap();

    let device_id = match payload_json["pebbleId"].as_str() {
        Some(device_id) => device_id,
        None => {
            log_error("Failed to extract 'pebbleId' from payload").unwrap();
            return -1;
        }
    };

    let vehicle_id = match payload_json["vehicleId"].as_str() {
        Some(vehicle_id) => vehicle_id,
        None => {
            log_error("Failed to extract 'vehicleId' from payload").unwrap();
            return -1;
        }
    };

    log_info(&format!("Device ID: {}", device_id)).unwrap();
    log_info(&format!("Vehicle ID: {}", vehicle_id)).unwrap();

    // Check if the device is already registered
    log_info(&format!(
        "Checking if device {} is already registered",
        device_id
    ))
    .unwrap();
    match is_registered(device_id) {
        Ok(true) => {
            log_info(&format!("Device {} is already registered", device_id)).unwrap();
            return -1;
        }
        Ok(false) => {
            log_info("Proceeding").unwrap();
        }
        Err(e) => {
            log_error(&format!("Failed to query registry database: {}", e)).unwrap();
            return -1;
        }
    }

    // Insert the device into the registry table
    log_info(&format!(
        "Adding device {} to the registry database",
        device_id
    ))
    .unwrap();
    let sql = format!(
        "INSERT INTO {} (device_id, vehicle_id, is_registered) VALUES (?,?,?);",
        REGISTRY_TABLE
    );
    match execute(&sql, &[&device_id, &vehicle_id, &true]) {
        Ok(_) => {
            log_info(&format!(
                "Device {} has been added to the registry database",
                device_id
            ))
            .unwrap();
        }
        Err(e) => {
            log_error(&format!("Failed to add device: {}", e)).unwrap();
            return -1;
        }
    }
    0
}

#[no_mangle]
pub extern "C" fn handle_device_binding(rid: i32) -> i32 {
    log_info("New device binding event detected").unwrap();

    // Get the message payload from the resource id
    let payload_str = get_data(rid as u32).unwrap();
    let payload_json: serde_json::Value =
        serde_json::from_str(std::str::from_utf8(&payload_str).unwrap()).unwrap();

    let device_id = match payload_json["pebbleId"].as_str() {
        Some(device_id) => device_id,
        None => {
            log_error("Failed to extract 'pebbleId' from payload").unwrap();
            return -1;
        }
    };

    let owner_wallet = match payload_json["wallet"].as_str() {
        Some(owner_wallet) => owner_wallet,
        None => {
            log_error("Failed to extract 'wallet' from payload").unwrap();
            return -1;
        }
    };

    let binding_status = match payload_json["isBound"].as_str() {
        Some(binding_status) => binding_status,
        None => {
            log_error("Failed to extract 'isBound' from payload").unwrap();
            return -1;
        }
    };

    log_info(&format!("Device ID: {}", device_id)).unwrap();
    log_info(&format!("Owner wallet: {}", owner_wallet)).unwrap();

    // If the device is not registered, cannot bind to wallet
    log_info(&format!("Checking if device {} is registered", device_id)).unwrap();
    match is_registered(device_id) {
        Ok(false) => {
            log_info(&format!("Device {} is not registered", device_id)).unwrap();
            -1
        }
        Ok(true) => {
            log_info("Proceeding").unwrap();

            // Check if the device has been bound or unbound
            if binding_status == "true" || binding_status == "True" {
                log_info(&format!("Device {} has been bound to a wallet", device_id)).unwrap();

                // Insert the device into the binding table
                log_info(&format!(
                    "Adding device {} to the binding database",
                    device_id
                ))
                .unwrap();
                let sql = format!(
                    "INSERT INTO {} (device_id, owner_wallet, is_bound) VALUES (?,?,?);",
                    BINDING_TABLE
                );
                match execute(&sql, &[&device_id, &owner_wallet, &true]) {
                    Ok(_) => {
                        log_info(&format!(
                            "Device {} has been added to the binding database",
                            device_id
                        ))
                        .unwrap();
                        0
                    }
                    Err(e) => {
                        log_error(&format!("Failed to add device: {}", e)).unwrap();
                        -1
                    }
                }
            } else {
                log_info(&format!("Device {} has been unbound", device_id)).unwrap();

                // Delete the device from the binding table
                log_info(&format!(
                    "Removing device {} from the binding database",
                    device_id
                ))
                .unwrap();
                let sql = format!("DELETE FROM {} WHERE device_id = ?;", BINDING_TABLE);
                match execute(&sql, &[&device_id]) {
                    Ok(_) => {
                        log_info(&format!(
                            "Device {} has been removed from the binding database",
                            device_id
                        ))
                        .unwrap();
                        0
                    }
                    Err(e) => {
                        log_error(&format!("Failed to remove device: {}", e)).unwrap();
                        -1
                    }
                }
            }
        }
        Err(e) => {
            log_error(&format!("Failed to query registry database: {}", e)).unwrap();
            -1
        }
    }
}

#[no_mangle]
pub extern "C" fn handle_device_data(rid: i32) -> i32 {
    log_info("New device data message received").unwrap();

    let payload_str = get_data(rid as u32).unwrap();
    let payload_json: serde_json::Value =
        serde_json::from_str(std::str::from_utf8(&payload_str).unwrap()).unwrap();

    let device_id = match payload_json["pebbleId"].as_str() {
        Some(device_id) => device_id,
        None => {
            log_error("Failed to extract 'device_id' from payload").unwrap();
            return -1;
        }
    };

    let data = match payload_json["message"].as_str() {
        Some(data) => data,
        None => {
            log_error("Failed to extract 'message' from payload").unwrap();
            return -1;
        }
    };

    let timestamp = match payload_json["timestamp"].as_str() {
        Some(timestamp) => timestamp,
        None => {
            log_error("Failed to extract 'timestamp' from payload").unwrap();
            return -1;
        }
    };

    log_info(&format!("Device ID: {}", device_id)).unwrap();
    log_info(&format!("Data: {}", data)).unwrap();
    log_info(&format!("Timestamp: {}", timestamp)).unwrap();

    // Check if the device is registered
    log_info(&format!("Checking if device {} is registered", device_id)).unwrap();
    match is_registered(device_id) {
        Ok(false) => {
            log_info(&format!("Device {} is not registered", device_id)).unwrap();
            return -1;
        }
        Ok(true) => {}
        Err(e) => {
            log_error(&format!("Failed to query registry database: {}", e)).unwrap();
            return -1;
        }
    }

    // Check if the device is bound
    log_info(&format!(
        "Checking if device {} is bound to a wallet",
        device_id
    ))
    .unwrap();
    match is_bound(device_id) {
        Ok(false) => {
            log_info(&format!("Device {} is not bound to a wallet", device_id)).unwrap();
            return -1;
        }
        Ok(true) => {}
        Err(e) => {
            log_error(&format!("Failed to query binding database: {}", e)).unwrap();
            return -1;
        }
    }

    // Insert data into the database
    log_info(&format!(
        "Adding data from device {} to the database",
        device_id
    ))
    .unwrap();
    let sql = format!(
        "INSERT INTO {} (device_id, data, timestamp) VALUES (?,?,?);",
        DATA_TABLE
    );
    match execute(&sql, &[&device_id, &data, &timestamp]) {
        Ok(_) => {
            log_info(&format!(
                "Data from device {} has been added to the database",
                device_id
            ))
            .unwrap();
        }
        Err(e) => {
            log_error(&format!("Failed to add device data: {}", e)).unwrap();
            return -1;
        }
    }
    0
}
