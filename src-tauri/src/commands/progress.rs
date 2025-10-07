use tauri::State;
use sqlx::Row;
use crate::database::Database;
use crate::models::*;

// Progress commands
#[tauri::command]
pub async fn add_progress(
    db: State<'_, Database>,
    user_id: i64,
    progress_data: ProgressCreate,
) -> Result<Progress, String> {
    let result = sqlx::query(
        "INSERT INTO progress (user_id, category, metric, value, unit, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(user_id)
    .bind(&progress_data.category)
    .bind(&progress_data.metric)
    .bind(progress_data.value)
    .bind(&progress_data.unit)
    .bind(&progress_data.notes)
    .bind(progress_data.date)
    .execute(db.get_pool())
    .await
    .map_err(|e| e.to_string())?;

    let progress_id = result.last_insert_rowid();

    let progress_row = sqlx::query("SELECT * FROM progress WHERE id = ?")
        .bind(progress_id)
        .fetch_one(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(Progress {
        id: progress_row.get("id"),
        user_id: progress_row.get("user_id"),
        category: progress_row.get("category"),
        metric: progress_row.get("metric"),
        value: progress_row.get("value"),
        unit: progress_row.get("unit"),
        notes: progress_row.get("notes"),
        date: progress_row.get("date"),
        created_at: progress_row.get("created_at"),
        updated_at: progress_row.get("updated_at"),
    })
}

#[tauri::command]
pub async fn get_user_progress(
    db: State<'_, Database>,
    user_id: i64,
    limit: Option<i64>,
    offset: Option<i64>,
) -> Result<Vec<Progress>, String> {
    let limit = limit.unwrap_or(100);
    let offset = offset.unwrap_or(0);

    let rows = sqlx::query("SELECT * FROM progress WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?")
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let progress_entries: Vec<Progress> = rows.into_iter().map(|row| Progress {
        id: row.get("id"),
        user_id: row.get("user_id"),
        category: row.get("category"),
        metric: row.get("metric"),
        value: row.get("value"),
        unit: row.get("unit"),
        notes: row.get("notes"),
        date: row.get("date"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    }).collect();

    Ok(progress_entries)
}

#[tauri::command]
pub async fn get_user_progress_by_id(
    db: State<'_, Database>,
    target_user_id: i64,
    limit: Option<i64>,
    offset: Option<i64>,
) -> Result<Vec<Progress>, String> {
    let limit = limit.unwrap_or(100);
    let offset = offset.unwrap_or(0);

    let rows = sqlx::query("SELECT * FROM progress WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?")
        .bind(target_user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let progress_entries: Vec<Progress> = rows.into_iter().map(|row| Progress {
        id: row.get("id"),
        user_id: row.get("user_id"),
        category: row.get("category"),
        metric: row.get("metric"),
        value: row.get("value"),
        unit: row.get("unit"),
        notes: row.get("notes"),
        date: row.get("date"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    }).collect();

    Ok(progress_entries)
}

#[tauri::command]
pub async fn update_progress(
    db: State<'_, Database>,
    progress_id: i64,
    user_id: i64,
    update_data: ProgressUpdate,
) -> Result<Progress, String> {
    // Verify ownership
    let ownership_check = sqlx::query("SELECT id FROM progress WHERE id = ? AND user_id = ?")
        .bind(progress_id)
        .bind(user_id)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    if ownership_check.is_none() {
        return Err("Progress entry not found".to_string());
    }

    let mut has_updates = false;

    if let Some(category) = &update_data.category {
        sqlx::query("UPDATE progress SET category = ? WHERE id = ?")
            .bind(category)
            .bind(progress_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if let Some(metric) = &update_data.metric {
        sqlx::query("UPDATE progress SET metric = ? WHERE id = ?")
            .bind(metric)
            .bind(progress_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if let Some(value) = update_data.value {
        sqlx::query("UPDATE progress SET value = ? WHERE id = ?")
            .bind(value)
            .bind(progress_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if let Some(unit) = &update_data.unit {
        sqlx::query("UPDATE progress SET unit = ? WHERE id = ?")
            .bind(unit)
            .bind(progress_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if let Some(notes) = &update_data.notes {
        sqlx::query("UPDATE progress SET notes = ? WHERE id = ?")
            .bind(notes)
            .bind(progress_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if let Some(date) = update_data.date {
        sqlx::query("UPDATE progress SET date = ? WHERE id = ?")
            .bind(date)
            .bind(progress_id)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        has_updates = true;
    }

    if !has_updates {
        return Err("No fields to update".to_string());
    }

    sqlx::query("UPDATE progress SET updated_at = datetime('now') WHERE id = ?")
        .bind(progress_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    // Fetch updated progress
    let progress_row = sqlx::query("SELECT * FROM progress WHERE id = ?")
        .bind(progress_id)
        .fetch_one(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(Progress {
        id: progress_row.get("id"),
        user_id: progress_row.get("user_id"),
        category: progress_row.get("category"),
        metric: progress_row.get("metric"),
        value: progress_row.get("value"),
        unit: progress_row.get("unit"),
        notes: progress_row.get("notes"),
        date: progress_row.get("date"),
        created_at: progress_row.get("created_at"),
        updated_at: progress_row.get("updated_at"),
    })
}

#[tauri::command]
pub async fn delete_progress(
    db: State<'_, Database>,
    progress_id: i64,
    user_id: i64,
) -> Result<(), String> {
    // Verify ownership
    let ownership_check = sqlx::query("SELECT id FROM progress WHERE id = ? AND user_id = ?")
        .bind(progress_id)
        .bind(user_id)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    if ownership_check.is_none() {
        return Err("Progress entry not found".to_string());
    }

    sqlx::query("DELETE FROM progress WHERE id = ?")
        .bind(progress_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}