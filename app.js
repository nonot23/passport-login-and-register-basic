const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session')
const flash = require('express-flash');
const passport = require('passport')
const { User } = require('./models/database');
const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy; //ตรวจสอบตัวตน
const jwt = require('jsonwebtoken');
const methodOverride = require('method-override');

const secret = 'secret';
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}))

app.use(methodOverride('_method'));
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views')) /* path.join หา โฟรเดอร์ views*/
app.set('view engine', 'ejs') /* set ejs */

app.get('/register', (req, res) => {
    res.render('register');
});

//register
app.post('/register', async (req, res) => {
        try {
            const { firstname, lastname, email, password } = req.body;

            const existingUser = await User.findOne({ where: { email } });

            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists.' });
            }

            const newUser = await User.create({ firstname, lastname, email, password });

            res.status(201).json({ message: 'User registered successfully', user: newUser });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });



    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            let user = await User.findOne({ where: { email } });

            if (!user) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (isPasswordMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        } catch (error) {
            return done(error);
        }
    })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });


    //login 

    app.get('/login', (req, res) => {
        res.render('login', { messages: req.flash('error') });
    })


    app.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/login');
            }
    
            // ใช้คีย์ลับสำหรับการเซ็น JWT
            const token = jwt.sign({ user: user.id }, secret, { expiresIn: '30m' }); // ปรับเวลาหมดอายุตามที่ต้องการ
            res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ', token });
        })(req, res, next);

    })





    app.listen(3000, () => {
        console.log('Server is running');
    })