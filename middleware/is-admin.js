module.exports = (req, res, next) => {
  console.log(req.session.user.role);
  if (req.session.user.role === "Admin") {
    return next();
  }
  return res.redirect("/student/dashboard");
};
