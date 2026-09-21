const  express = require("express");
const path = require("path");
const pool = require("./config/database");
const { log } = require("console");

require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) =>{
    res.send("Banking app fonctionne");
});

async function testDatabase(){
    try{
        const connection = await pool.getConnection();

        console.log("mysql fonnctionne ");

        connection.release();
    } catch (error) {
        console.error("error mysql", error.message);
        
    }
}

testDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` serveur sur http://localhost:${PORT}`);
    
});