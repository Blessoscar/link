// pull in validator and is-empty dependencies
const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = {};
     // convert empty fields to string so as to use validator functions

     data.email = !isEmpty(data.email) ? data.email : "";
     data.password = !isEmpty(data.password) ? data.password : "";

     
     //Email checks
     if(Validator.isEmpty(data.email)){
         errors.email = "Email is required";
     } else if(!Validator.isEmail(data.email)){
         errors.email = "Email is invalid";
     }

     //Password Checks
     if(Validator.isEmpty(data.password)){
         errors.password = "Password is required";
     }
    
     if(!Validator.isLength(data.password, {min: 5, max: 30})){
         errors.password = "Password must be atleast 5 characters";
     }
     
     return {
         errors,
         isValid: isEmpty(errors)
     };
};