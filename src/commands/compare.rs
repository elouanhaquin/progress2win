use tauri::State;
use sqlx::Row;
use crate::database::Database;

// Compare commands
#[tauri::command]
pub async fn compare_progress(
    db: State<'_, Database>,
    user_id: i64,
    friend_ids: Vec<i64>,
    category: Option<String>,
    metric: Option<String>,
) -> Result<serde_json::Value, String> {
    let mut comparison_data = serde_json::Map::new();

    // Get user's progress
    let mut user_query = "SELECT * FROM progress WHERE user_id = ?".to_string();
    
    if category.is_some() {
        user_query.push_str(" AND category = ?");
    }
    if metric.is_some() {
        user_query.push_str(" AND metric = ?");
    }
    user_query.push_str(" ORDER BY date DESC");

    let mut query_builder = sqlx::query(&user_query).bind(user_id);
    
    if let Some(cat) = &category {
        query_builder = query_builder.bind(cat);
    }
    if let Some(met) = &metric {
        query_builder = query_builder.bind(met);
    }

    let user_progress = query_builder
        .fetch_all(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;
    
    let user_progress_json: Vec<serde_json::Value> = user_progress.into_iter().map(|row| {
        serde_json::json!({
            "id": row.get::<i64, _>("id"),
            "category": row.get::<String, _>("category"),
            "metric": row.get::<String, _>("metric"),
            "value": row.get::<f64, _>("value"),
            "unit": row.get::<Option<String>, _>("unit"),
            "date": row.get::<String, _>("date"),
            "notes": row.get::<Option<String>, _>("notes")
        })
    }).collect();

    comparison_data.insert("user".to_string(), serde_json::Value::Array(user_progress_json));

    // Get friends' progress
    for friend_id in friend_ids {
        let mut friend_query = "SELECT * FROM progress WHERE user_id = ?".to_string();
        
        if category.is_some() {
            friend_query.push_str(" AND category = ?");
        }
        if metric.is_some() {
            friend_query.push_str(" AND metric = ?");
        }
        friend_query.push_str(" ORDER BY date DESC");

        let mut friend_query_builder = sqlx::query(&friend_query).bind(friend_id);
        
        if let Some(cat) = &category {
            friend_query_builder = friend_query_builder.bind(cat);
        }
        if let Some(met) = &metric {
            friend_query_builder = friend_query_builder.bind(met);
        }

        let friend_progress = friend_query_builder
            .fetch_all(db.get_pool())
            .await
            .map_err(|e| e.to_string())?;
        
        let friend_progress_json: Vec<serde_json::Value> = friend_progress.into_iter().map(|row| {
            serde_json::json!({
                "id": row.get::<i64, _>("id"),
                "category": row.get::<String, _>("category"),
                "metric": row.get::<String, _>("metric"),
                "value": row.get::<f64, _>("value"),
                "unit": row.get::<Option<String>, _>("unit"),
                "date": row.get::<String, _>("date"),
                "notes": row.get::<Option<String>, _>("notes")
            })
        }).collect();

        comparison_data.insert(format!("friend_{}", friend_id), serde_json::Value::Array(friend_progress_json));
    }

    Ok(serde_json::Value::Object(comparison_data))
}

#[tauri::command]
pub async fn invite_friend(
    db: State<'_, Database>,
    user_id: i64,
    friend_email: String,
) -> Result<(), String> {
    // Find friend by email
    let friend_row = sqlx::query("SELECT id FROM users WHERE email = ?")
        .bind(&friend_email)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let friend_id = match friend_row {
        Some(row) => row.get("id"),
        None => return Err("User not found".to_string()),
    };

    // Check if friendship already exists
    let existing_friendship = sqlx::query("SELECT id FROM user_friends WHERE user_id = ? AND friend_id = ?")
        .bind(user_id)
        .bind(friend_id)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    if existing_friendship.is_some() {
        return Err("Friendship already exists".to_string());
    }

    // Create friendship invitation
    sqlx::query("INSERT INTO user_friends (user_id, friend_id, status) VALUES (?, ?, 'pending')")
        .bind(user_id)
        .bind(friend_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    // Create a notification
    sqlx::query("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'info')")
        .bind(friend_id)
        .bind("New Friend Invitation")
        .bind("You have received a friend invitation to compare progress!")
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_leaderboard(
    db: State<'_, Database>,
    category: Option<String>,
    metric: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<serde_json::Value>, String> {
    let limit = limit.unwrap_or(10);

    let mut query = r#"
        SELECT u.id, u.first_name, u.last_name, u.avatar_url, 
               AVG(p.value) as avg_value, COUNT(p.id) as entry_count
        FROM users u
        JOIN progress p ON u.id = p.user_id
        WHERE u.is_active = 1
    "#.to_string();

    if category.is_some() {
        query.push_str(" AND p.category = ?");
    }
    if metric.is_some() {
        query.push_str(" AND p.metric = ?");
    }

    query.push_str(" GROUP BY u.id, u.first_name, u.last_name, u.avatar_url ORDER BY avg_value DESC LIMIT ?");

    let mut query_builder = sqlx::query(&query);
    
    if let Some(cat) = category {
        query_builder = query_builder.bind(cat);
    }
    if let Some(met) = metric {
        query_builder = query_builder.bind(met);
    }
    query_builder = query_builder.bind(limit);

    let rows = query_builder
        .fetch_all(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let leaderboard: Vec<serde_json::Value> = rows.into_iter().map(|row| {
        serde_json::json!({
            "user_id": row.get::<i64, _>("id"),
            "first_name": row.get::<String, _>("first_name"),
            "last_name": row.get::<String, _>("last_name"),
            "avatar_url": row.get::<Option<String>, _>("avatar_url"),
            "avg_value": row.get::<f64, _>("avg_value"),
            "entry_count": row.get::<i64, _>("entry_count")
        })
    }).collect();

    Ok(leaderboard)
}