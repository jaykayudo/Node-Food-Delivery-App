
const express = require("express")
const app = express()
const upload = require("express-fileupload")
const route = require('./admin')
const session = require("express-session")
const mongoose = require("mongoose")
const cookies = require("cookie-parser")
const Models = require("./models")
const Food = Models.Food
const Order = Models.Order
const FoodImages = Models.FoodImages
const Cart = Models.Cart
const User = Models.User

mongoose.connect("mongodb://127.0.0.1:27017/food-delivery").then(result=>{
    app.listen(3000)
})

app.set("view engine","ejs")
app.use(session({
    secret: "Joshkay",
    saveUninitialized: true,
    resave: true,
    cookie:{maxAge: 24*60*60*1000}
}))

app.use(cookies())
app.use(express.static("static"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(upload())
app.use("/uploads",express.static("uploads"))

async function request(req,res,next){
    req.user = null
    stuff = null
    if(req.cookies.userid){
        await User.findOne({_id:req.cookies.userid}).then(result=>{
            stuff = result
            
        })
        req.user = stuff
    }
    else{
        if(req.session.userid){
        await User.findOne({_id:req.session.userid}).then(result=>{
            stuff = result
            
        })
        req.user = stuff
    }
    }
    
    next() 
}
async function cart(req,res,next){
    req.cart = null
    app.locals.request = req
    
    if(req.cookies.cartid){
        await Cart.findOne({_id:req.cookies.cartid}).then(result=>{
            req.cart = result
            
        })
       
    }
    
    
    
    next() 
}


// in order to difine middleware functions we do
app.use(request)
app.use(cart)

app.use("/admin",route)
app.get("/",function(req,res){
    res.render("index",{user:req.user})
})
app.route("/login").get(function(req,res){
    if(req.user){
        res.redirect("/")
    }
    else{
    res.render("login",{title:"Mama Put: Customer Login",error:null,user:req.user})}
}).post(function(req,res){
    User.findOne({username:req.body.username,password:req.body.password}).then(result=>{
        if(!result){
            res.render("login",{title:"Mama Put: Customer Login",error:"Invalid Credentials",user:req.user})
        }
        else{
            req.session.userid = result._id
            if(req.body.remember){
                res.cookie("userid",result._id,{expires:new Date(Date.now()+864000000),httpOnly:true})
            }
            res.redirect('/')
        }
    }).catch(err=>{
        console.log(err)
    })

})
app.get("/signup",function(req,res){
        if(req.user){
            res.redirect("/")
        }
        else{
        res.render("signup",{user:req.user})
    }
    })
app.post("/signup",async function(req,res){
        var user = new User()
        var info = null
        User.find({username:req.body.username}).then(result=>{
            info = JSON.stringify(result)
            if(info != "[]" ){
                res.render("signup",{"error":"Username Already Exists",user:req.user})
                return
            }
            else{
                if(req.body.firstname){
                    user.firstname = req.body.firstname;
                }
                if(req.body.lastname){
                    user.lastname = req.body.lastname;
                }
                user.username = req.body.username;
                user.password = req.body.password;
                user.save().then(async (result)=>{
                    if(req.cart){
                        await Cart.findById(req.cart.id).then(data=>{
                            data.user = result.username
                            data.save()
                        })
                    }
                    req.session.userid = result._id
                    res.redirect("/")
                })
            }
        })
        
        
    })

// function get_food_image(model){
//     var image;
//     FoodImages.findOne({food:model}).then(x=>{
//         var image = x.path
//     })
// }

app.get("/menu",async function(req,res){
    var data = null
    await Food.find().sort({createdAt:-1}).then(result=>{
        data = result
    })
    res.render("menu",{user:req.user,data:data})
})
app.get("/logout",function(req,res){
    res.clearCookie("userid")
    if(req.cart)
        res.clearCookie("cartid")
    delete req.session.userid
    res.redirect("/login")
})
app.get("/add-to-cart",async function(req,res){
    if(!req.cookies.cartid){
        var cart = new Cart()
        if(req.user)
            cart.user = req.user.username
        await cart.save().then(result=>{
           res.cookie("cartid",result._id,{maxAge:172800000})
        })
        
        stuff = req.query.item
        if(stuff)
            cart.food.push(stuff)
        cart.save()
        res.json({message:"created stuff"})

    }
    else{
        stuff = req.query.item
        if(!stuff){
            res.redirect("/")
            return
        }
        await Cart.findOne({_id:req.cookies.cartid}).then(result=>{
            result.food.push(stuff)
            result.save()
            res.json({message:"success"})
        })
    }
})
app.get("/cart",async function(req,res){
    var items = null
    if(req.cart){
        if(req.cart.food)
            items = req.cart.food
    }
    var fullitems = []
    if(items){
        for(var e = 0; e < items.length; e++){
            await Food.findOne({name:items[e]}).then( async (result)=>{
                await FoodImages.findOne({food:items[e]}).then(image=>{
                    result.image = image.path
                }).catch(err=>{
                    
                })
                fullitems.push(result)
            })
        }
        res.render("cart",{user:req.user,food:fullitems})
    }
    else{
        res.render("cart",{user:req.user})
    }
})
app.get("/cart/:name/delete",async function(req,res){

    if(req.cart){
        try{
        req.cart.food.splice(req.cart.food.indexOf(req.params.name),1)
        }catch(err){
            res.redirect("/cart")
            return
        }
        await Cart.findById(req.cookies.cartid).then(result=>{
            result.food.splice(result.food.indexOf(req.params.name),1)
            result.save()
            res.redirect("/cart")
        }).catch(err=>{
            res.redirect("/cart")
            return
        })

    }else{
        res.redirect("/cart")
    }
    

})

app.route("/order").get(async function(req,res){
    if(!req.user || !req.cart){
        res.redirect("/")
        return
    }
    var items = req.cart.food
    var fullitems = []
    if(items){
    for(var e = 0; e < items.length; e++){
        await Food.findOne({name:items[e]}).then( async (result)=>{
            await FoodImages.findOne({food:items[e]}).then(image=>{
                result.image = image.path
            }).catch(err=>{
                
            })
            fullitems.push(result)
        })
    }
    res.render("order",{user:req.user,food:fullitems})
    }
    else{
        res.render("order",{user:req.user})
    }
    
}).post(async function(req,res){
    var order = new Order()
    order.user = req.user.username
    await Cart.findById(req.cookies.cartid).then(result=>{
        order.food = result.food
        result.status = "CLOSED"
        result.save()
    })
    order.address = req.body.address
    order.save().then(data=>{
        res.clearCookie("cartid")
        res.redirect("/finish-order")
    })
    
})
app.get("/finish-order",function(req,res){
    res.render("finish-order")
})
app.route("/test").get(function(req,res){
    res.render("test")
}).post(function(req,res){
    var game = req.body.interest
    res.send(""+game+','+req.body.stuff)
})
app.get("/clear",function(req,res){
    res.clearCookie("cartid")
    res.send("cleared")
})

// app.listen(3000)