// function classremove() {
//   var element = document.getElementsByClassName("col-1");
//   element.classList.remove("mr-auto");
// }



// function insertAfter(referenceNode, newNode) {
//   referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
// }
  
//   // var el = document.createElement("span");
//   // el.innerHTML = "test";
//   // var div = document.getElementById("foo");
//   // insertAfter(div, el);




// function myFunction(x) {
//   if (x.matches) { // If media query matches
//   //   document.body.style.backgroundColor = "yellow";
//     var element = document.getElementsByClassName("col-1");
//     for (let i=0; i<element.length; i++) {
//       element[i].classList.add("mr-auto");
//     }
//   }
//   else {
//   //  document.body.style.backgroundColor = "pink";
//     var element = document.getElementsByClassName("col-1");
//     for (let i=0; i<element.length; i++) {
//       element[i].classList.remove("mr-auto");
//     }
//   }
// }

// function splitFunc(x) {
//   if (y.matches) { // If media query matches
//   //   document.body.style.backgroundColor = "yellow";
//     var splitVar = document.createElement("div");
//     var beforeSplit = document.getElementsByClassName("col-1");
//     beforeSplit[3].classList.add("w-100");
//     insertAfter(div, splitVar);
//   }
//   else {
//   //  document.body.style.backgroundColor = "pink";
//     var element = document.getElementsByClassName("col-1");
//   }
// }


// var x = window.matchMedia("(max-width: 768px)")
// myFunction(x) // Call listener function at run time
// x.addListener(myFunction) // Attach listener function on state changes

// var y = window.splitFunc("(max-width: 576px)")
// splitFunc(y) // Call listener function at run time
// y.addListener(splitFunc) // Attach listener function on state changes