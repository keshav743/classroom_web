const router = require("express").Router();

const studentController = require("../controllers/student");
const isAuth = require("../middleware/is-auth");
const isStudent = require("../middleware/is-student");

router.get("/signup", studentController.getSignup);

router.get("/", studentController.getLogin);

router.get("/dashboard", isAuth, isStudent, studentController.getDashboard);

router.get("/rooms/:roomID", isAuth, isStudent, studentController.getRoomByID);

router.get(
  "/:roomID/:questionID/",
  isAuth,
  isStudent,
  studentController.getQuestionPaper
);

router.post(
  "/:roomID/:questionID/response",
  isAuth,
  isStudent,
  studentController.postResponseForQuestion
);

router.post("/signup", studentController.postSignup);

router.post("/", studentController.postLogin);

router.post("/joinClass", studentController.postJoinClass);

router.post("/logout", studentController.postLogout);

module.exports = router;
