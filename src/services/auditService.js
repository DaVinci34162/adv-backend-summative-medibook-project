const fs = require('fs/promises');
const path = require('path');
const { AUDIT_LOG_PATH } = require('../utils/constants');

async function logEvent(event, payload) {
  try {
    // 1. Ensure the logs/ directory exists (recursive: true acts like mkdir -p)
    await fs.mkdir(path.dirname(AUDIT_LOG_PATH), { recursive: true });
    
    // 2. Append the JSON line (async, non-blocking)
    const logLine = JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      event, 
      ...payload 
    }) + '\n';
    
    await fs.appendFile(AUDIT_LOG_PATH, logLine);
  } catch (err) {
    // 3. Swallow the error so a logging failure never crashes the user's request
    console.error('Failed to write to audit log:', err.message);
  }
}

module.exports = { logEvent };