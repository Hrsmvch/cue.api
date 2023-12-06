const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {  
    const token = (req.headers.authorization || '').replace(/Bearer\s?/g, ''); 

    if(token){ 
        try {
          const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)  
          req.userId = decoded.id;  
          next();
        } catch (error) {  
          return  res.status(403).json({message: `You do not have access!`})
        }
      }else{ 
        return  res.status(403).json({message: 'You do not have access! 2'})
      }
 
}

module.exports = { verifyJWT } 