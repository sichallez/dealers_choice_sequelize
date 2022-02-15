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

router.get('/:name', async(req, res, next) => {
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

// function to capitalize the first letter of every word
const capitalize = str => {
    const wordArr = str.split(' ');
    return wordArr.map(word => {
        if (!(word === 'of' || word === 'Of')) return word[0].toUpperCase() + word.slice(1).toLowerCase();
        else return word.toLowerCase();
    }).join(' ');
};

module.exports = router;