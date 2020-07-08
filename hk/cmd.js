{
  example:function(){
   /*
   this file must be json-like (but you can use functions and js features),
   don't use comments, or add ';' to the end of the data.

   use `GM` constant to access GM scope. (GM stands for greasemonkey)
   to get info (dev, user, userGroup, script, ...), use `let info = GM.getInfo();`

    */
  },
  google_8720: function() {
    GM.GM_openInTab("https://accounts.google.com/AddSession")
  }

}
