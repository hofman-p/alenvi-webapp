webpackJsonp([3],{280:function(t,e,o){var n=o(281);"string"==typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);o(3)("eb1bc2ee",n,!1)},281:function(t,e,o){e=t.exports=o(2)(!0),e.push([t.i,"\n.logo-container {\n  width: 255px;\n  height: 242px;\n  -webkit-perspective: 800px;\n          perspective: 800px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translateX(-50%) translateY(-50%);\n          transform: translateX(-50%) translateY(-50%);\n}\n.logo {\n  position: absolute;\n  -webkit-transform-style: preserve-3d;\n          transform-style: preserve-3d;\n}","",{version:3,sources:["/Users/pierre/Desktop/Work/GitHub/alenvi-webapp/src/components/Hello.vue"],names:[],mappings:";AACA;EACE,aAAa;EACb,cAAc;EACd,2BAA2B;UACnB,mBAAmB;EAC3B,mBAAmB;EACnB,SAAS;EACT,UAAU;EACV,qDAAqD;UAC7C,6CAA6C;CACtD;AACD;EACE,mBAAmB;EACnB,qCAAqC;UAC7B,6BAA6B;CACtC",file:"Hello.vue",sourcesContent:["\n.logo-container {\n  width: 255px;\n  height: 242px;\n  -webkit-perspective: 800px;\n          perspective: 800px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translateX(-50%) translateY(-50%);\n          transform: translateX(-50%) translateY(-50%);\n}\n.logo {\n  position: absolute;\n  -webkit-transform-style: preserve-3d;\n          transform-style: preserve-3d;\n}"],sourceRoot:""}])},282:function(t,e,o){"use strict";function n(t,e,o){var n=o>0?1:-1;return{roll:Math.atan2(e,n*Math.sqrt(Math.pow(o,2)+.001*Math.pow(t,2)))*s,pitch:-Math.atan2(t,Math.sqrt(Math.pow(e,2)+Math.pow(o,2)))*s}}Object.defineProperty(e,"__esModule",{value:!0});var r=o(5),i=r.r.viewport,a=r.s.position,s=180/Math.PI;e.default={name:"index",components:{QLayout:r.h,QToolbar:r.l,QToolbarTitle:r.m,QBtn:r.a,QIcon:r.c,QList:r.i,QListHeader:r.j,QItem:r.e,QItemSide:r.g,QItemMain:r.f},data:function(){return{orienting:window.DeviceOrientationEvent&&!this.$q.platform.is.desktop,rotating:window.DeviceMotionEvent&&!this.$q.platform.is.desktop,moveX:0,moveY:0,rotateY:0,rotateX:0}},computed:{position:function(){var t="rotateX("+this.rotateX+"deg) rotateY("+this.rotateY+"deg)";return{top:this.moveY+"px",left:this.moveX+"px","-webkit-transform":t,"-ms-transform":t,transform:t}}},methods:{launch:function(t){Object(r.t)(t)},move:function(t){var e=i(),o=e.width,n=e.height,r=a(t),s=r.top,l=r.left,c=n/2,u=o/2;this.moveX=(l-u)/u*-30,this.moveY=(s-c)/c*-30,this.rotateY=l/o*40*2-40,this.rotateX=-(s/n*40*2-40)},rotate:function(t){if(t.rotationRate&&null!==t.rotationRate.beta&&null!==t.rotationRate.gamma)this.rotateX=.7*t.rotationRate.beta,this.rotateY=-.7*t.rotationRate.gamma;else{var e=t.acceleration.x||t.accelerationIncludingGravity.x,o=t.acceleration.y||t.accelerationIncludingGravity.y,r=t.acceleration.z||t.accelerationIncludingGravity.z-9.81,i=n(e,o,r);this.rotateX=.7*i.roll,this.rotateY=-.7*i.pitch}},orient:function(t){null===t.beta||null===t.gamma?(window.removeEventListener("deviceorientation",this.orient,!1),this.orienting=!1,window.addEventListener("devicemotion",this.rotate,!1)):(this.rotateX=.7*t.beta,this.rotateY=-.7*t.gamma)}},mounted:function(){var t=this;this.$nextTick(function(){t.orienting?window.addEventListener("deviceorientation",t.orient,!1):t.rotating?window.addEventListener("devicemove",t.rotate,!1):document.addEventListener("mousemove",t.move)})},beforeDestroy:function(){this.orienting?window.removeEventListener("deviceorientation",this.orient,!1):this.rotating?window.removeEventListener("devicemove",this.rotate,!1):document.removeEventListener("mousemove",this.move)}}},283:function(t,e,o){t.exports={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("q-layout",{ref:"layout",attrs:{view:"lHh Lpr fff","left-class":{"bg-grey-2":!0}}},[n("q-toolbar",{staticClass:"glossy",attrs:{slot:"header"},slot:"header"},[n("q-btn",{attrs:{flat:""},on:{click:function(e){t.$refs.layout.toggleLeft()}}},[n("q-icon",{attrs:{name:"menu"}})],1),t._v(" "),n("q-toolbar-title",[t._v("\n      Quasar App\n      "),n("div",{attrs:{slot:"subtitle"},slot:"subtitle"},[t._v("Running on Quasar v"+t._s(t.$q.version))])])],1),t._v(" "),n("div",{attrs:{slot:"left"},slot:"left"},[n("q-list",{attrs:{"no-border":"",link:"","inset-delimiter":""}},[n("q-list-header",[t._v("Essential Links")]),t._v(" "),n("q-item",{on:{click:function(e){t.launch("http://quasar-framework.org")}}},[n("q-item-side",{attrs:{icon:"school"}}),t._v(" "),n("q-item-main",{attrs:{label:"Docs",sublabel:"quasar-framework.org"}})],1),t._v(" "),n("q-item",{on:{click:function(e){t.launch("http://forum.quasar-framework.org")}}},[n("q-item-side",{attrs:{icon:"record_voice_over"}}),t._v(" "),n("q-item-main",{attrs:{label:"Forum",sublabel:"forum.quasar-framework.org"}})],1),t._v(" "),n("q-item",{on:{click:function(e){t.launch("https://gitter.im/quasarframework/Lobby")}}},[n("q-item-side",{attrs:{icon:"chat"}}),t._v(" "),n("q-item-main",{attrs:{label:"Gitter Channel",sublabel:"Quasar Lobby"}})],1),t._v(" "),n("q-item",{on:{click:function(e){t.launch("https://twitter.com/quasarframework")}}},[n("q-item-side",{attrs:{icon:"rss feed"}}),t._v(" "),n("q-item-main",{attrs:{label:"Twitter",sublabel:"@quasarframework"}})],1)],1)],1),t._v(" "),n("div",{staticClass:"layout-padding logo-container non-selectable no-pointer-events"},[n("div",{staticClass:"logo",style:t.position},[n("img",{attrs:{src:o(284)}})])])],1)},staticRenderFns:[]},t.exports.render._withStripped=!0},284:function(t,e,o){t.exports=o.p+"img/quasar-logo-full.c3e8865.svg"},32:function(t,e,o){function n(t){r||o(280)}var r=!1,i=o(4)(o(282),o(283),n,null,null);i.options.__file="/Users/pierre/Desktop/Work/GitHub/alenvi-webapp/src/components/Hello.vue",i.esModule&&Object.keys(i.esModule).some(function(t){return"default"!==t&&"__"!==t.substr(0,2)})&&console.error("named exports are not supported in *.vue files."),i.options.functional&&console.error("[vue-loader] Hello.vue: functional components are not supported with templates, they should use render functions."),t.exports=i.exports}});