var express = require("express");
var logger = require("morgan");

var mongoose = require("mongoose");

//scraping tools

var axios = require("axios");
var cheerio = require("cheerio");

//Requiring all models

var db = require("./models");

var Port = 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//make a "public" a static folder

//this is also the HTML route for the file index.html
app.use(express.static("public"));


mongoose.connect("mongodb://localhost/mongoscraperproject", { useUnifiedTopology: true, useNewUrlParser: true });

var url = "mongodb://localhost/mongoscraperproject";

app.get("/scrape", function (req, res) {

    mongoose.connect(url, function (err, db) {
        if (err) throw err;

        db.collection("odds").remove(function (err, obj) {
            if (err) throw err;
            console.log(obj.result.n + " document(s) deleted");
        });
    })
    axios.get("https://www.vegasinsider.com/nfl/odds/futures/").then(function
        (response) {
        var $ = cheerio.load(response.data);
        var teamResults = [];
        var oddsResults = [];
        var teamandodds = [];

        $("td.font-bold").each(function (j, element) {

            var team = $(element).text();
            teamResults.push({
                team: team
            });

        });

        $("td.last").each(function (i, elements) {
            var odds = $(elements).text();
            oddsResults.push({
                odds: odds
            });

            // db.odds.create(oddsResults[i])
            //     .then(function (dbodds) {
            //         console.log(dbodds);
            //     })
            //     .catch(function (err) {
            //         console.log(err);
            //     });

        });

        var result = {};
        for (k = 0; k < 32; k++) {

            teamandodds.push(teamResults[k].team +
                ": " + oddsResults[k].odds)

            //    console.log(teamandodds);

            result.team = teamResults[k].team;
            result.odds = oddsResults[k].odds;

            db.odds.create(result)
                .then(function (dbodds) {
                    console.log(dbodds);
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
    });
   

// $.getJSON("/odds", function(data) {
//  for (var i = 0; i< data.length; i ++) {
//      $(".alert").append("<p data-id='"+ data[i]._id + "'>" +data[i].team + "<br />" + data[i].odds + "</p>"); 

//  }
// });

    //shouldnt it say this in the address bar?

    res.send("completed");
    
   

});

app.get("/odds", function (req, res) {
console.log("itis");

    db.odds.find({})
        .then(function (dbodds) {
            res.json(dbodds);

        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/odds/:id", function (req, res) {
    db.odds.findOne({ _id: req.params.id })

        .populate("note")
        .then(function (dbodds) {

            res.json(dbodds);
        })
        .catch(function (err) {

            res.json(err);
        })
});

app.post("/odds/:id", function (req, res) {

    db.note.create(req.body)
        .then(function (dbnote) {

            return db.odds.findOneAndUpdate({ _id: req.params.id }, { note: dbodds._id }, { new: true });
        })
        .then(function (dbodds) {
            res.json(dbodds);
        })
        .catch(function (err) {
            res.json(err);
        });
});



app.listen(Port, function () {
    console.log("App running on port " + Port);
})