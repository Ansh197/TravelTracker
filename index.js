import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "Ansh123@",
  database: "world",
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function findCountries()
{
  var country_codes=[];
  var result = await db.query("select country_code from visited_countries");
        result.rows.forEach((code) => {
          country_codes.push(code.country_code);
        });
  return country_codes;
}

app.post('/add',async (req,res)=>{
  var curCountry =  req.body.country;
  curCountry = curCountry.toLowerCase();
    const result = await db.query("select country_code from countries where lower(country_name) = $1 ",[curCountry]);
    if(result.rows.length !== 0){
      var curCode = result.rows[0].country_code; 
      try{
        await db.query('insert into visited_countries (country_code) values ($1)',[curCode]);
        res.redirect('/');
      }
      catch(err)
      {
        console.log(err);
        var countries = await findCountries();
        res.render("index.ejs", {
          countries: countries,
          total: countries.length,
          error: "Country alerady added"
        });
      }
      }
      else
      {
        var countries = await findCountries();
        res.render("index.ejs", {
          countries: countries,
          total: countries.length,
          error: "Wrong country name"
        });
      }
  }
  
)

app.get("/", async (req, res) => {

  var country_codes = await findCountries(); 
  res.render("index.ejs", {
    countries: country_codes,
    total: country_codes.length,
  });

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
