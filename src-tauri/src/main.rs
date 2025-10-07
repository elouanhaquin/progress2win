mod database;
mod models;
mod commands;
mod error;

use database::Database;
use commands::*;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize database with app handle
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let db = Database::new(&handle).await.expect("Failed to initialize database");
                app.manage(db);
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Auth commands
            register_user,
            login_user,
            logout_user,
            refresh_token,
            forgot_password,
            reset_password,
            get_current_user,
            
            // User commands
            get_user_profile,
            update_user_profile,
            delete_user_account,
            
            // Progress commands
            add_progress,
            get_user_progress,
            get_user_progress_by_id,
            update_progress,
            delete_progress,
            
            // Compare commands
            compare_progress,
            invite_friend,
            get_leaderboard,
            
            // Notification commands
            get_notifications,
            create_notification,
            mark_notification_read,
            delete_notification,
            
            // Subscription commands
            create_checkout_session,
            get_subscription,
            cancel_subscription,
            handle_stripe_webhook,
            
            // Settings commands
            get_settings,
            update_settings,
            get_metrics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}
