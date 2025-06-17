module.exports = {
  apps: [
    {
      name: "ft_transcendence",
      script: "./dist/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
