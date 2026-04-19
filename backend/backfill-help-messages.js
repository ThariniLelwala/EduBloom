const db = require("./db/db");

async function backfillHelpRequestMessages() {
  try {
    console.log("Starting backfill of help request messages...");

    // Find all help requests without messages
    const result = await db.query(`
      SELECT hr.id, hr.user_id, hr.message, hr.created_at
      FROM help_requests hr
      WHERE NOT EXISTS (
        SELECT 1 FROM help_request_messages hrm 
        WHERE hrm.help_request_id = hr.id
      )
    `);

    const ticketsWithoutMessages = result.rows;
    console.log(`Found ${ticketsWithoutMessages.length} help requests without messages`);

    if (ticketsWithoutMessages.length === 0) {
      console.log("No backfill needed. All help requests already have messages.");
      return;
    }

    // Insert initial messages for each ticket
    let successCount = 0;
    for (const ticket of ticketsWithoutMessages) {
      try {
        await db.query(`
          INSERT INTO help_request_messages (help_request_id, user_id, message, is_admin, created_at)
          VALUES ($1, $2, $3, FALSE, $4)
        `, [ticket.id, ticket.user_id, ticket.message, ticket.created_at]);
        
        console.log(`✓ Created initial message for ticket ${ticket.id}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to create message for ticket ${ticket.id}:`, error.message);
      }
    }

    console.log(`\nBackfill complete! Successfully created ${successCount} out of ${ticketsWithoutMessages.length} messages.`);

  } catch (error) {
    console.error("Error during backfill:", error);
    throw error;
  } finally {
    await db.end();
  }
}

// Run the backfill
backfillHelpRequestMessages()
  .then(() => {
    console.log("Backfill script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill script failed:", error);
    process.exit(1);
  });
