module.exports = {
  apps: [
    {
      name: "launchix-api",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        MONGO_URL: "mongodb+srv://launchixai_db_user:TdKQsrePYY2a3mY1@launchix0.0pblfpo.mongodb.net/",
        PORT: 5000
        
      }
    }
  ]
};
