const togglee = document.querySelector(".nav-item");

function toggle() {
  if (togglee.style.display != "flex") {
    togglee.style.display = "flex";
  } else togglee.style.display = "none";
}

// about section tab
(() => {
  const aboutSection = document.querySelector(".about-section"),
    tabsContainer = document.querySelector(".about-tabs");

  tabsContainer.addEventListener("click", (event) => {
    if (
      event.target.classList.contains("tab-item") &&
      !event.target.classList.contains("active")
    ) {
      const target = event.target.getAttribute("data-target");
      //   deactivate current tab
      tabsContainer
        .querySelector(".active")
        .classList.remove("outer-shadow", "active");
      //   activate new tab
      event.target.classList.add("active", "outer-shadow");
      // hide current content
      aboutSection
        .querySelector(".tab-content.active")
        .classList.remove("active");
      // active new content
      aboutSection.querySelector(target).classList.add("active");
    }
  });
})();

// style switcher
/* ------------------------
  togle style switcher
  ----------------------*/
const styleSwitcherToggler = document.querySelector(".style-switcher-toggler");
styleSwitcherToggler.addEventListener("click", () => {
  document.querySelector(".style-switcher").classList.toggle("open");
});

// hide switcher when site scroll
window.addEventListener("scroll", () => {
  if (document.querySelector(".style-switcher").classList.contains("open")) {
    document.querySelector(".style-switcher").classList.remove("open");
  }
});
// hide switcher when click outside of it
document.addEventListener("click", (event) => {
  // if user click inside do nothing
  if (event.target.closest(".style-switcher")) {
    return;
  } else {
    document.querySelector(".style-switcher").classList.remove("open");
  }
});

// theme color
const alternateStyle = document.querySelectorAll(".alternate-style");
function setActiveStyle(color) {
  localStorage.setItem("color", color);
  changeColor();

  // close switcher when user selct thr color
  document.querySelector(".style-switcher").classList.remove("open");
}

function changeColor() {
  alternateStyle.forEach((style) => {
    if (localStorage.getItem("color") === style.getAttribute("title")) {
      style.removeAttribute("disabled");
    } else {
      style.setAttribute("disabled", "true");
    }
  });
}

// first we check color key exist??
if (localStorage.getItem("color") !== null) {
  changeColor();
}

// theme light and dark mode
const dayNight = document.querySelector(".day-night");
const hideWhiteColor = document.querySelector("#specialSpan");
let isWhite;
dayNight.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    hideWhiteColor.style.display = "inline-block";
  } else {
    localStorage.setItem("theme", "light");
    hideWhiteColor.style.display = "none";
    localStorage.setItem("color", "color-1");
    changeColor();
  }
  updateIcon();
});

function themeMode() {
  // again just checking if key is present or not
  if (localStorage.getItem("theme") !== null) {
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.remove("dark");
    } else {
      document.body.classList.add("dark");
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
// boom guys .. preloader dissapear
window.addEventListener("load", () => {
  document.querySelector(".preloader").classList.add("fade-out");
  setTimeout(() => {
    document.querySelector(".preloader").style.display = "none";
  }, 600);
});

// get today date
function getTodayDate() {
  const today = new Date();

  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
  const day = String(today.getDate()).padStart(2, '0');
  const year = String(today.getFullYear()); // Get the last two digits of the year

  return `${day}/${month}/${year}`;
}
const todayDate = getTodayDate();
console.log(todayDate, 'today');

// calculate experiance 
function calculateDuration(startDate, endDate) {
  // Parse the input dates
  const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
  const [endDay, endMonth, endYear] = endDate.split('/').map(Number);

  // Create Date objects for start and end dates
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  // Calculate the difference in years and months
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  // Adjust if the end month is earlier in the year than the start month
  if (months < 0) {
    years--;
    months += 12;
  }

  // Adjust for days (if end day is earlier in the month than the start day)
  if (end.getDate() < start.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  if (years) {
    return `${years} yr${years !== 1 ? 's' : ''} ${months} mon${months !== 1 ? 's' : ''}`;    
  }else{
    return `${months} mon${months !== 1 ? 's' : ''}`;    
  }

}

// Example usage:
const experienceOfAsite = calculateDuration("01/02/2023", todayDate.toString());
const experienceOfFrshr = calculateDuration("01/11/2021","01/04/2022");
const experienceOfWhisttler = calculateDuration("01/07/2021", "01/12/2021");

console.log(experienceOfAsite, 'asite');
console.log(experienceOfFrshr);
console.log(experienceOfWhisttler);