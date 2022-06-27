const express = require('express')
const router = express.Router()
const path = require('path')

const index = path.join(__dirname,"../templates/index.html")


router.get("/",(req,res)=>{
    res.status(200)
    res.type('text/html')
    res.sendFile(index)

})
router.get("/product/:id",(req,res)=>{
    const productID = req.params.id
    if(productID === "1"){
        res.sendFile(path.join(__dirname,"../templates/product1.html"))
    }else if (productID === "2"){
        res.sendFile(path.join(__dirname,"../templates/product2.html"))
    }else if (productID === "3"){
        res.sendFile(path.join(__dirname,"../templates/product3.html"))
    }else{
        res.redirect('/')
    }
    
})
module.exports = router