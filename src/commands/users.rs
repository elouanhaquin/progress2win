use tauri::State;
use sqlx::Row;
use crate::database::Database;
use crate::models::*;

// User commands
#[tauri::command]
pub async fn get_user_profile(
    db: State<'_, Database>,
    user_id: i64,
) -> Result<User, String> {
    let user_row = sqlx::query("SELECT * FROM users WHERE id = ?")
        .bind(user_id)
        .fetch_one(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(User {
        id: user_row.get("id"),
        email: user_row.get("email"),
        first_name: user_row.get("first_name"),
        last_name: user_row.get("last_name"),
        avatar_url: user_row.get("avatar_url"),
        goals: serde_json::from_str(&user_row.get::<String, _>("goals")).unwrap_or_default(),
        is_active: user_row.get("is_active"),
        email_verified: user_row.get("email_verified"),
        created_at: user_row.get("created_at"),
        updated_at: user_row.get("updated_at"),
    })
}

#[tauri::command]
pub async fn update_user_profile(
    db: State<'_, Database>,
    user_id: i64,
    update_data: UserUpdate,
) -> Result<User, String> {
    let mut updates = Vec::new();
    let mut has_updates = false;

    if let Some(first_name) = &update_data.first_name {
        sqlx::query("UPDATE users SET first_name = ? WHERE id = ?")
            .bind(first_name)
            .bind(user_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if let Some(last_name) = &update_data.last_name {
        sqlx::query("UPDATE users SET last_name = ? WHERE id = ?")
            .bind(last_name)
            .bind(user_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if let Some(avatar_url) = &update_data.avatar_url {
        sqlx::query("UPDATE users SET avatar_url = ? WHERE id = ?")
            .bind(avatar_url)
            .bind(user_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if let Some(goals) = &update_data.goals {
        let goals_json = serde_json::to_string(goals).unwrap();
        sqlx::query("UPDATE users SET goals = ? WHERE id = ?")
            .bind(goals_json)
            .bind(user_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if has_updates {
        sqlx::query("UPDATE users SET updated_at = datetime('now') WHERE id = ?")
            .bind(user_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
    }

    get_user_profile(db, user_id).await
}

#[tauri::command]
pub async fn delete_user_account(
    db: State<'_, Database>,
    user_id: i64,
) -> Result<(), String> {
    // Delete user (cascade will handle related records)
    sqlx::query("DELETE FROM users WHERE id = ?")
        .bind(user_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}