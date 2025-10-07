use tauri::State;
use sqlx::Row;
use crate::database::Database;
use crate::models::*;

// Notification commands
#[tauri::command]
pub async fn get_notifications(
    db: State<'_, Database>,
    user_id: i64,
    limit: Option<i64>,
    offset: Option<i64>,
) -> Result<Vec<Notification>, String> {
    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);

    let rows = sqlx::query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let notifications: Vec<Notification> = rows.into_iter().map(|row| Notification {
        id: row.get("id"),
        user_id: row.get("user_id"),
        title: row.get("title"),
        message: row.get("message"),
        notification_type: row.get("type"),
        is_read: row.get("is_read"),
        created_at: row.get("created_at"),
    }).collect();

    Ok(notifications)
}

#[tauri::command]
pub async fn create_notification(
    db: State<'_, Database>,
    notification_data: NotificationCreate,
) -> Result<Notification, String> {
    let result = sqlx::query(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)"
    )
    .bind(notification_data.user_id)
    .bind(&notification_data.title)
    .bind(&notification_data.message)
    .bind(notification_data.notification_type.unwrap_or_else(|| "info".to_string()))
    .execute(db.get_pool())
    .await
    .map_err(|e| e.to_string())?;

    let notification_id = result.last_insert_rowid();

    let notification_row = sqlx::query("SELECT * FROM notifications WHERE id = ?")
        .bind(notification_id)
        .fetch_one(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(Notification {
        id: notification_row.get("id"),
        user_id: notification_row.get("user_id"),
        title: notification_row.get("title"),
        message: notification_row.get("message"),
        notification_type: notification_row.get("type"),
        is_read: notification_row.get("is_read"),
        created_at: notification_row.get("created_at"),
    })
}

#[tauri::command]
pub async fn mark_notification_read(
    db: State<'_, Database>,
    notification_id: i64,
    user_id: i64,
) -> Result<(), String> {
    // Verify ownership
    let ownership_check = sqlx::query("SELECT id FROM notifications WHERE id = ? AND user_id = ?")
        .bind(notification_id)
        .bind(user_id)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    if ownership_check.is_none() {
        return Err("Notification not found".to_string());
    }

    sqlx::query("UPDATE notifications SET is_read = 1 WHERE id = ?")
        .bind(notification_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_notification(
    db: State<'_, Database>,
    notification_id: i64,
    user_id: i64,
) -> Result<(), String> {
    // Verify ownership
    let ownership_check = sqlx::query("SELECT id FROM notifications WHERE id = ? AND user_id = ?")
        .bind(notification_id)
        .bind(user_id)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    if ownership_check.is_none() {
        return Err("Notification not found".to_string());
    }

    sqlx::query("DELETE FROM notifications WHERE id = ?")
        .bind(notification_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Subscription commands
#[tauri::command]
pub async fn create_checkout_session(
    db: State<'_, Database>,
    user_id: i64,
    plan_type: String,
) -> Result<String, String> {
    // TODO: Integrate with Stripe
    // For now, return a mock session ID
    let session_id = format!("cs_test_{}", uuid::Uuid::new_v4());
    
    // Store subscription intent
    sqlx::query("INSERT INTO subscriptions (user_id, status, plan_type) VALUES (?, 'pending', ?)")
        .bind(user_id)
        .bind(&plan_type)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(session_id)
}

#[tauri::command]
pub async fn get_subscription(
    db: State<'_, Database>,
    user_id: i64,
) -> Result<Option<Subscription>, String> {
    let subscription_row = sqlx::query("SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1")
        .bind(user_id)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    match subscription_row {
        Some(row) => Ok(Some(Subscription {
            id: row.get("id"),
            user_id: row.get("user_id"),
            stripe_customer_id: row.get("stripe_customer_id"),
            stripe_subscription_id: row.get("stripe_subscription_id"),
            status: row.get("status"),
            plan_type: row.get("plan_type"),
            current_period_start: row.get("current_period_start"),
            current_period_end: row.get("current_period_end"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })),
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn cancel_subscription(
    db: State<'_, Database>,
    user_id: i64,
) -> Result<(), String> {
    sqlx::query("UPDATE subscriptions SET status = 'canceled', updated_at = datetime('now') WHERE user_id = ? AND status = 'active'")
        .bind(user_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn handle_stripe_webhook(
    _db: State<'_, Database>,
    webhook_data: serde_json::Value,
) -> Result<(), String> {
    // TODO: Implement Stripe webhook handling
    println!("Stripe webhook received: {:?}", webhook_data);
    Ok(())
}

// Settings commands
#[tauri::command]
pub async fn get_settings(
    db: State<'_, Database>,
) -> Result<Vec<Setting>, String> {
    let rows = sqlx::query("SELECT * FROM settings ORDER BY key")
        .fetch_all(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let settings: Vec<Setting> = rows.into_iter().map(|row| Setting {
        id: row.get("id"),
        key: row.get("key"),
        value: row.get("value"),
        description: row.get("description"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    }).collect();

    Ok(settings)
}

#[tauri::command]
pub async fn update_settings(
    db: State<'_, Database>,
    settings: Vec<(String, String)>,
) -> Result<(), String> {
    for (key, value) in settings {
        sqlx::query("UPDATE settings SET value = ?, updated_at = datetime('now') WHERE key = ?")
            .bind(&value)
            .bind(&key)
            .execute(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn get_metrics(
    db: State<'_, Database>,
) -> Result<Metrics, String> {
    // Get total users
    let total_users_row = sqlx::query("SELECT COUNT(*) as count FROM users WHERE is_active = 1")
        .fetch_one(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;
    let total_users: i64 = total_users_row.get("count");

    // Get total progress entries
    let total_progress_row = sqlx::query("SELECT COUNT(*) as count FROM progress")
        .fetch_one(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;
    let total_progress_entries: i64 = total_progress_row.get("count");

    // Calculate average progress per user
    let avg_progress_per_user = if total_users > 0 {
        total_progress_entries as f64 / total_users as f64
    } else {
        0.0
    };

    // Get most popular category
    let popular_category_row = sqlx::query("SELECT category FROM progress GROUP BY category ORDER BY COUNT(*) DESC LIMIT 1")
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;
    let most_popular_category = popular_category_row.map(|row| row.get::<String, _>("category"));

    // Get most popular metric
    let popular_metric_row = sqlx::query("SELECT metric FROM progress GROUP BY metric ORDER BY COUNT(*) DESC LIMIT 1")
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;
    let most_popular_metric = popular_metric_row.map(|row| row.get::<String, _>("metric"));

    Ok(Metrics {
        total_users,
        total_progress_entries,
        average_progress_per_user: avg_progress_per_user,
        most_popular_category,
        most_popular_metric,
    })
}