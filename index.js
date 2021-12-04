const express = require('express')
const app = express()
const mongoose = require('mongoose');

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
    userId : String,
    address: String,
    phone: String,
    addDate: { type: Date, default: Date.now },
    details: {}
})

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const Order = mongoose.model('Order', orderSchema)

// var product = new Product({
//     name:'Dağ Palmiyesi',
//     description:'Beyaz Garden Saksı Latince Adı: Chamaedorea Elegans Doğrudan güneş ihtiyacı yoktur. Aydınlık veya yarı gölge bir yer gelişimi için yeterlidir. Yavaş büyüme gösterir. ',
//     images:['https://cdn03.ciceksepeti.com/cicek/kc5990855-1/L/dag-palmiyesi-beyaz-saksili-kc5990855-1-4435d308aa874936848d49de8a9ca781.jpg'],
//     price:80
// })


// product.save()

// var user = new User({
//     name:'Zeynep',
//     surname:'Sevde',
//     email:'zeynep@hotmail.com',
//     phone:'5554443333',
//     birthDate:Date.now(),
//     password:'321'
// })


// user.save()


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

            user.save()

            let responseData = {
                name: user.name,
                email: user.email,
                surname : user.surname,
                address: user.address,
                id: user._id
            }

            console.log(responseData)
            res.status(201).json(responseData);
        }

    })



})


//login control
app.post("/api/user/logincontrol", (req, res) => {


    let email = req.body.email
    let password = req.body.password

    console.log(req.body);

    User.findOne({ email: email, password: password }, (err, doc) => {
        if (doc != null) {


            let responseData = {
                name: doc.name,
                email: doc.email,
                surname : doc.surname,
                address: doc.address,
                id: doc._id
            }


            res.status(200).json(responseData);
        }
        else {
            console.log("Kullanıcı adı veya şifer yanlış");
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




