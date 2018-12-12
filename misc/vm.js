//Example using vm

var vm = require('vm');


//Context

var context = {
    'foo' : 25
};

var script = new vm.Script(`
    foo = foo * 2;
    var bar = foo + 1;
    var fizz = 52;
`);


//run the script

script.runInNewContext(context);
console.log(context);