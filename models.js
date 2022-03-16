const mongoose = require("mongoose")

const Schema = mongoose.Schema

const foods = new Schema({
    name:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: false
    },
    tags:[],
    in_stock:{
        type: Boolean,
        default: true
    }
},{timestamps:true})
const foodImages = new Schema({
    food:String,
    path: String
},{timestamps: true})

const Food = mongoose.model("Food",foods,"foods")

const userSchema = new Schema({
    firstname:{
        type: String,
        required: false
    },
    lastname:{
        type: String,
        required: false
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    admin:{
        type: Boolean,
        default: false,
    },
    staff: {
        type: Boolean,
        default: false
    },
    active:{
        type: Boolean,
        default: true
    }
},{timestamps: true})
const cartSchema = new Schema({
    user: {
        type: String,
        required: false
    },
    food:[String],
    status:{
        type: String,
        required: true,
        default:"OPEN"
    },
    
},{timestamps: true})

const OrderSchema = new Schema({
    user:{
        type: String,
        required: true
    },
    food:[String],
    address:{
        type: String,
        required: true
    },
    status:{
        type:String,
        default:"NEW"
    },
    date:{
        type: Date,
        default: Date.now().toString()
    }
},{timestamps: true})

const User = mongoose.model("User",userSchema,"users")
const FoodImages = mongoose.model("FoodImages",foodImages,"foodimages")
const Cart = mongoose.model("Cart",cartSchema,"carts")
const Order = mongoose.model("Order",OrderSchema,"orders")

exports.User = User;
exports.FoodImages = FoodImages;
exports.Cart = Cart;
exports.Order = Order;
exports.Food = Food; 


