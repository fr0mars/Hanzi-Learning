# Hanzi-Learning
learning app with memo cards to learn chinese characters from french

## How to use

first install all the necessary packages 
```
npm install
```
then run seed to setup the database (to remember your progress and store the characters)
```
npm run seed
```

you can then load the different hsk json data
```
node scripts/add_hsk.js data/hsk<x>_generated.json
```
*Note that in `data/` there is up to hsk3.*


and finally run it :
```
npm run dev
```

and to clean :
```
rm -rf node_modules
rm package-lock.json
```

to remove the db:
```
rm hanzi.db
```

## Disclaimer

- this is meant to be used in local, probably not secure lol
- this has been done in one afternoon so there might(are) be bugs


