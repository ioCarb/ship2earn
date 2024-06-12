use ws_sdk::database::sql::*;
use ws_sdk::log::{log_error, log_info};

const REGISTRY_TABLE: &str = "deviceregistry";
const BINDING_TABLE: &str = "devicebinding";

pub fn is_registered(device_id: &str) -> Result<bool, String> {
    let sql_check_registry = format!(
        "SELECT device_id FROM {} WHERE device_id = ?;",
        REGISTRY_TABLE
    );
    match query(&sql_check_registry, &[&device_id]) {
        Ok(result) => {
            if result.is_empty() {
                log_info(&format!("Device {} is not registered", device_id)).unwrap();
                return Ok(false);
            } else {
                return Ok(true);
            }
        }
        Err(e) => {
            log_error(&format!("Failed to query registry database: {}", e)).unwrap();
            return Err(e.to_string());
        }
    }
}

pub fn is_bound(device_id: &str) -> Result<bool, String> {
    let sql_check_binding = format!(
        "SELECT device_id FROM {} WHERE device_id = ?;",
        BINDING_TABLE
    );
    match query(&sql_check_binding, &[&device_id]) {
        Ok(result) => {
            if result.is_empty() {
                log_info(&format!("Device {} is not bound to a wallet", device_id)).unwrap();
                return Ok(false);
            } else {
                return Ok(true);
            }
        }
        Err(e) => {
            log_error(&format!("Failed to query binding database: {}", e)).unwrap();
            return Err(e.to_string());
        }
    }
}
