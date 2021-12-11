const express = require('express')
const app = express()
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

const jwtKey = 'bilgeadam'
const jwtRefreshKey = "bilgeadam2"
const jwtExpirySeconds = 20
const jwtExpiryRefreshSeconds = 30


var refreshTokens = []

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

const port = process.env.PORT || 3000;
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept , Authorization"
    );
    next()
});


app.use(function (req, res, next) {

    if (req.originalUrl == '/token' || req.originalUrl == '/api/user/logincontrol' || req.originalUrl == '/api/user' || req.originalUrl == '/refreshToken') {
        next();
    }
    else {
        //token kontrolü yapacağız!
        var userToken = req.headers.authorization;

        try {
            jwt.verify(userToken, jwtKey);
            next()
        }
        catch {
            res.status(401).json({ "message": "Yetkisiz erişim" })
        }

    }


});

mongoose.connect('mongodb+srv://plant_user:GYrT3SbyGIFaP8tr@cluster0.9orl8.mongodb.net/houseplant-ecommerce-db');

const { Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    surname: String,
    address: String,
    email: String,
    phone: String,
    birthDate: Date,
    password: String,
    addDate: { type: Date, default: Date.now }
})

const productSchema = new Schema({
    name: String,
    description: String,
    images: [],
    price: Number,
    category: Object
})

const categorySchema = new Schema({
    name: String,
    description: String
})

const orderSchema = new Schema({
    email: String,
    userId: String,
    address: String,
    phone: String,
    addDate: { type: Date, default: Date.now },
    details: {}
})

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const Order = mongoose.model('Order', orderSchema)


app.post('/token', (req, res) => {

    var email = req.body.email;
    var password = req.body.password;

    User.findOne({ email: email, password: password }, (err, doc) => {


        if (doc != null) {
            //kullanıcı adı ve şifre doğruysa arkadaşa bir token üretiyorum

            const token = jwt.sign({ email }, jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            })

            res.status(200).json({ 'token': token });
        }
        else {

            res.status(404).json({ 'message': 'Kullanıcı adı veya şifre hatalı! Token alamazsınız!!' })
        }
    })

})

app.post('/refreshToken', (req, res) => {



    var refToken = req.body.refreshToken;
    var email = req.body.email

    try {
        jwt.verify(refToken, jwtRefreshKey);

        const accessToken = jwt.sign({ email }, jwtKey, {
            algorithm: 'HS256',
            expiresIn: jwtExpirySeconds
        })

        const refreshToken = jwt.sign({ email }, jwtRefreshKey, {
            algorithm: 'HS256',
            expiresIn: jwtExpiryRefreshSeconds
        })



        res.json({ "accessToken": accessToken, "refreshToken": refreshToken, "status": true });

    }
    catch {
        res.status(401).json({ "accessToken": "", "refreshToken": "", "status": false });
    }





})




//tüm kullanıcıları getirir
app.get('/api/user', (req, res) => {

    User.find({}, (err, docs) => {

        if (!err) {
            res.json(docs);
        }
        else {
            res.status(500).json(err);
        }

    })

})



//üye kayıt
app.post('/api/user', (req, res) => {

    User.findOne({ email: req.body.email }, (err, doc) => {



        if (doc !== undefined && doc !== null) {

            res.status(403).json({ "message": "Böyle bir kullanıcı mevcut" })

        }
        else {
            var user = new User({
                name: req.body.name,
                surname: req.body.surname,
                address: req.body.address,
                email: req.body.email,
                phone: req.body.phone,
                birthDate: req.body.birthDate,
                password: req.body.password
            })

            user.save();

            const token = jwt.sign({ email }, jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            })

            let responseData = {
                name: user.name,
                email: user.email,
                surname: user.surname,
                address: user.address,
                id: user._id,
                token: token
            }
            res.status(201).json(responseData);
        }

    })



})


//login control
app.post("/api/user/logincontrol", (req, res) => {


    let email = req.body.email
    let password = req.body.password


    User.findOne({ email: email, password: password }, (err, doc) => {
        if (doc != null) {


            const accessToken = jwt.sign({ email }, jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            })


            const refreshToken = jwt.sign({ email }, jwtRefreshKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpiryRefreshSeconds
            })


            refreshTokens.push(refreshToken);


            let responseData = {
                name: doc.name,
                email: doc.email,
                surname: doc.surname,
                address: doc.address == undefined ? "" : doc.address,
                id: doc._id,
                token: accessToken,
                refreshToken: refreshToken
            }


            res.status(200).json(responseData);
        }
        else {
            res.status(404).json({ 'message': 'User not found!' })
        }
    })

})


//get all products
app.get('/api/products', (req, res) => {

    console.log("Products...");
    Product.find({}, (err, doc) => {
        if (!err) {
            res.json(doc);
        }
        else {
            res.status(500).json(doc);
        }
    })

})


//get product by id
app.get('/api/products/:id', (req, res) => {

    let id = req.params.id;

    Product.findById(id, (err, doc) => {
        if (!err) {
            res.json(doc)
        }
        else {
            res.status(500).json(err)
        }
    })

})


// Getall ile tüm ürünleri döndürür (GET METODU)
// GetById ile dışarıdan aldığı ID ye göre ürünü verir

app.listen(port, () => {
    console.log("api çalışıyor...");
})



// API private (korunaklı) hale getirmek için token istiyorum. AccessToken benim için API doğrulamasında kullanılır. Access Token almak için kullanıcının login olması gerekli.


//Login olduktan sonra token ı yenileyebilmen için bir de refresh token veriyorum. Bu sayede token yenileme işleminde kullanıcı adı ve şifre göndermene gerek yok. Sadece refresh token ile yenileyebilirsin.

//Access Token => 5 dk ise Refresh Token => 7 dk olmak zorunda

//Bu kullanıcı 1 ay kullanmazsa dışarı atarım => ETicaret
//Bu kullanıcı 2 dk kullanmazsa dışarı atarım => Bankacılık


//Ön tarafta API ye istek atıldığında Token ( Access Token ) geçersiz ise refresh token isteği atılır



