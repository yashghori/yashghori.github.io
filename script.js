const togglee = document.querySelector(".nav-item")

function toggle() {
  if (togglee.style.display != "flex") {
    togglee.style.display = "flex";
  } else
    togglee.style.display = "none";
}

// about section tab
(() => {
  const aboutSection = document.querySelector(".about-section"),
    tabsContainer = document.querySelector(".about-tabs")

  tabsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("tab-item") &&
      !event.target.classList.contains("active")) {
      const target = event.target.getAttribute("data-target");
      //   deactivate current tab
      tabsContainer.querySelector(".active").classList.remove("outer-shadow", "active");
      //   activate new tab
      event.target.classList.add("active", "outer-shadow")
      // hide current content
      aboutSection.querySelector(".tab-content.active").classList.remove("active");
      // active new content
      aboutSection.querySelector(target).classList.add("active")
    }
  })
})();


// style switcher
/* ------------------------
  togle style switcher
  ----------------------*/
const styleSwitcherToggler = document.querySelector(".style-switcher-toggler");
styleSwitcherToggler.addEventListener("click", () => {
  document.querySelector(".style-switcher").classList.toggle("open");
})

// hide switcher when site scroll
window.addEventListener("scroll", () => {
  if (document.querySelector(".style-switcher").classList.contains("open")) {
    document.querySelector(".style-switcher").classList.remove("open");
  }
})
// hode switcher when click outside of it
document.addEventListener("click", (event) => {
  // if user click inside do nothing
  if (event.target.closest(".style-switcher")) {
    return;
  } else {
    document.querySelector(".style-switcher").classList.remove("open");
  }
})

// theme color
const alternateStyle = document.querySelectorAll(".alternate-style")
function setActiveStyle(color) {
  localStorage.setItem("color", color);
  changeColor();

  // close switcher when user selct thr color
  document.querySelector(".style-switcher").classList.remove("open");

}

function changeColor() {
  alternateStyle.forEach((style) => {
    if (localStorage.getItem("color") === style.getAttribute("title")) {
      style.removeAttribute("disabled")
    } else {
      style.setAttribute("disabled", "true")
    }
  })
}

// first we check color key exist??
if (localStorage.getItem("color") !== null) {
  changeColor()
}

// theme light and dark mode
const dayNight = document.querySelector(".day-night")
dayNight.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
  updateIcon()
})

function themeMode() {
  // again just checking if key is present or not
  if (localStorage.getItem("theme") !== null) {

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.remove("dark")

    } else {
      document.body.classList.add("dark")

    }

  }
  updateIcon();
}
themeMode();

function updateIcon() {
  if (document.body.classList.contains("dark")) {
    dayNight.querySelector("i").classList.remove("fa-moon");
    dayNight.querySelector("i").classList.add("fa-sun");

  } else {
    dayNight.querySelector("i").classList.remove("fa-sun");
    dayNight.querySelector("i").classList.add("fa-moon");

  }
}




// window.addEventListener("load", () => {
//   if (document.body.classList.contains("dark")) {
//     dayNight.querySelector("i").classList.add("fa-sun");

//   } else {
//     dayNight.querySelector("i").classList.add("fa-moon");

//   }
// })

// boom guys .. preloader dissapear
window.addEventListener("load", () => {
  document.querySelector(".preloader").classList.add("fade-out");
  setTimeout(() => {
    document.querySelector(".preloader").style.display = "none";

  }, 600);
})