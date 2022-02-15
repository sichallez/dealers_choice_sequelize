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

module.exports = { Cities, Countries, db };