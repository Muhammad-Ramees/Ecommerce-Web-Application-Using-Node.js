const { response } = require('express');
var express = require('express');
var productHelpers=require('../helpers/product-helpers')
var userHelpers=require('../helpers/user-helpers')
var router = express.Router();
var router = express.Router();
const verifylogin=(req,res,next)=>{
  if(req.session.loggedin)
  {
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async  function(req, res, next) {
  let user=req.session.user
  console.log(user);
  let cartCount=null
  if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    //console.log(products);
    res.render('user/View-Products',{products,user,cartCount})
  })
  
});
router.get('/login',(req,res)=>{
  if(req.session.loggedin){
    res.redirect('/')
  }else{
  res.render('user/login',{"loginerror":req.session.loginerror})
  req.session.loginerror=false
}

})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
userHelpers.doSignup(req.body).then ((response)=>{
console.log(response);
req.session.loggedin=true
  req.session.user=response
  res.redirect('/')
})
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
if (response.status){
  req.session.loggedin=true
  req.session.user=response.user
  res.redirect('/')
}else{
  req.session.loginerror="invalid username or password" 
  res.redirect('/login')
}
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')

})
router.get('/cart',verifylogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products);
  res.render('user/cart',{products,user:req.session.user._id,totalValue})
})
router.get('/add-to-cart/:id',async(req,res)=>{
  console.log("api called");
  userHelpers.addCart(req.params.id,req.session.user._id).then(()=>{
   // res.redirect('/')
    res.json({status:true})
  })

})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
 res.json(response)
  })
})
router.post('/remove-product',(req,res,next)=>{
  //console.log(req.body)
  userHelpers.removeProduct(req.body).then((response)=>{
 res.json(response)
  })
}) 
router.get('/place-order',verifylogin, async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})
router.post('/place-order',async (req,res)=>{
 // console.log(req.body)
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
    
  })
  console.log(req.body)
})
router.get('/order-success',async(req,res)=>{
  res.render('user/order-Success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
let orders=await userHelpers.getOrderDetailes(req.session.user._id)
console.log(orders)
res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products })
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changepaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("payment success");
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })
})


module.exports = router

