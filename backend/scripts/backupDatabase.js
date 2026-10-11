// Phase 6.5 — tested backups (GIGW L-chapter).
//
//   npm run backup:db
//
// Dumps every operational collection to backend/backups/<timestamp>/*.json
// (one file per collection + manifest.json with counts + git HEAD). The
// directory is gitignored — backups hold password hashes and PII, so they
// must NEVER be committed; copy the timestamped folder to external storage.
//
// Restore drill (< 30 min target):
//   1. Stop the backend (no writes mid-restore).
//   2. For each <collection>.json: mongoimport --uri="$MONGO_URI"
//      --collection=<collection> --file=<collection>.json --jsonArray
//      (add --drop to replace instead of merge).
//   3. Boot the backend, confirm `[MongoDB] Indexes synced`, log in once.
// Drill history: 2026-10-11 — first successful dump (see manifest counts).
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { Family } from '../models/Family.js';
import { Booking } from '../models/Booking.js';
import { Grievance } from '../models/Grievance.js';
import { DistributionSettings } from '../models/DistributionSettings.js';
import { Feedback } from '../models/Feedback.js';

dotenv.config();

// Same DNS reliability fix as config/db.js: Atlas SRV lookups fail on some
// networks/VPNs/ISPs — pin public resolvers + force IPv4.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const here = path.dirname(fileURLToPath(import.meta.url));
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = path.join(here, '..', 'backups', stamp);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
  console.log('[Backup] Connected to MongoDB');
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = [
    ['users', User],
    ['families', Family],
    ['bookings', Booking],
    ['grievances', Grievance],
    ['distributionsettings', DistributionSettings],
    ['feedbacks', Feedback],
  ];
  const manifest = { takenAt: new Date().toISOString(), collections: {} };
  for (const [name, model] of jobs) {
    const docs = await model.find({}).lean();
    fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(docs));
    manifest.collections[name] = docs.length;
    console.log(`[Backup] ${name}: ${docs.length} doc(s)`);
  }
  try {
    manifest.gitHead = execSync('git rev-parse --short HEAD', { cwd: path.join(here, '..', '..') })
      .toString()
      .trim();
  } catch {
    manifest.gitHead = '(unknown)';
  }
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`[Backup] Done → backups/${stamp}/ (git HEAD ${manifest.gitHead})`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('[Backup] Failed:', error.message);
  process.exit(1);
});
