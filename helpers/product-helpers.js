var db=require('../config/connection')
var collection=require('../config/collections')
const { response } = require('express')
var objectId=require('mongodb').ObjectID

module.exports={
    addProduct:(product,callback)=>{
        product.price=parseInt(product.price)
        db.get().collection('product').insertOne(product).then((data)=>{
           
            callback(data.ops[0]._id)

        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            
        console.log(proId);
        console.log(objectId(proId));

          db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=> {
//console.log(response);
resolve(response)
          })
        })

    },
    getProductDetailes:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        proDetails.price=parseInt(proDetails.price)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    name:proDetails.name,
                    description:proDetails.description,
                    category:proDetails.category,
                    price:proDetails.price

                }
            }).then((response)=>{
                resolve()
            })

        })
    }

}