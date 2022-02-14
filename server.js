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
    },
    abbrv: {
        type: Sequelize.STRING,
        UNIQUE: true,
        allowNull: true,
        validate: {
            notEmpty: false
        }
    }
});

// using express to create our app
const express = require('express');
const app = express();
// use urlencoded middleware to parse the posted form data to js object data, which is available as req.body
app.use(express.urlencoded({ extended: false }));
// require methodoverride to override form method Post to method Delete, because form only have two methods: Post and Get.
// in order to delete something with <form>, one has to override the keyword Post to Delete using middleware.
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.delete('/cities/:name', async(req, res, next) => {
    try {
        const cityName = req.params.name;
        //onsole.log(req.params.name);
        const city = await Cities.findOne({
            where: {name: cityName},
            include: [Countries]
        });
        console.log(city);
        await Cities.destroy({
            where: {name: cityName}
        });
        res.redirect(`/countries/${city.country.name}`)
    }
    catch (err) {
        next(err);
    }
});

app.post('/cities', async(req, res, next) => {
    try {
        let {name, countryName, countryAbbrv} = req.body;
        //console.log(req.body);
        //console.log(name, countryName, countryAbbrv)
        name = capitalize(name);
        countryName = capitalize(countryName);
        countryAbbrv = countryAbbrv.toUpperCase();

        let country = await Countries.findOne({ 
            where: {name: countryName} 
        });
        
        // if country added does not exist, create one
        if (!country) country = await Countries.create({ name: countryName, abbrv: countryAbbrv });

        await Cities.create({ name, countryId: country.id });
        //console.log(country);
        res.redirect(`/countries/${countryName}`);
    }
    catch (err) {
        next(err);
    }
});

app.get('/', (req, res) => res.redirect('/cities'));

app.get('/cities', async(req, res, next) => {
    try {
        const cities = await Cities.findAll({
            include: [ Countries ]
        });
        //console.log(cities);

        // we need table Countries here when using post method
        const countries = await Countries.findAll();

        const html = cities.map(city => `
            <div>
            ${city.name}
            <a href='/countries/${city.country.name}'>${city.country.name}</a>
            </div>`
        ).join('');

        res.send(`
        <html>
            <head>
                <title>Cities that Been Traveled</title>
            </head>
            <body>
                <h1>Cities that Been Traveled</h1>
                <form method='POST'>
                    <label for='name'>City:</label>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&nbsp;   
                    <label for='countryName'>Country:</label>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;
                    <label for='countryAbbrv'>Country Abbreviation:</label><br>
                    <input type='text' name='name'>
                    <input type='text' name='countryName'>
                    <input type='text' name='countryAbbrv'>
                    <button type='submit'>Create</button>
                </form>
                ${html}
            </body>
        </html>
        `);
    }
    catch (err) {
        next(err);
    }
});

app.get('/countries/:name', async(req, res, next) => {
    try {
        // const countryId = req.params.id;
        // const country = await Countries.findByPk(countryId, {
        //     include: [ Cities ]
        // });
        const countryName = req.params.name;
        const country = await Countries.findOne({
            where: {name: countryName},
            include: [ Cities ]
        });
        //console.log(country);
        const cities = country.cities;
        const html = cities.map(city => `
            <div>
            ${city.name}
            <form method='POST' action='/cities/${city.name}?_method=DELETE'>
                <button type='submit'>Delete</button>
            </form>
            </div>
        `).join('');

        res.send(`
        <html>
            <head>
                <title>Cities that Been Traveled</title>
            </head>
            <body>
                <h1><font size='-0.5'>Cities that Been Visited in</font> ${country.name} (${country.abbrv})</h1>
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

// function to capitalize the first letter of every word
const capitalize = str => {
    const wordArr = str.split(' ');
    return wordArr.map(word => {
        if (!(word === 'of' || word === 'Of')) return word[0].toUpperCase() + word.slice(1).toLowerCase();
        else return word.toLowerCase();
    }).join(' ');
};