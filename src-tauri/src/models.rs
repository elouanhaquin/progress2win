use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, NaiveDate};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i64,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub avatar_url: Option<String>,
    pub goals: Vec<String>,
    pub is_active: bool,
    pub email_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserCreate {
    pub email: String,
    pub password: String,
    pub first_name: String,
    pub last_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserUpdate {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
    pub goals: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: User,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Progress {
    pub id: i64,
    pub user_id: i64,
    pub category: String,
    pub metric: String,
    pub value: f64,
    pub unit: Option<String>,
    pub notes: Option<String>,
    pub date: NaiveDate,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProgressCreate {
    pub category: String,
    pub metric: String,
    pub value: f64,
    pub unit: Option<String>,
    pub notes: Option<String>,
    pub date: NaiveDate,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProgressUpdate {
    pub category: Option<String>,
    pub metric: Option<String>,
    pub value: Option<f64>,
    pub unit: Option<String>,
    pub notes: Option<String>,
    pub date: Option<NaiveDate>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Notification {
    pub id: i64,
    pub user_id: i64,
    pub title: String,
    pub message: String,
    pub notification_type: String,
    pub is_read: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationCreate {
    pub user_id: i64,
    pub title: String,
    pub message: String,
    pub notification_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Subscription {
    pub id: i64,
    pub user_id: i64,
    pub stripe_customer_id: Option<String>,
    pub stripe_subscription_id: Option<String>,
    pub status: String,
    pub plan_type: String,
    pub current_period_start: Option<DateTime<Utc>>,
    pub current_period_end: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Setting {
    pub id: i64,
    pub key: String,
    pub value: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Metrics {
    pub total_users: i64,
    pub total_progress_entries: i64,
    pub average_progress_per_user: f64,
    pub most_popular_category: Option<String>,
    pub most_popular_metric: Option<String>,
}
