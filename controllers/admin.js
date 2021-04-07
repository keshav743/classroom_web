const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Room = require("../models/room");
const Question = require("../models/question");
const Response = require("../models/response");

exports.getLogin = (req, res, next) => {
  res.render("admin/login");
};

exports.getSignup = (req, res, next) => {
  res.render("admin/signup");
};

exports.getDashboard = (req, res, next) => {
  Room.find({ createdBy: req.user._id })
    .then((rooms) => {
      res.render("admin/dashboard", { rooms: rooms });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCreateRoom = (req, res, next) => {
  res.render("admin/createRoom");
};

exports.getRoomFromID = (req, res, next) => {
  Room.findOne({ _id: req.params.roomId })
    .populate("participants")
    .populate("createdBy")
    .populate("questionPapers")
    .then((room) => {
      console.log(room);
      if (room.createdBy._id.toString() !== req.user._id.toString()) {
        console.log("Room doesn't belong to the user");
        return res.redirect("/admin/dashboard");
      }
      res.render("admin/roomPage", {
        room: room,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCreateNewAssignment = (req, res, next) => {
  const roomId = req.params.roomID;
  res.render("admin/newAssignment", { roomID: roomId });
};

exports.getResponsePage = (req, res, next) => {
  console.log(req.params);
  Response.find({
    belongsToRoom: req.params.roomID,
    questionPaperID: req.params.questionID,
  })
    .populate("submittedBy", "name")
    .populate()
    .then((responses) => {
      res.render("admin/responsePage", { responses: responses });
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
        return res.redirect("/admin/dashboard/" + req.params.roomID);
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

exports.getAnswerResponse = (req, res, next) => {
  console.log(req.params.questionID);
  Response.findById(req.params.responseID)
    .then((response) => {
      if (!response) {
        console.log("No Question Paper Exists");
        return res.redirect("/admin/dashboard/" + req.params.roomID);
      }
      console.log(path.join(__dirname, "../", response.path));
      fs.readFile(
        path.join(__dirname, "../", response.path),
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
          res.redirect("/admin/");
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
        return res.redirect("/admin/");
      }
      if (user.role != "Admin") {
        console.log("Not an Admin Account.");
        return res.redirect("/admin/");
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
              res.redirect("/admin/dashboard");
            });
          } else {
            console.log("Wrong Password");
            res.redirect("/admin/");
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

exports.postCreateRoom = (req, res, next) => {
  const newRoom = new Room({
    roomName: req.body.roomName,
    createdBy: req.user._id,
  });
  newRoom
    .save()
    .then((result) => {
      console.log(result);
      res.redirect("/admin/dashboard");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/admin/");
  });
};

exports.postCreateNewAssignment = (req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body)); // req.body = [Object: null prototype] { title: 'product' }
  const file = JSON.parse(JSON.stringify(req.files));
  console.log(obj);
  console.log(file);
  let quesID;
  const newQuestion = new Question({
    path: file.question[0].path,
    description: obj.description,
    belongsToRoom: obj.roomID,
    createdBy: req.user._id,
  });
  newQuestion
    .save()
    .then((result) => {
      console.log(result);
      quesID = result._id;
      return Room.findOne({ _id: obj.roomID });
    })
    .then((room) => {
      if (!room) {
        console.log("No Room");
        return res.redirect("/admin/room/" + obj.roomID);
      }
      console.log(room);
      room.questionPapers.push(quesID);
      return room.save();
    })
    .then((roomResult) => {
      console.log(roomResult);
      res.redirect("/admin/rooms/" + obj.roomID);
    })
    .catch((err) => {
      console.log(err);
    });
};
