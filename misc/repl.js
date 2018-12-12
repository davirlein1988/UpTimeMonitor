var repl = require('repl');

//Start repl

repl.start({
    'prompt' : '>>>',
    'eval' : function(str){
        //Evalution function
        console.log("Evaluation stage: ", str);
        if(str.indexOf('fizz') > -1){
            console.log('buzz');
        }
    }
});
