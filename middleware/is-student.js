module.exports = (req, res, next) => {
  console.log(req.session.user.role);
  if (req.session.user.role === "Student") {
    return next();
  }
  return res.redirect("/admin/dashboard");
};
