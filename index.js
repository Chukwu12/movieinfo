const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  passport = require("passport"),
  cors = require("cors"),
  validator = require("express-validator"),
  path = require('path');
require("./passport");




//Allows new users to register
app.post("/users", function (req, res) {
    req.checkBody("Username", "Username is required.").notEmpty();
    req.checkBody("Username", "Username contains non alphanumeric characters - not allowed.").isAlphanumeric();
    req.checkBody("Password", "Password is required").notEmpty();
    req.checkBody("Email", "Email is required.").notEmpty();
    req.checkBody("Email", "Email does not appear to be valid.").isEmail();
  
    // check the validation object for errors
    var errors = req.validationErrors();
  
    if (errors) {
      return res.status(422).json({
        errors: errors
      });
    }
  
    var hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({
        Username: req.body.Username
      })
      .then(function (user) {
        if (user) {
          return res.status(400).send("This username already exists.");
        } else {
          Users.create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then(function (user) {
              res.status(201).json(user);
            })
            .catch(function (error) {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  });
  
  app.get("/users/:Username",
    function (req, res) {
      Users.findOne({
          Username: req.params.Username
        })
        .then(function (user) {
          res.json(user);
        })
        .catch(function (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  );
  
  
  //Allows to update user info
  app.put("/users/:Username", passport.authenticate("jwt", {
      session: false
    }),
    function (req, res) {
      req.checkBody("Username", "Username is required.").notEmpty();
      req
        .checkBody(
          "Username",
          "Username contains non alphanumeric characters - not allowed."
        )
        .isAlphanumeric();
      req.checkBody("Password", "Password is required").notEmpty();
      req.checkBody("Email", "Email is required.").notEmpty();
      req.checkBody("Email", "Email does not appear to be valid.").isEmail();
  
      // check the validation object for errors
      var errors = req.validationErrors();
  
      if (errors) {
        return res.status(422).json({
          errors: errors
        });
      }
  
      var hashedPassword = Users.hashPassword(req.body.Password);
      Users.update({
          Username: req.params.Username
        }, {
          $set: {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          }
        }, {
          new: true
        }, // This line makes sure that the updated document is returned
        function (err, updatedUser) {
          if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
          } else {
            res.json(updatedUser);
          }
        }
      );
    }
  );
  
  //Allows users to add a movie to their list of favorites
  app.post(
    "/users/:Username/favorites/:MovieID",
    passport.authenticate("jwt", {
      session: false
    }),
    function (req, res) {
      Users.findOneAndUpdate({
          Username: req.params.Username
        }, {
          $push: {
            FavoriteMovies: req.params.MovieID
          }
        }, {
          new: true
        }, // This line makes sure that the updated document is returned
        function (err, updatedUser) {
          if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
          } else {
            res.json(updatedUser);
          }
        }
      );
    }
  );
  
  //Allows users to remove a movie from their list of favorites
  app.delete(
    "/users/:Username/favorites/:MovieID",
    passport.authenticate("jwt", {
      session: false
    }),
    function (req, res) {
      Users.findOneAndUpdate({
          Username: req.params.Username
        }, {
          $pull: {
            FavoriteMovies: req.params.MovieID
          }
        }, {
          new: true
        }, // This line makes sure that the updated document is returned
        function (err, updatedUser) {
          if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
          } else {
            res.json(updatedUser);
          }
        }
      );
    }
  );
  
  //Allows existing users to deregister by username
  app.delete(
    "/users/:Username",
    passport.authenticate("jwt", {
      session: false
    }),
    function (req, res) {
      Users.findOneAndRemove({
          Username: req.params.Username
        })
        .then(function (user) {
          if (!user) {
            res
              .status(400)
              .send(req.params.Username + "'s user profile was not found");
          } else {
            res
              .status(200)
              .send(
                req.params.Username +
                "'s user profile was successfully deleted from CineStock."
              );
          }
        })
        .catch(function (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  );
  
  // default response when request hits the root folder
  // app.get("/", function (req, res) {
  //   res.send("Welcome to the world of CineStock!");
  // });
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client-2/build', 'index.html'));
  });
  
  //access requested file from "public" folder
  app.use(express.static("public"));
  
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Oops! Something went wrong... please retry!");
  });
  
  var port = process.env.PORT || 3000;
  app.listen(port, "0.0.0.0", function () {
    console.log("Listening on Port 3000");
  });
  © 2020 GitHub, Inc.