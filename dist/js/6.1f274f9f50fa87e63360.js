webpackJsonp([6],{25:function(t,e,s){function i(t){n||s(261)}var n=!1,a=s(4)(s(263),s(264),i,null,null);a.options.__file="/home/jc/Documents/alenvi/alenvi-webapp/src/components/Authenticate.vue",a.esModule&&Object.keys(a.esModule).some(function(t){return"default"!==t&&"__"!==t.substr(0,2)})&&console.error("named exports are not supported in *.vue files."),a.options.functional&&console.error("[vue-loader] Authenticate.vue: functional components are not supported with templates, they should use render functions."),t.exports=a.exports},261:function(t,e,s){var i=s(262);"string"==typeof i&&(i=[[t.i,i,""]]),i.locals&&(t.exports=i.locals);s(3)("5f5b1b52",i,!1)},262:function(t,e,s){e=t.exports=s(2)(void 0),e.push([t.i,"\n.alenvi-logo {\n  width: 125px;\n  height: 125px;\n}\n\n/*.alenvi-logo img {\n  max-width: 100%;\n  height: auto;\n}*/\n",""])},263:function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=s(5);e.default={data:function(){return{credentials:{email:"",password:""}}},methods:{submit:function(){var t="https://alenvi-api.herokuapp.com/bot/authorize"+window.location.search;return window.location.search?t+="&":t+="?",window.location=t+"email="+this.credentials.email+"&password="+this.credentials.password,!1}},components:{QField:i.b,QInput:i.d,QBtn:i.a}}},264:function(t,e,s){t.exports={render:function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("div",{staticClass:"layout-padding"},[s("p",{staticClass:"text-center"},[t._v("Entre tes identifiants pour continuer avec Pigi !")]),t._v(" "),t._m(0),t._v(" "),s("div",{staticClass:"row justify-center"},[s("q-field",{staticClass:"col-xs-12 col-sm-3",attrs:{icon:"mail"}},[s("q-input",{attrs:{"float-label":"Adresse email"},model:{value:t.credentials.email,callback:function(e){t.credentials.email="string"==typeof e?e.trim():e},expression:"credentials.email"}})],1)],1),t._v(" "),s("div",{staticClass:"row justify-center"},[s("q-field",{staticClass:"col-xs-12 col-sm-3",attrs:{icon:"vpn_key"}},[s("q-input",{attrs:{"float-label":"Mot de passe",type:"password"},model:{value:t.credentials.password,callback:function(e){t.credentials.password=e},expression:"credentials.password"}})],1)],1),t._v(" "),s("div",{staticClass:"row justify-center"},[s("div",{staticClass:"col-xs-12 col-sm-3"},[s("q-btn",{staticClass:"full-width",attrs:{color:"primary"},on:{click:function(e){t.submit()}}},[t._v("Login")])],1)])])])},staticRenderFns:[function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"row justify-center"},[s("div",{staticClass:"alenvi-logo"},[s("img",{staticClass:"responsive",attrs:{src:"https://res.cloudinary.com/alenvi/image/upload/v1499948101/images/bot/Pigi.png"}})])])}]},t.exports.render._withStripped=!0}});