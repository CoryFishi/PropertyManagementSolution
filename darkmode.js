let darkMode = localStorage.getItem('darkMode');
const darkModeToggle = document.querySelector('#darkModeToggle');

const enableDarkMode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkMode', "enabled");
};

const disableDarkMode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkMode', null);
};

// Set initial checkbox state based on darkMode value
darkModeToggle.checked = darkMode === "enabled";

// Function to toggle dark mode when checkbox is clicked
darkModeToggle.addEventListener("change", () => {
    checkDarkMode();
});

function checkDarkMode() {
    if (darkModeToggle.checked) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

checkDarkMode();