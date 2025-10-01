module.exports = {
  apps: [
    {
      name: "launchix-api",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        MONGO_URI: "mongodb+srv://username:password@cluster0.mongodb.net/mydb",
        PORT: 3000
      }
    }
  ]
};
