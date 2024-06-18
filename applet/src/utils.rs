use ws_sdk::database::sql::*;

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
                Ok(false)
            } else {
                Ok(true)
            }
        }
        Err(e) => Err(e.to_string()),
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
                Ok(false)
            } else {
                Ok(true)
            }
        }
        Err(e) => Err(e.to_string()),
    }
}
