// require database js to import two table models
const { Cities, Countries, db } = require('./db.js');

// using express to create our app
const express = require('express');
const app = express();
// use urlencoded middleware to parse the posted form data to js object data, which is available as req.body
app.use(express.urlencoded({ extended: false }));
// require methodoverride to override form method Post to method Delete, because form only have two methods: Post and Get.
// in order to delete something with <form>, one has to override the keyword Post to Delete using middleware.
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// require middleware handler for all routes and subroutes
app.use('/cities', require('./routes/cities'));
app.use('/countries', require('./routes/countries'));

app.get('/', (req, res) => res.redirect('/cities'));

// make Cities has a relation to Countries, or say making table countries be associated to table cities
Cities.belongsTo(Countries);
// make Countries has a relation to Cities, or say making table cities be associated to table countries
Countries.hasMany(Cities);

const init = async() => {
    try {
        // to sync the database and DROP TABLES * IF EXISTS
        await db.sync({ force: true });

        // create table elements into tables
        const france = await Countries.create({ name: 'France', abbrv: 'FRA' });
        const germany = await Countries.create({ name: 'Germany', abbrv: 'DEU' });
        const spain = await Countries.create({ name: 'Spain', abbrv: 'ESP' });
        const italy = await Countries.create({ name: 'Italy', abbrv: 'ITA' });
        const usa = await Countries.create({ name: 'United States of America', abbrv: 'USA' });
        const portugal = await Countries.create({ name: 'Portugal', abbrv: 'PRT' });
        await Cities.create({ name: 'Paris', countryId: france.id });
        await Cities.create({ name: 'Bordeaux', countryId: france.id });
        await Cities.create({ name: 'Lyon', countryId: france.id });
        await Cities.create({ name: 'Strasbourg', countryId: france.id });
        await Cities.create({ name: 'Caen', countryId: france.id });
        await Cities.create({ name: 'Grenoble', countryId: france.id });
        await Cities.create({ name: 'Cabourg', countryId: france.id });
        await Cities.create({ name: 'Chamonix', countryId: france.id });
        await Cities.create({ name: 'Karlsruhe', countryId: germany.id });
        await Cities.create({ name: 'Heidelberg', countryId: germany.id });
        await Cities.create({ name: 'Frankfurt', countryId: germany.id });
        await Cities.create({ name: 'Hamburg', countryId: germany.id });
        await Cities.create({ name: 'Berlin', countryId: germany.id });
        await Cities.create({ name: 'Cologne', countryId: germany.id });
        await Cities.create({ name: 'Dusseldorf', countryId: germany.id });
        await Cities.create({ name: 'Stuttgart', countryId: germany.id });
        await Cities.create({ name: 'Freiburg', countryId: germany.id });
        await Cities.create({ name: 'Genoa', countryId: italy.id });
        // await Cities.create({ name: 'Genoa', countryId: italy.id });
        await Cities.create({ name: 'Palermo', countryId: italy.id });
        await Cities.create({ name: 'Milan', countryId: italy.id });
        await Cities.create({ name: 'Barcelona', countryId: spain.id });
        await Cities.create({ name: 'Porto', countryId: portugal.id });
        await Cities.create({ name: 'New York City', countryId: usa.id });
        await Cities.create({ name: 'Stroudsburg', countryId: usa.id });
        await Cities.create({ name: 'Stony Brook', countryId: usa.id });
        await Cities.create({ name: 'Staatsburg', countryId: usa.id });
        await Cities.create({ name: 'Cobleskill', countryId: usa.id });

        // create a port for the app
        const port = process.env.PORT || 1330;
        app.listen(port, () => `listening to port ${port} ...`);
    }
    catch (err) {
        console.log(err);
    }
};

init();