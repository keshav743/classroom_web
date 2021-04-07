const router = require("express").Router();

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

router.get("/signup", adminController.getSignup);

router.get("/", adminController.getLogin);

router.get("/dashboard", isAuth, isAdmin, adminController.getDashboard);

router.get("/createRoom", isAuth, isAdmin, adminController.getCreateRoom);

router.get("/rooms/:roomId", isAuth, adminController.getRoomFromID);

router.get(
  "/:roomID/createNewAssignment",
  isAuth,
  isAdmin,
  adminController.getCreateNewAssignment
);

router.get(
  "/:roomID/:questionID",
  isAuth,
  isAdmin,
  adminController.getQuestionPaper
);

router.get(
  "/:roomID/:questionID/showResponses",
  isAuth,
  isAdmin,
  adminController.getResponsePage
);

router.get(
  "/:questionID/:responseID/response",
  isAuth,
  isAdmin,
  adminController.getAnswerResponse
);

router.post("/signup", adminController.postSignup);

router.post("/", adminController.postLogin);

router.post("/createRoom", isAuth, adminController.postCreateRoom);

router.post("/logout", adminController.postLogout);

router.post(
  "/:roomID/createNewAssignment",
  isAuth,
  adminController.postCreateNewAssignment
);

module.exports = router;
