# Hanzi-Learning
learning web app with memo cards to learn hanzi 


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
