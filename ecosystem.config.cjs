/**
 * PM2 Ecosystem Config — Prime Packaging Boxes
 * cPanel server pe PM2 se API server chalane ke liye
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup   (auto-restart on reboot)
 */
module.exports = {
  apps: [
    {
      name: "prime-packaging",
      script: "./artifacts/api-server/dist/index.mjs",
      cwd: "/home/{YOUR_CPANEL_USERNAME}/prime-packaging-boxes",  // ← apna path likhna
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",           // cPanel Node.js App Manager se match karein
        // DATABASE_URL aur SESSION_SECRET .env file se load honge
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
