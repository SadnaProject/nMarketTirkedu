import { beforeEach } from "vitest";
import { getDB } from "server/domain/_Transactional";
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
  while (true) {
    try {
      await getDB().$executeRawUnsafe(
        "DO $$ DECLARE\
          r RECORD;\
          BEGIN\
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP\
                EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';\
            END LOOP;\
          END $$;"
      );
      break;
    } catch (e) {
      console.log("DB not ready yet");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

beforeEach(setup);
