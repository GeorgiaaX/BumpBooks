//require modules
const path = require('path') 
const express = require('express')
const dotenv = require("dotenv")
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')
const flash = require('express-flash');


//load config
dotenv.config({ path: './config/config.env' })

//passport config
require('./config/passport-google')(passport)
require('./config/passport-local')(passport);


//connect to Database
connectDB()

const app = express()

//Body Parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//use method ovverride to override form methods
app.use(methodOverride (function (req, res) {
    if (req.body && typeof req.body === "object" && '_method' in req.body ) {
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

//Morgan Logging for dev mode only
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//Handlebards helpers
const { formatDate, truncate, stripTags, editIcon, select, addIndex} = require('./helpers/hbs')


//Handlebars templating engine
app.engine('.hbs', exphbs.engine({
    helpers: {
        formatDate,
        truncate,
        stripTags,
        editIcon,
        select,
        addIndex
    },
    defaultLayout: 'main',
    extname: '.hbs'
    })
)

//Set up view engine
app.set('view engine', '.hbs')


//Session middleware
app.use(session({
    secret: 'keybord cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}))


//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Set up flash
// app.use(flash());

//set global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})


//Static folder
app.use(express.static(path.join(__dirname, 'public' )))



//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


//set PORT
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on on PORT ${PORT}`);
    })
