var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

router.get('/admin', function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          if(user.Admin){
            models.users.findAll({
              where: { Deleted: false },
            }).then(users => {
              console.log(users);
              res.render('adminPage', {users: users})
            })
          } else {
            res.send("You must be an Admin user to view this page.");
          }
        } else {
          res.status(401);
          res.send('Must be logged in as an Admin user.');
        }
      })
  } else {
    res.send('Must be logged in as an Admin user.');
  }
});

router.get('/admin/editUser/:id', function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          if(user.Admin){
            models.users.findOne({
              required: false,
              where: { Deleted: false,  UserId: req.params.id },
              include: [{ model: models.posts, required: false, where: { Deleted: false } }]
            }).then(user => {
              console.log(user);
              res.render('adminSingleUserPage', {
                UserId: user.UserId,
                FirstName: user.FirstName,
                LastName: user.LastName,
                Username: user.Username,
                Email: user.Email,
                posts: user.posts
              })
            })
          } else {
            res.redirect("/")
          }
        } else {
          res.status(401);
          res.send('Must be logged in.');
        }
      })
  } else {
    res.send('Must be logged in.');
  }
});


router.get('/admin/editUser/:userId/delete/:id', function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          if(user.Admin){
            models.posts.update(
              {
                Deleted: true
              },
              {
                where: {PostId: req.params.id}
              }
            ).then(() => res.redirect('/users/admin/editUser/' + req.params.userId))
            .catch(err => console.log(err));
          } else {
            res.send('You must be an Admin user.');
          }
        } else {
          res.status(401);
          res.send('Must be logged in.');
        }
      })
  } else {
    res.send('Must be logged in.');
  }
});

router.get('/admin/editUser/:userId/deleteUser/:id', function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          if(user.Admin){
            models.users.update(
              {
                Deleted: true
              },
              {
                where: {UserId: req.params.id}
              }
            ).then(() => res.redirect('/users/admin'))
            .catch(err => console.log(err));
          } else {
            res.redirect("/")
          }
        } else {
          res.status(401);
          res.send('Must be logged in.');
        }
      })
  } else {
    res.send('Must be logged in.');
  }
});

//ADMIN ROUTES ABOVE^



//USER ROUTES BELOW

router.post('/signup', function (req, res, next) {
  models.users.findOrCreate({
    where: { Username: req.body.username },
    defaults: {
      FirstName: req.body.firstName,
      LastName: req.body.lastName,
      Email: req.body.email,
      Password: authService.hashPassword(req.body.password)
    }
  }).spread(function (result, created) {
    if (created) {
      res.redirect('/users/login');
    } else {
      res.send("This user already exists.");
    }
  });
});

router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.post('/login', function (req, res, next) {
  models.users.findOne({
    where: { Username: req.body.username }
  })
    .then(user => {
      if (!user) {
        console.log("User not found.");
        res.status(401).json({ message: "Login failed." });
        return res.redirect('/users/login');
      } else {
        if (user.Deleted) {
          res.send("Your account has been deleted. Please contact customer service. Have a nice day.");
        } else {
        let passwordMatch = authService.comparePasswords(req.body.password, user.Password);
        if (passwordMatch) {
          let token = authService.signUser(user);
          res.cookie('jwt', token);
          res.redirect("/users/profile");
        } else {
          console.log("Wrong password.");
          res.send("Wrong password.");
        }}
      }
    });
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/profile', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          models.users.findOne({
            where: { UserId: user.UserId },
            include: [{ model: models.posts, required: false, where: { Deleted: false } }]
          }).then(user => {
            console.log(user);
            res.render('profile', {
              FirstName: user.FirstName,
              LastName: user.LastName,
              Username: user.Username,
              posts: user.posts
            });
          }
          )
        } else {
          res.status(401);
          res.send('Must be logged in.');
        }
      })
  } else {
    res.send('Must be logged in.');
  }
});

router.get('/logout', function (req, res, send) {
  res.cookie('jwt', "", { expires: new Date(0) });
  res.redirect('/users/login');
});

router.post('/createPost', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          models.posts.findOrCreate({
            where: {
              PostTitle: req.body.PostTitle
            },
            defaults: {
              UserId: user.UserId,
              PostTitle: req.body.postTitle,
              PostBody: req.body.postBody
            }
          }).spread(function (result, created) {
            if (created) {
              res.redirect('/users/profile')
            }
          }).catch((err) => console.log(err));
        }
      });
  }
});

router.get('/createPost', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(function () {
        res.render('createPost');
      });
  } else {
    res.send('Must be logged in.');
  }
});

router.post('/updatePost/:id', function(req, res, next) {
  let postId = parseInt(req.params.id);
  models.posts.update(
    {
      PostTitle: req.body.postTitle,
      PostBody: req.body.postBody
    },
    {
      where: {PostId: postId}
    }
  ).then(result => res.redirect('/users/profile'))
  .catch(err => console.log(err));
});

router.get('/updatePost/:id', function(req, res, next) {
  res.render('updatePost');
});

router.get('/deletePost/:id', function(req, res, next) {
  let postId = parseInt(req.params.id);
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          models.posts.update(
            {
              Deleted: true
            },
            { where: { PostId: postId}}
          ).then(() => {
            res.redirect('/users/profile').catch(err => console.log(err));
          })
        }
      })
  } else {
    res.send('Must be logged in.');
  }
});



module.exports = router;
