// const express = require("express");
// const path = require("path");

// const routes = require("./routes/route");

// const session = require("express-session");
// const pool = require("./config/database");

// require("dotenv").config();


// const app = express();



// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//   res.render("login");
// });

// app.get("/login", (req, res) => {
//   res.render("login");
// });

// app.get("/dashboard", (req, res) => {
//   res.render("workspace");
// });

// app.use("/api", routes);

// app.set("view engine", "ejs");

// app.set(
//     "views",
//     path.join(__dirname, "../views")
// );



// app.use(express.urlencoded({
//     extended: true
// }));

// app.use(express.json());

// app.use(
//     express.static(
//         path.join(__dirname, "../public")
//     )
// );



// app.use(
//     session({
//         secret: process.env.SESSION_SECRET || "hosbank_secret",
//         resave: false,
//         saveUninitialized: false
//     })
// );


// const authRoutes = require("./routes/route");

// app.use("/", authRoutes);


// app.get("/", (req, res) => {
//     res.send("Banking app fonctionne");
// });


// async function testDatabase() {

//     try {

//         const connection = await pool.getConnection();

//         console.log("mysql fonctionne");

//         connection.release();

//     } catch (error) {

//         console.error(
//             "error mysql",
//             error.message
//         );

//     }
// }

// testDatabase();



// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Serveur sur http://localhost:${PORT}`);
// });


//     console.log(
//         `Server running on http://localhost:${PORT}`
//     );

const express = require('express');
const path = require('path');
const session = require('express-session');
const routes = require('./routes/route');

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', [
	path.join(__dirname, '../views'),
	path.join(__dirname, 'views')
]);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: process.env.SESSION_SECRET || 'hosbank-development-secret',
	resave: false,
	saveUninitialized: false
}));

app.get('/staff/login', (req, res) => res.render('login'));
app.get('/staff/dashboard', (req, res) => res.render('workspace'));

app.use('/api', routes.api);
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HosBank server running at http://localhost:${PORT}`));


