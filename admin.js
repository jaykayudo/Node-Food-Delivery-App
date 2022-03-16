const express = require("express")
const mongoose = require("mongoose")

const Models = require("./models")
const Food = Models.Food
const Order = Models.Order
const FoodImages = Models.FoodImages
const Cart = Models.Cart
const User = Models.User
const router = express.Router()



router.get("/",function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }else{
        res.render("admin/index",{user:req.user})
    }
})
router.get("/models", async function(req,res){
    // if(!req.user || !req.user.admin){
    //     res.redirect("/")
    // }else{
        var names = await mongoose.modelNames()
        res.render("admin/models",{user:req.user,models:names})
    //}
})
router.get("/models/user",function(req,res){

    // if(!req.user || !req.user.admin){
    //     res.redirect("/")
    // }else{
        User.find().sort({createdAt:-1}).then(result=>{
            res.render("admin/models-user",{user:req.user,models:result})
        })
    // }
})
router.get("/models/food",function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }else{
        Food.find().sort({createdAt:-1}).then(result=>{
            res.render("admin/models-food",{user:req.user,models:result})
        })
    }
})
router.get("/models/cart",function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }else{
        Cart.find().sort({createdAt:-1}).then(result=>{
            res.render("admin/models-cart",{user:req.user,models:result})
        })
    }
})
router.get("/models/order",function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }else{
        Order.find().sort({createdAt:-1}).then(result=>{
            res.render("admin/models-order",{user:req.user,models:result})
        })
    }
})
router.get("/models/foodimages",function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }else{
        FoodImages.find().sort({createdAt:-1}).then(result=>{
            res.render("admin/models-foodimages",{user:req.user,models:result})
        })
    }
})
router.get("/models/user/:id/:action", async function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }else{
       if(req.params.action == "block"){
        await User.findById(req.params.id).then(result=>{
            result.active = false
            result.save()
            
        }).catch(err=>{

        })
        res.redirect("/admin/models/user")
       }
       else if(req.params.action == "activate"){
        await User.findById(req.params.id).then(result=>{
            result.active = true
            result.save()
            
        })
        res.redirect("/admin/models/user")
       }
       else if(req.params.action == "make-admin"){
        await User.findById(req.params.id).then(result=>{
            result.admin = true
            result.save()
           
        })
        res.redirect("/admin/models/user")
       }
       else if(req.params.action == "remove-admin"){
        await User.findById(req.params.id).then(result=>{
            result.admin = false
            result.save()
            
        })
        res.redirect("/admin/models/user")
       }
       else if(req.params.action == "make-staff"){
        await User.findById(req.params.id).then(result=>{
            result.staff = true
            result.save()
           
        })
        res.redirect("/admin/models/user")
        }
        else if(req.params.action == "remove-staff"){
            await User.findById(req.params.id).then(result=>{
                result.staff = false
                result.save()
                
            })
            res.redirect("/admin/models/user")
        }
        else if(req.params.action == "delete"){
            await User.findByIdAndDelete(req.params.id).then(result=>{
                console.log("User Deleted")
            })
            res.redirect("/admin/models/user")
        }
        else {
            res.redirect("/admin/models/user")
        }
    }
})
router.get("/models/user/add",function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }
    else{
    res.render("admin/models-add-user",{user:req.user})
}
})
router.post("/models/user/add",function(req,res){
    var user = new User()
    var info = null
    User.find({username:req.body.username}).then(result=>{
        info = JSON.stringify(result)
        if(info != "[]" ){
            res.render("admin/models-add-user",{"error":"Username Already Exists",user:req.user})
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
            user.save().then(result=>{
                if(req.body.submit == "Save and Add Another"){
                res.redirect("/admin/models/user/add")
                }
                else{
                    res.redirect("/admin/models/user")
                }
            })
        }
    })   
})
router.route("/models/food/add").get(function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }
    else{
    res.render("admin/models-add-food",{user:req.user})
    }
}).post(function(req,res){
    var food = new Food()
    var info = null
    Food.find({name:req.body.name}).then(result=>{
        info = JSON.stringify(result)
        if(info != "[]" ){
            res.render("admin/models-add-food",{"error":"Food Name Already Exists",user:req.user})
            return
        }
        else{
            if(!req.body.Food){
                res.render("admin/models-add-food",{"error":"Please Choose a Tag",user:req.user})
                return
            }
            
            food.name = req.body.name;
            food.description = req.body.description;
            food.price = req.body.price
            if(req.body.instock){
                food.instock = true
            }
            else{
                food.instock = false
            }
            
           
                food.tags.push(...req.body.Food)
            
           
        
            
            food.save().then(result=>{
                if(req.body.submit == "Save and Add Another"){
                res.redirect("/admin/models/food/add")
                }
                else{
                    res.redirect("/admin/models/food")
                }
            })
        }
    })   
})
router.route("/models/food/:id/:action").get(async function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
        return
    }
    var id = req.params.id
    var action = req.params.action
    if(action == "edit"){
        Food.findById(id).then(result=>{
            res.render("admin/models-add-food",{user:req.user,editdata:result})
        })
    }
    else if(action == "delete"){
        await Food.findByIdAndDelete(id)
        res.redirect("/admin/models/food")
    }
}).post(async function(req,res){
    await Food.findById(req.params.id).then(food=>{
        if(!req.body.Food){
            res.render("admin/models-add-food",{"error":"Please Choose a Tag",user:req.user,editdata:food})
            return
        }
        
        food.name = req.body.name;
        food.description = req.body.description;
        food.price = req.body.price
        if(req.body.instock){
            food.instock = true
        }
        else{
            food.instock = false
        }
        food.tags.splice(0,food.tags.length)
        
            food.tags.push(...req.body.Food)
       
        
        
        food.save(function(err,result){
            if(err)
                throw err
            res.redirect("/admin/models/food")
        })
    })
     
})
router.route("/models/foodimages/add").get( async function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }
    else{
    var stuff = [];
    await Food.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            stuff.push(x.name)
        })
    })
    res.render("admin/models-add-foodimages",{user:req.user,food:stuff})
    }
}).post(function(req,res){
    var foodImage = new FoodImages()
    foodImage.food = req.body.food
    var file = req.files.path
    var dirpath = "./uploads/"
    var name = file.name
    file.mv(dirpath+name)
    foodImage.path = "/uploads/"+name
    foodImage.save().then(x=>{
        if(req.body.submit == "Save and Add Another"){
            res.redirect("/admin/models/foodimages/add")
            }
            else{
                res.redirect("/admin/models/foodimages")
            }
    })
        
})
router.route("/models/foodimages/:id/:action").get(async function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
        return
    }
    var id = req.params.id
    var action = req.params.action
    if(action == "edit"){
        var stuff = [];
        await Food.find().sort({createdAt:1}).then(result=>{
            result.forEach(x=>{
            stuff.push(x.name)
        })
        })
        FoodImages.findById(id).then(result=>{
            res.render("admin/models-add-foodimages",{user:req.user,editdata:result,food:stuff})
        })
    }
    else if(action == "delete"){
        await FoodImages.findByIdAndDelete(id)
        res.redirect("/admin/models/foodimages")
    }
}).post(async function(req,res){
    await FoodImages.findById(req.params.id).then(result=>{
        
        result.food = req.body.food
        var file = req.files.path
        var dirpath = "./uploads/"
        var name = file.name
        file.mv(dirpath+name)
        result.path = "/uploads/"+name
        result.save(function(err,result){
            res.redirect("/admin/models/food")
        })
    })
})
     
