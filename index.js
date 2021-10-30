const express = require('express')
const app = express()
const mongoose = require('mongoose');

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));


mongoose.connect('mongodb+srv://plant_user:GYrT3SbyGIFaP8tr@cluster0.9orl8.mongodb.net/houseplant-ecommerce-db');

const { Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    surname: String,
    email: String,
    phone: String,
    birthDate: Date,
    password: String,
})

const User = mongoose.model('User', userSchema);

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


    var user = new User({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        phone: req.body.phone,
        birthDate: req.body.birthDate,
        password: req.body.password
    })

    user.save()

    res.json(user);

})


//login control
app.post("/api/user/logincontrol",(req,res)=>{

    let email = req.body.email
    let passowrd = req.body.password

    User.findOne({email:email,password:passowrd},(err,doc)=>{
        if(doc != null){
            res.status(200).json(doc);
        }
        else{
            res.status(404).json({'msg':'User not found!'})
        }
    })

})




app.listen(3000, () => {
    console.log("api çalışıyor...");
})

