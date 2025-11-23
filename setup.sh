#!/bin/sh


npm install
npm run seed
node scripts/add_hsk.js data/hsk1_generated.json
node scripts/add_hsk.js data/hsk2_generated.json
node scripts/add_hsk.js data/hsk3_generated.json
npm run dev
