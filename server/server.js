require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🧺 DIWAKAR JI LAUNDRY — NODE.JS / EXPRESS API SERVER`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Public API:   http://localhost:${PORT}/api/public/config`);
      console.log(`🔒 Admin Auth:   http://localhost:${PORT}/api/admin/login`);
      console.log(`====================================================`);
    });

    return server;
  } catch (err) {
    console.error('Fatal server startup failure:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
