const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/travel_cities_db');

// define two tables in the database
const Cities = db.define('city', {
    name: {
        type: Sequelize.DataTypes.STRING,
        UNIQUE: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
});

const Countries = db.define('country', {
    name: {
        type: Sequelize.STRING,
        UNIQUE: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
});

// using express to create our app
const express = require('express');
const app = express();

app.get('/', (req, res) => res.redirect('/cities'));

app.get('/cities', async(req, res, next) => {
    try {
        const cities = await Cities.findAll({
            include: [ Countries ]
        });
        //console.log(cities);
        const html = cities.map(city => `
            <div>
            ${city.name}
            <a href='/countries/${city.country.id}'>${city.country.name}</a>
            </div>`
        ).join('');

        res.send(`
        <html>
            <head>
                <title>Cities that Been Traveled</title>
            </head>
            <body>
                <h1>Cities that Been Traveled</h1>
                ${html}
            </body>
        </html>
        `);
    }
    catch (err) {
        next(err);
    }
});

app.get('/countries/:id', async(req, res, next) => {
    try {
        const countryId = req.params.id;
        const country = await Countries.findByPk(countryId, {
            include: [ Cities ]
        });
        //console.log(countries);
        const cities = country.cities;
        const html = cities.map(city => `
            <div>
            ${city.name}
            </div>
        `).join('');

        res.send(`
        <html>
            <head>
                <title>Cities that Been Traveled</title>
            </head>
            <body>
                <h1><font size='-0.5'>Cities that Been Visited in</font> ${country.name}</h1>
                <a href='/cities'>Go back</a>
                ${html}
            </body>
        </html>
        `);
    }
    catch (err) {
        next(err);
    }

});

// make Cities has a relation to Countries, or say making table countries be associated to table cities
Cities.belongsTo(Countries);
// make Countries has a relation to Cities, or say making table cities be associated to table countries
Countries.hasMany(Cities);

const init = async() => {
    try {
        // to sync the database and DROP TABLES * IF EXISTS
        await db.sync({ force: true });

        // create table elements into tables
        const france = await Countries.create({ name: 'France (FRA)' });
        const germany = await Countries.create({ name: 'Germany (DEU)' });
        const spain = await Countries.create({ name: 'Spain (ESP)' });
        const italy = await Countries.create({ name: 'Italy (ITA)' });
        const usa = await Countries.create({ name: 'United States of America (USA)' });
        const portugal = await Countries.create({ name: 'Portugal (PRT)' });
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
        await Cities.create({ name: 'Genoa', countryId: italy.id });
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