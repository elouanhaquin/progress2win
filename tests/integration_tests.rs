#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::Database;
    use crate::models::*;
    use chrono::NaiveDate;

    async fn setup_test_db() -> Database {
        let db = Database::new().await.expect("Failed to create test database");
        
        // Clean up test data
        sqlx::query("DELETE FROM refresh_tokens").execute(db.get_pool()).await.unwrap();
        sqlx::query("DELETE FROM password_reset_tokens").execute(db.get_pool()).await.unwrap();
        sqlx::query("DELETE FROM progress").execute(db.get_pool()).await.unwrap();
        sqlx::query("DELETE FROM notifications").execute(db.get_pool()).await.unwrap();
        sqlx::query("DELETE FROM subscriptions").execute(db.get_pool()).await.unwrap();
        sqlx::query("DELETE FROM user_friends").execute(db.get_pool()).await.unwrap();
        sqlx::query("DELETE FROM users").execute(db.get_pool()).await.unwrap();
        
        db
    }

    #[tokio::test]
    async fn test_register_user() {
        let db = setup_test_db().await;
        
        let user_data = UserCreate {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
        };

        let result = register_user(tauri::State::from(&db), user_data).await;
        assert!(result.is_ok());
        
        let user = result.unwrap();
        assert_eq!(user.email, "test@example.com");
        assert_eq!(user.first_name, "John");
        assert_eq!(user.last_name, "Doe");
    }

    #[tokio::test]
    async fn test_register_duplicate_user() {
        let db = setup_test_db().await;
        
        let user_data = UserCreate {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
        };

        // Register first user
        let result1 = register_user(tauri::State::from(&db), user_data.clone()).await;
        assert!(result1.is_ok());

        // Try to register duplicate
        let result2 = register_user(tauri::State::from(&db), user_data).await;
        assert!(result2.is_err());
        assert!(matches!(result2.unwrap_err(), AppError::Conflict(_)));
    }

    #[tokio::test]
    async fn test_login_user() {
        let db = setup_test_db().await;
        
        // Register user first
        let user_data = UserCreate {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
        };
        
        let user = register_user(tauri::State::from(&db), user_data).await.unwrap();

        // Login with correct credentials
        let login_data = LoginRequest {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
        };

        let result = login_user(tauri::State::from(&db), login_data).await;
        assert!(result.is_ok());
        
        let auth_response = result.unwrap();
        assert_eq!(auth_response.user.id, user.id);
        assert!(!auth_response.access_token.is_empty());
        assert!(!auth_response.refresh_token.is_empty());
    }

    #[tokio::test]
    async fn test_login_invalid_credentials() {
        let db = setup_test_db().await;
        
        let login_data = LoginRequest {
            email: "nonexistent@example.com".to_string(),
            password: "wrongpassword".to_string(),
        };

        let result = login_user(tauri::State::from(&db), login_data).await;
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), AppError::Auth(_)));
    }

    #[tokio::test]
    async fn test_add_progress() {
        let db = setup_test_db().await;
        
        // Register user first
        let user_data = UserCreate {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
        };
        
        let user = register_user(tauri::State::from(&db), user_data).await.unwrap();

        // Add progress
        let progress_data = ProgressCreate {
            category: "fitness".to_string(),
            metric: "weight".to_string(),
            value: 75.5,
            unit: Some("kg".to_string()),
            notes: Some("Morning weight".to_string()),
            date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        };

        let result = add_progress(tauri::State::from(&db), user.id, progress_data).await;
        assert!(result.is_ok());
        
        let progress = result.unwrap();
        assert_eq!(progress.user_id, user.id);
        assert_eq!(progress.category, "fitness");
        assert_eq!(progress.metric, "weight");
        assert_eq!(progress.value, 75.5);
    }

    #[tokio::test]
    async fn test_get_user_progress() {
        let db = setup_test_db().await;
        
        // Register user and add progress
        let user_data = UserCreate {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
        };
        
        let user = register_user(tauri::State::from(&db), user_data).await.unwrap();

        let progress_data = ProgressCreate {
            category: "fitness".to_string(),
            metric: "weight".to_string(),
            value: 75.5,
            unit: Some("kg".to_string()),
            notes: None,
            date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        };

        add_progress(tauri::State::from(&db), user.id, progress_data).await.unwrap();

        // Get user progress
        let result = get_user_progress(tauri::State::from(&db), user.id, Some(10), Some(0)).await;
        assert!(result.is_ok());
        
        let progress_list = result.unwrap();
        assert_eq!(progress_list.len(), 1);
        assert_eq!(progress_list[0].user_id, user.id);
    }

    #[tokio::test]
    async fn test_update_user_profile() {
        let db = setup_test_db().await;
        
        // Register user
        let user_data = UserCreate {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
        };
        
        let user = register_user(tauri::State::from(&db), user_data).await.unwrap();

        // Update profile
        let update_data = UserUpdate {
            first_name: Some("Jane".to_string()),
            last_name: Some("Smith".to_string()),
            avatar_url: Some("https://example.com/avatar.jpg".to_string()),
            goals: Some(vec!["Lose weight".to_string(), "Run 5k".to_string()]),
        };

        let result = update_user_profile(tauri::State::from(&db), user.id, update_data).await;
        assert!(result.is_ok());
        
        let updated_user = result.unwrap();
        assert_eq!(updated_user.first_name, "Jane");
        assert_eq!(updated_user.last_name, "Smith");
        assert_eq!(updated_user.goals.len(), 2);
    }

    #[tokio::test]
    async fn test_create_notification() {
        let db = setup_test_db().await;
        
        // Register user
        let user_data = UserCreate {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "John".to_string(),
            last_name: "Doe".to_string(),
        };
        
        let user = register_user(tauri::State::from(&db), user_data).await.unwrap();

        // Create notification
        let notification_data = NotificationCreate {
            user_id: user.id,
            title: "Test Notification".to_string(),
            message: "This is a test notification".to_string(),
            notification_type: Some("info".to_string()),
        };

        let result = create_notification(tauri::State::from(&db), notification_data).await;
        assert!(result.is_ok());
        
        let notification = result.unwrap();
        assert_eq!(notification.user_id, user.id);
        assert_eq!(notification.title, "Test Notification");
        assert_eq!(notification.is_read, false);
    }

    #[tokio::test]
    async fn test_get_metrics() {
        let db = setup_test_db().await;
        
        // Register users and add progress
        let user_data1 = UserCreate {
            email: "user1@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "User".to_string(),
            last_name: "One".to_string(),
        };
        
        let user_data2 = UserCreate {
            email: "user2@example.com".to_string(),
            password: "password123".to_string(),
            first_name: "User".to_string(),
            last_name: "Two".to_string(),
        };
        
        let user1 = register_user(tauri::State::from(&db), user_data1).await.unwrap();
        let user2 = register_user(tauri::State::from(&db), user_data2).await.unwrap();

        // Add progress for both users
        let progress_data1 = ProgressCreate {
            category: "fitness".to_string(),
            metric: "weight".to_string(),
            value: 75.0,
            unit: Some("kg".to_string()),
            notes: None,
            date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        };

        let progress_data2 = ProgressCreate {
            category: "fitness".to_string(),
            metric: "weight".to_string(),
            value: 80.0,
            unit: Some("kg".to_string()),
            notes: None,
            date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        };

        add_progress(tauri::State::from(&db), user1.id, progress_data1).await.unwrap();
        add_progress(tauri::State::from(&db), user2.id, progress_data2).await.unwrap();

        // Get metrics
        let result = get_metrics(tauri::State::from(&db)).await;
        assert!(result.is_ok());
        
        let metrics = result.unwrap();
        assert_eq!(metrics.total_users, 2);
        assert_eq!(metrics.total_progress_entries, 2);
        assert_eq!(metrics.average_progress_per_user, 1.0);
        assert_eq!(metrics.most_popular_category, Some("fitness".to_string()));
        assert_eq!(metrics.most_popular_metric, Some("weight".to_string()));
    }
}
