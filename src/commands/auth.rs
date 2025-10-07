use tauri::State;
use serde_json::Value;
use sqlx::Row;
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use chrono::{Utc, Duration};
use uuid::Uuid;

use crate::database::Database;
use crate::models::*;
use crate::error::AppError;

const JWT_SECRET: &str = "your-super-secret-jwt-key-change-in-production";

// Auth commands
#[tauri::command]
pub async fn register_user(
    db: State<'_, Database>,
    user_data: UserCreate,
) -> Result<User, String> {
    // Validate email format
    if !user_data.email.contains('@') {
        return Err("Invalid email format".to_string());
    }

    // Check if user already exists
    let existing_user = sqlx::query("SELECT id FROM users WHERE email = ?")
        .bind(&user_data.email)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    if existing_user.is_some() {
        return Err("User already exists".to_string());
    }

    // Hash password
    let password_hash = hash(&user_data.password, DEFAULT_COST)
        .map_err(|e| format!("Password hashing failed: {}", e))?;

    // Insert user
    let result = sqlx::query(
        "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)"
    )
    .bind(&user_data.email)
    .bind(&password_hash)
    .bind(&user_data.first_name)
    .bind(&user_data.last_name)
    .execute(db.get_pool())
    .await
    .map_err(|e| e.to_string())?;

    let user_id = result.last_insert_rowid();

    // Fetch created user
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
pub async fn login_user(
    db: State<'_, Database>,
    login_data: LoginRequest,
) -> Result<AuthResponse, String> {
    // Find user
    let result = sqlx::query("SELECT * FROM users WHERE email = ? AND is_active = 1")
        .bind(&login_data.email)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let user_row = match result {
        Some(row) => row,
        None => return Err("Invalid credentials".to_string()),
    };

    // Verify password
    let password_hash: String = user_row.get("password_hash");
    let is_valid = verify(&login_data.password, &password_hash)
        .map_err(|e| format!("Password verification failed: {}", e))?;

    if !is_valid {
        return Err("Invalid credentials".to_string());
    }

    let user = User {
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
    };

    // Generate tokens
    let access_token = generate_access_token(user.id)?;
    let refresh_token = generate_refresh_token(user.id)?;

    // Store refresh token
    let expires_at = Utc::now() + Duration::days(30);
    sqlx::query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)")
        .bind(user.id)
        .bind(&refresh_token)
        .bind(expires_at)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(AuthResponse {
        access_token,
        refresh_token,
        user,
    })
}

#[tauri::command]
pub async fn logout_user(
    db: State<'_, Database>,
    refresh_token: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM refresh_tokens WHERE token = ?")
        .bind(&refresh_token)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn refresh_token(
    db: State<'_, Database>,
    refresh_token: String,
) -> Result<AuthResponse, String> {
    // Verify refresh token
    let token_data = decode::<serde_json::Value>(
        &refresh_token,
        &DecodingKey::from_secret(JWT_SECRET.as_ref()),
        &Validation::new(Algorithm::HS256),
    ).map_err(|_| "Invalid refresh token".to_string())?;

    let user_id = token_data.claims.get("user_id")
        .and_then(|v| v.as_i64())
        .ok_or_else(|| "Invalid token format".to_string())?;

    // Check if refresh token exists in database
    let token_row = sqlx::query("SELECT user_id FROM refresh_tokens WHERE token = ? AND expires_at > datetime('now')")
        .bind(&refresh_token)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    if token_row.is_none() {
        return Err("Invalid refresh token".to_string());
    }

    // Get user
    let user_row = sqlx::query("SELECT * FROM users WHERE id = ? AND is_active = 1")
        .bind(user_id)
        .fetch_one(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let user = User {
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
    };

    // Generate new tokens
    let new_access_token = generate_access_token(user.id)?;
    let new_refresh_token = generate_refresh_token(user.id)?;

    // Update refresh token in database
    let expires_at = Utc::now() + Duration::days(30);
    sqlx::query("UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE token = ?")
        .bind(&new_refresh_token)
        .bind(expires_at)
        .bind(&refresh_token)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(AuthResponse {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
        user,
    })
}

#[tauri::command]
pub async fn forgot_password(
    db: State<'_, Database>,
    email: String,
) -> Result<(), String> {
    // Check if user exists
    let user_row = sqlx::query("SELECT id FROM users WHERE email = ?")
        .bind(&email)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    if user_row.is_none() {
        // Don't reveal if email exists or not
        return Ok(());
    }

    let user_id: i64 = user_row.unwrap().get("id");

    // Generate reset token
    let reset_token = Uuid::new_v4().to_string();
    let expires_at = Utc::now() + Duration::hours(1);

    // Store reset token
    sqlx::query("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)")
        .bind(user_id)
        .bind(&reset_token)
        .bind(expires_at)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    // TODO: Send email with reset link
    println!("Password reset token for {}: {}", email, reset_token);

    Ok(())
}

#[tauri::command]
pub async fn reset_password(
    db: State<'_, Database>,
    token: String,
    password: String,
) -> Result<(), String> {
    // Find valid reset token
    let token_row = sqlx::query("SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > datetime('now') AND used = 0")
        .bind(&token)
        .fetch_optional(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    let user_id = match token_row {
        Some(row) => row.get("user_id"),
        None => return Err("Invalid or expired reset token".to_string()),
    };

    // Hash new password
    let password_hash = hash(&password, DEFAULT_COST)
        .map_err(|e| format!("Password hashing failed: {}", e))?;

    // Update password
    sqlx::query("UPDATE users SET password_hash = ? WHERE id = ?")
        .bind(&password_hash)
        .bind(user_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    // Mark token as used
    sqlx::query("UPDATE password_reset_tokens SET used = 1 WHERE token = ?")
        .bind(&token)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    // Remove all refresh tokens for this user
    sqlx::query("DELETE FROM refresh_tokens WHERE user_id = ?")
        .bind(user_id)
        .execute(db.get_pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_current_user(
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

// Helper functions
fn generate_access_token(user_id: i64) -> Result<String, String> {
    let claims = serde_json::json!({
        "user_id": user_id,
        "exp": (Utc::now() + Duration::days(7)).timestamp(),
        "iat": Utc::now().timestamp(),
    });

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET.as_ref()),
    ).map_err(|e| format!("Token generation failed: {}", e))
}

fn generate_refresh_token(user_id: i64) -> Result<String, String> {
    let claims = serde_json::json!({
        "user_id": user_id,
        "type": "refresh",
        "exp": (Utc::now() + Duration::days(30)).timestamp(),
        "iat": Utc::now().timestamp(),
    });

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET.as_ref()),
    ).map_err(|e| format!("Token generation failed: {}", e))
}