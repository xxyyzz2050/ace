{
  example:function(){
   /*
   this file must be json-like (but you can use functions and js features),
   don't use comments, or add ';' to the end of the data.

   use `GM` constant to access GM scope. (GM stands for greasemonkey)

    */
  },
  test_8720: function() {
    let info = GM.getInfo();
    console.log("run test_8720");
    console.log({ dev:info.dev, userGroup:info.userGroup });
  }
}
