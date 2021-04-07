const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongodb").ObjectID;
const User = require("../models/user");
const Room = require("../models/room");
const Question = require("../models/question");
const Response = require("../models/response");

exports.getLogin = (req, res, next) => {
  res.render("student/login");
};

exports.getSignup = (req, res, next) => {
  res.render("student/signup");
};

exports.getDashboard = (req, res, next) => {
  Room.find({ participants: { $in: [req.user._id] } })
    .populate("createdBy")
    .populate("participants")
    .then((rooms) => {
      console.log(rooms);
      res.render("student/dashboard", { rooms: rooms });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getRoomByID = (req, res, next) => {
  let requestedRoom;
  Room.findById(mongoose.Types.ObjectId(req.params.roomID))
    .populate("createdBy")
    .populate("participants")
    .populate("questionPapers")
    .then((room) => {
      requestedRoom = room;
      console.log(room);
      return Response.find({
        submittedBy: req.user._id,
        belongsToRoom: room._id,
      });
    })
    .then((responses) => {
      console.log(responses);
      res.render("student/roomPage", { room: requestedRoom });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getQuestionPaper = (req, res, next) => {
  console.log(req.params.questionID);
  Question.findById(req.params.questionID)
    .then((question) => {
      if (!question) {
        console.log("No Question Paper Exists");
        return res.redirect("/student/dashboard/" + req.params.roomID);
      }
      console.log(path.join(__dirname, "../", question.path));
      fs.readFile(
        path.join(__dirname, "../", question.path),
        function (err, data) {
          if (err) {
            console.log(err);
          }
          res.contentType("application/pdf");
          res.send(data);
        }
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postSignup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 12)
    .then((hashedPassword) => {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
      });
      newUser
        .save()
        .then((result) => {
          console.log(result);
          res.redirect("/student/");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        console.log("Email not found.");
        return res.redirect("/student/");
      }
      if (user.role != "Student") {
        console.log("Not an Student Account.");
        return res.redirect("/student/");
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((result) => {
          if (result) {
            console.log("Correct Password");
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/student/dashboard");
            });
          } else {
            console.log("Wrong Password");
            res.redirect("/student/");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postJoinClass = (req, res, next) => {
  if (ObjectID.isValid(req.body.classId)) {
    console.log("Valid ObjectID");

    Room.findById(req.body.classId)
      .then((room) => {
        if (!room) {
          console.log("No Room exists.");
          return res.redirect("/student/dashboard");
        }
        room.participants.push(req.user._id);
        room
          .save()
          .then((result) => {
            console.log(result);
            res.redirect("/student/dashboard");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/student/dashboard");
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/student/");
  });
};

exports.postResponseForQuestion = (req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  const file = JSON.parse(JSON.stringify(req.files));
  console.log(obj);
  console.log(file);
  const newResponse = new Response({
    path: file.response[0].path,
    submittedBy: req.user._id,
    questionPaperID: obj.questionID,
    belongsToRoom: obj.roomID,
  });
  newResponse
    .save()
    .then((result) => {
      console.log("result");
      res.redirect("/student/rooms/" + obj.roomID);
    })
    .catch((err) => {
      console.log(err);
    });
};
