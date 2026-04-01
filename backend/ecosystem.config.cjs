module.exports = {
  apps: [
    {
      name: "skincare-backend",
      cwd: __dirname,
      script: "src/index.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
