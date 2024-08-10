// import { User } from "../models/User.js";
// import jwt from 'jsonwebtoken'
// import bcrypt from "bcrypt";


// export const registerUser = async(req,res)=>{
//     const {username, password, name, email} = req.body;
//     try {
//         const existingUser = await User.findOne({email});
//         console.log({username, password, name, email})
//         if(existingUser){
//             res.status(400).json({message: "User already exist please sign in!!"});
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const user = new User({ username, name, email, password: hashedPassword});
//         const savedUser = await user.save();
//         if(savedUser){
//             const token = jwt.sign({username},process.env.JWT_SECRET)
//             res.status(201).json({
//                 user: savedUser,
//                 token: token
//             });
//         }
        
//     }
//     catch(err){
//         res.status(500).json({message: err.message})
//     }
// }

// export const loginUser = async(req,res)=>{
//     const {username,password} = req.body;

//     try{
//         const user = await User.findOne({username});
//         if(!user){
//             res.status(404).json({
//                 message: "user not found",
//               });
//         }
//          const isPasswordValid = await bcrypt.compare(user.password,password);
//          if(!isPasswordValid){
//             res.status(400).json({
//                 message: "Invalid username or password"
//             })
//          }
//          const token = jwt.sign({username},process.env.JWT_SECRET)
//          res.status(201).json({
//             user: savedUser,
//             token: token
//         });
//     }
//     catch(error){
//         if(error){
//             res.status(500).json({
//                 error: error.message
//             })
//         }
//     }
// }

// export const verifyToken = (req, res, next) => {
//     const token = req.header('Authorization').replace('Bearer ', '');

//     if (!token) {
//         return res.status(401).json({ message: 'No token provided' });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         res.status(401).json({ message: 'Invalid token' });
//     }
// };
