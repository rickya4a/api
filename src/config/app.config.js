module.exports = {
  apps : [{
    name: 'API Tracking WMS',
    script: 'dist/server.js',
    node_args: '-r dotenv/config',
    watch: true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }],
}