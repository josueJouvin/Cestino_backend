import mongoose from "mongoose";
import bcrypt from "bcrypt"
import generateId from "../helpers/generateId.js";

const sellerSchema = mongoose.Schema({
    name:{
        type: String,
        require: true,
        trim: true
    },
    password:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    phone:{
        type: String,
        default: null,
        trim: true
    },
    companyName:{
        type: String,
        default: null,
        trim: true
    },
    token:{
        type: String,
        default: () => generateId()
    },
    confirmed:{
        type: Boolean,
        default: false
    }
})

sellerSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})
sellerSchema.methods.checkPassword = async function(formPassword){
    return await bcrypt.compare(formPassword, this.password)
}
const Seller = mongoose.model('Seller', sellerSchema)
export default Seller;