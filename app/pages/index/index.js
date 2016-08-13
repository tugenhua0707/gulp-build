
var amodule = require("./a");
console.log(amodule());

$.ajax({
  url: 'http://localhost:4000/index',
  type: 'POST',
  data: {
    'flag' : 2
  },
  dataType: 'json',
  success: function(data){
    console.log(typeof data);
    console.log(data);
    console.log(data.obj.isSuccess)
  }
})