const regs = {
    phone: /^((1[0-9])\d{9})/,
    password: /^\w+$/
}

const verify = (rule, value, reg, callback)=>{
    if(value){
        if(reg.test(value)){
            if (value.length<8){
                callback(new Error(rule.message))
            }else{
                callback();
            }
            
        }else{
            callback(new Error(rule.message))
        }
    }
    else{
        callback();
    }
}

export default{
    phone:(rule, value,callback)=>{
        return verify(rule,value,regs.phone,callback)
    },
    password:(rule, value,callback)=>{
        return verify(rule,value,regs.password,callback)
    },
}