const {Router} = require('express')

const routes = Router()

routes.get('/users',(req,res)=>{
    res.json('userts')
})

module.exports = routes
