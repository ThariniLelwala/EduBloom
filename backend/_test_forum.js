const db = require('./db/db');

setTimeout(async () => {
  try {
    // Check table columns
    const r = await db.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'forum_posts'"
    );
    console.log('forum_posts columns:', JSON.stringify(r.rows));

    // Try a test insert and rollback
    await db.query('BEGIN');
    const insertResult = await db.query(
      "INSERT INTO forum_posts (author_id, title, description, published) VALUES (1, 'test', 'test desc', true) RETURNING *"
    );
    console.log('Insert test result:', JSON.stringify(insertResult.rows));
    await db.query('ROLLBACK');
    console.log('Rolled back test insert');
  } catch (e) {
    console.error('ERROR:', e.message);
    try { await db.query('ROLLBACK'); } catch(e2) {}
  }
  process.exit(0);
}, 1000);
