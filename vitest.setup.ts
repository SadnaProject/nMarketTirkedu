import { dbGlobal } from "server/data/helpers/db";
import { beforeEach } from "vitest";
// import { exec } from "child_process";

// async function runCommand(command: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

export async function setup() {
  await dbGlobal.$executeRawUnsafe(
    "DO $$ DECLARE\
  r RECORD;\
BEGIN\
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP\
      EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';\
  END LOOP;\
END $$;"
  );
}

beforeEach(setup);
