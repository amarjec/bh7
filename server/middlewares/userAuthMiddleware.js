import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) =>{
    // Correctly get the token from the cookies
    const {token} = req.cookies; 
    
    if(!token) {
        return res.status(401).json({success: false, message: "Not Authorised. Login Again" })
    } 

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        
        if(tokenDecode.id){
           req.userId = tokenDecode.id;
        } else {
            return res.status(401).json({success: false, message: "Not Authorised. Login Again" })
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({success: false , message: "Invalid or expired token."}) 
    }
}

export default userAuth;