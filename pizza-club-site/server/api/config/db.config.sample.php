<?php
/**
 * Database Configuration Sample
 * 
 * Copy this file to db.config.php and update with your database credentials
 * For shared hosting, this is the only method that works (no environment variables)
 * 
 * IMPORTANT: Never commit db.config.php to version control!
 */

return [
    'host' => 'localhost',  // Usually 'localhost' for shared hosting
    'db_name' => 'yourprefix_databasename',  // From cPanel: e.g., 'greacspm_pizza_club'
    'username' => 'yourprefix_username',      // From cPanel: e.g., 'greacspm_pizza_user'
    'password' => 'your_password_here'        // The password you created for the database user
];