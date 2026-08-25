import mongoose from 'mongoose';
import dns from 'dns';
import { User } from '../models/User.js';
import { Family } from '../models/Family.js';

// Atlas SRV lookups (_mongodb._tcp) fail on some networks, VPNs and ISP
// DNS resolvers. Pinning public resolvers + forcing IPv4 sockets makes the
// lookup reliable (this machine previously hit querySrv ECONNREFUSED).
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;
const SERVER_SELECTION_TIMEOUT_MS = 15000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectOnce = async () =>
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    family: 4, // force IPv4 sockets — avoids IPv6 black-holes on rural ISPs
  });

// Sync indexes once the first connection succeeds. Drops stale indexes left
// over from earlier schema versions and rebuilds them correctly.
const syncIndexes = async () => {
  await User.syncIndexes();
  await Family.syncIndexes();
  console.log('[MongoDB] Indexes synced with current schema.');
};

// Keeps the process alive through transient drops instead of crash-looping
// under nodemon; the driver auto-reconnects on its own.
const attachLifecycleHandlers = () => {
  mongoose.connection.on('error', (error) =>
    console.error(`[MongoDB Error] Runtime connection issue: ${error.message}`)
  );
  mongoose.connection.on('disconnected', () =>
    console.warn('[MongoDB] Connection lost — driver auto-reconnect engaged.')
  );
};

export const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const conn = await connectOnce();
      console.log(`[MongoDB] Connected safely to host: ${conn.connection.host}`);
      await syncIndexes();
      attachLifecycleHandlers();
      return;
    } catch (error) {
      console.error(`[MongoDB Error] Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}`);
      if (attempt < MAX_ATTEMPTS) {
        console.log(`[MongoDB] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await wait(RETRY_DELAY_MS);
      }
    }
  }

  console.error(
    '[MongoDB] All connection attempts failed.\n' +
      '  Checklist:\n' +
      '   1. Internet reachable / VPN not blocking UDP 53 (SRV DNS lookup)\n' +
      '   2. Atlas Network Access allows your current IP (or 0.0.0.0/0 for dev)\n' +
      '   3. Persistent DNS issues: replace the mongodb+srv:// URI in .env with\n' +
      "      the standard 'mongodb://' connection string from Atlas (no SRV lookup)"
  );
  process.exit(1);
};
