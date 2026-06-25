const bcrypt = require('bcryptjs');

const hash = '$2b$10$z0XD20JsXM2oA0j/8EVS0ekmNnSCqmSm2KBYELroy1KPeEuKsmFm.';

async function check() {
  const candidates = ['admin123', 'admin', 'uplern', 'uplern123', 'system', 'system123', 'admin@uplern.com'];
  for (const c of candidates) {
    const match = await bcrypt.compare(c, hash);
    console.log(`Candidate "${c}":`, match);
  }
}

check();
