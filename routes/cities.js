// require database js to import two table models
const { Cities, Countries } = require('../db.js');

// using express to create our app
const express = require('express');
const router = express.Router();
// use urlencoded middleware to parse the posted form data to js object data, which is available as req.body
//app.use(express.urlencoded({ extended: false }));
// require methodoverride to override form method Post to method Delete, because form only have two methods: Post and Get.
// in order to delete something with <form>, one has to override the keyword Post to Delete using middleware.
// const methodOverride = require('method-override');
// app.use(methodOverride('_method'));

router.delete('/:name', async(req, res, next) => {
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

router.post('/', async(req, res, next) => {
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

router.get('/', async(req, res, next) => {
    try {
        const cities = await Cities.findAll({
            include: [ Countries ]
        });
        //console.log(cities);

        // we need table Countries here when using post method
        const countries = await Countries.findAll();

        const html = cities.map(city => `
            <tr>
                <td>${city.name}</td>
                <td><a href='/countries/${city.country.name}'>${city.country.name}</a></td>
            </tr>`
        ).join('');

        res.send(`
        <html>
            <head>
                <title>Cities that Been Traveled</title>
                <style>
                    table, td, th {
                        border: 1px solid black;
                        width: 300px;
                    }
                    td {
                        text-align: center
                    }
                </style>
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
                <table style='width:40%'>
                    <tr>
                        <th>City</th>
                        <th>Country</th>
                    </tr>
                    ${html}
                </table>
            </body>
        </html>
        `);
    }
    catch (err) {
        next(err);
    }
});

// function to capitalize the first letter of every word
const capitalize = str => {
    const wordArr = str.split(' ');
    return wordArr.map(word => {
        if (!(word === 'of' || word === 'Of')) return word[0].toUpperCase() + word.slice(1).toLowerCase();
        else return word.toLowerCase();
    }).join(' ');
};

module.exports = router;