router.route("/models/cart/add").get( async function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }
    else{
        var stuff = [];
        var cartuser = []
    await Food.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            stuff.push(x.name)
        })
    })
    await User.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            cartuser.push(x.username)
        })
    })
    res.render("admin/models-add-cart",{user:req.user,food:stuff,cartuser:cartuser})
    }
}).post(async function(req,res){
    var cart = new Cart()
        if(req.body.user)
            cart.user = req.body.user
        var foods = [...req.body.food]
        cart.food = foods
    cart.status = req.body.status
    cart.save().then(x=>{
        if(req.body.submit == "Save and Add Another"){
            res.redirect("/admin/models/cart/add")
            }
            else{
                res.redirect("/admin/models/cart")
            }
    })
})
router.route("/models/cart/:id/:action").get( async function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
        return
    }
        var id = req.params.id
        var action = req.params.action
        var stuff = [];
        var cartuser = []
        var editdata;
    if(action == "edit"){
    await Food.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            stuff.push(x.name)
        })
    })
    await User.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            cartuser.push(x.username)
        })
    })
    await Cart.findById(id).then(data=>{
        editdata = data
    })
    res.render("admin/models-add-cart",{user:req.user,food:stuff,cartuser:cartuser,editdata: editdata})
    }
    else if(action == "delete"){
        await Cart.findByIdAndDelete(id)
        res.redirect("/admin/models/cart")
    }
    else if(action == "view"){
        Cart.findById(id).then(data=>{
            res.render("admin/models-cart-view",{user:req.user,data:data})
        })
    }
}).post(async function(req,res){
    Cart.findById(req.params.id).then(cart=>{
        if(req.body.user)
            cart.user = req.body.user
        var foods = [...req.body.food]
        cart.food = foods

    cart.status = req.body.status
    cart.save().then(x=>{
        res.redirect("/admin/models/cart")
            
    })
    })
})
router.route("/models/order/add").get( async function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
    }
    else{
        var stuff = [];
        var orderuser = []
    await Food.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            stuff.push(x.name)
        })
    })
    await User.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            orderuser.push(x.username)
        })
    })
    res.render("admin/models-add-order",{user:req.user,food:stuff,orderuser:orderuser})
    }
}).post(async function(req,res){
    var order = new Order()
        order.user = req.body.user
        var foods = [...req.body.food]
        order.food = foods
    order.address = req.body.address
    order.status = req.body.status
    order.save().then(x=>{
        if(req.body.submit == "Save and Add Another"){
            res.redirect("/admin/models/order/add")
            }
            else{
                res.redirect("/admin/models/order")
            }
    })
})
router.route("/models/order/:id/:action").get( async function(req,res){
    if(!req.user || !req.user.admin){
        res.redirect("/")
        return
    }
        var id = req.params.id
        var action = req.params.action
        var editdata;
        var stuff = [];
        var orderuser = []
    if(action == "edit"){
    await Food.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            stuff.push(x.name)
        })
    })
    await User.find().sort({createdAt:1}).then(result=>{
        result.forEach(x=>{
            orderuser.push(x.username)
        })
    })
    await Order.findById(id).then(data=>{
        editdata = data
        
    })
    res.render("admin/models-add-order",{user:req.user,food:stuff,orderuser:orderuser,editdata:editdata})
    }
    else if(action == "delete"){
        await Order.findByIdAndDelete(id)
        res.redirect("/admin/models/order")
    }
    else if(action == "view"){
        Order.findById(id).then(data=>{
            res.render("admin/models-order-view",{user:req.user,data:data})
        })
    }
}).post(async function(req,res){
    Order.findById(req.params.id).then(order=>{
        order.user = req.body.user
        var foods = [...req.body.food]
            order.food = foods
            console.log(order.food)
    order.address = req.body.address
    order.status = req.body.status
    order.save().then(x=>{
        res.redirect("/admin/models/order")
    })
})
})

module.exports  = router