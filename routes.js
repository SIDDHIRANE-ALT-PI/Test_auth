const router = require("express").Router();
// const { app} = require("express");
const { body } = require("express-validator");
const jwt = require('jsonwebtoken');

let user = {
    id: '101',
    email: 'sam@gmail.com',
    password: 'sam@123'
}

const JWT_SECRET = 'Some super Secrete..'

const {
    homePage,
    register,
    registerPage,
    login,
    loginPage,
    forgotPage,
} = require("./controllers/userController");

const ifNotLoggedin = (req, res, next) => {
    if (!req.session.userID) {
        return res.redirect('/login');
    }
    next();
}

const ifLoggedin = (req, res, next) => {
    if (req.session.userID) {
        return res.redirect('/');
    }
    next();
}

router.get('/', ifNotLoggedin, homePage)


router.get("/login", ifLoggedin, loginPage);
router.post("/login",
    ifLoggedin,
    [
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_password", "The Password must be of minimum 4 characters length")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    login
);

router.get("/signup", ifLoggedin, registerPage);
router.post(
    "/signup",
    ifLoggedin,
    [
        body("_name", "The name must be of minimum 3 characters length")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_password", "The Password must be of minimum 4 characters length")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    register
);

router.get("/forgotpassword", (req, res) => {
    res.render('forgotpassword');
})

router.post("/forgotpassword", (req, res) => {
    const { email } = req.body;
    // res.render('forgotpassword');

    if (email !== user.email) {
        res.send('user not registered');
        return;
    }
    // if user exist in db create one time link which is valid for 15 mins
    const secret = JWT_SECRET + user.password;
    const payload = {
        email: user.email,
        id: user.id
    };
    const token = jwt.sign(payload, secret, { expiresIn: '15m' })
    const link = `http://loaclhost:4000/resetpwd/${user.id}/${token}`;
    console.log(link);
    res.send('password link has been sent');
});

// router.get('/resetpwd',(req,res)=>{
//     res.render('resetpwd')
// })

router.get('/resetpwd/:id/:token', (req, res, next) => {
    const { id, token } = req.params;
    // OR console.log(req.params);
    res.send(req.params);

    //if id exist in db

    if (id !== user.id) {
        res.send('Invalid id..')
        return
    }
    //check id is valid and we have a valid user with this id
    const secret = JWT_SECRET + user.password
    try {
        const payload = jwt.verify(token, secret)
        res.render('resetpwd', { email: user.email })


    } catch (err) {
        console.log(err.message)
        res.send(err.message)
    }
    res.send(req.body);

});

router.post('/resetpwd/:id/:token', (req, res, next) => {
    const { id, token } = req.params;
    const { password, password2 } = req.body;
    //res.send(user);
    if (id !== user.id) {
        res.send('invalid id..')
        return;
    }
    const secret = JWT_SECRET + user.password
    try {
        const payload = jwt.verify(token, secret)
        // validate password and password2 should match
        user.password = password
        res.send(user, 'your password has been reset successfully!!!')
    }

    catch (err) {
        console.log(err.message);
        res.send(err.message)
    }
});


router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        next(err);
    });
    res.redirect('/login');
});

module.exports = router;