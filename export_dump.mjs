import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/primedb' });

async function dump() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  
  const tables = res.rows.map(r => r.table_name);
  let sql = '-- Prime Packaging Boxes Database Dump\n\n';

  for (const t of tables) {
    const rows = await client.query(`SELECT * FROM "${t}"`);
    sql += `-- Table: ${t} (${rows.rows.length} rows)\n`;
    if (rows.rows.length > 0) {
      const cols = Object.keys(rows.rows[0]);
      for (const r of rows.rows) {
        const vals = cols.map(c => {
          const val = r[c];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'boolean' || typeof val === 'number') return val;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        sql += `INSERT INTO "${t}" ("${cols.join('", "')}") VALUES (${vals.join(', ')});\n`;
      }
    }
    sql += '\n';
  }

  fs.writeFileSync('primedb_dump.sql', sql, 'utf8');
  console.log(`Database dump complete! File primedb_dump.sql created with ${tables.length} tables and ${sql.length} bytes.`);
  await client.end();
}

dump().catch(console.error);
