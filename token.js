// Variable to track if popup is opened
var opened = false;

// Function to disable all buttons
function disableButtons() {
  var buttons = document.getElementsByTagName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }
}

// Function to enable all buttons
function enableButtons() {
  var buttons = document.getElementsByTagName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = false;
  }
}

// Event listener for bearerButton click
document.getElementById("bearerButton").addEventListener("click", function () {
  // Check if popup is already opened
  if (opened) {
    return false; // Exit function if already opened
  }

  // Disable scrolling on body
  document.body.style.overflow = "hidden";
  opened = true; // Mark popup as opened
  disableButtons(); // Disable buttons while popup is open

  // Create popup container
  const popupContainer = document.createElement("div");
  popupContainer.classList.add("popup-container");

  // Create inputs for properties
  const labels = [
    "Property ID",
    "Username",
    "Password",
    "Client ID",
    "Secret ID",
  ];
  const inputs = [];
  labels.forEach((labelText) => {
    const label = document.createElement("label");
    label.textContent = labelText + ":";
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    const storedKey = labelText.replace(/\s+/g, "_").toLowerCase();
    const storedValue = localStorage.getItem(storedKey);
    input.setAttribute(
      "placeholder",
      storedValue || "Enter " + labelText.toLowerCase().replace(/\s+/g, "_")
    );
    const wrapper = document.createElement("div");
    wrapper.classList.add("input-wrapper");
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    inputs.push(input);
    popupContainer.appendChild(wrapper);
  });

  // Create submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.classList.add("submit-button");
  submitButton.addEventListener("click", function () {
    var reloadNeeded = false;
    inputs.forEach((input, index) => {
      const value = input.value.trim();
      if (value !== "") {
        reloadNeeded = true;
        localStorage.setItem(
          labels[index].toLowerCase().replace(/\s+/g, "_"),
          value
        );
      }
    });
    document.body.removeChild(popupContainer);
    opened = false;
    if (reloadNeeded) {
      location.reload();
    }
    document.body.style.overflow = "";
    enableButtons();
  });

  // Create clear button
  const clearButton = document.createElement("button");
  clearButton.textContent = "Clear";
  clearButton.classList.add("clear-button");
  clearButton.addEventListener("click", function () {
    localStorage.clear();
    document.body.removeChild(popupContainer);
    opened = false;
    location.reload();
  });

  // Create saved facilities dropdown
  const savedWrapper = document.createElement("div");
  const savedLabel = document.createElement("label");
  savedLabel.textContent = "Saved Facilities:";
  savedWrapper.appendChild(savedLabel);
  const selectButton = document.createElement("select");
  selectButton.classList.add("select-button");
  var options = [
    { value: "", text: "Select" },
    { value: "option1", text: "Cory - Test Facility" },
    { value: "option2", text: "Conference Storage" },
    { value: "option3", text: "QA Facility" },
  ];
  options.forEach(function (option) {
    var optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
    selectButton.appendChild(optionElement);
  });
  savedWrapper.appendChild(selectButton);
  selectButton.addEventListener("change", function (event) {
    var selectedOption = event.target.value;
    switch (selectedOption) {
      // Set values based on selected facility
      case "option1":
        localStorage.setItem("environment", "-Dev");
        localStorage.setItem("property_id", "1037");
        localStorage.setItem("client_id", "Cory");
        localStorage.setItem("secret_id", "GZ4683xVdf3MBqf9aw7KVZrs");
        localStorage.setItem("username", "LD60At1OyBLL3zLGkLuYVctfz7ffqDTI");
        localStorage.setItem("password", "piPTpqsU1T65f6tsHKj3hGTUDJDnGJqu");
        opened = false;
        location.reload();
        break;
      case "option2":
        localStorage.setItem("environment", "");
        localStorage.setItem("property_id", "11834");
        localStorage.setItem("client_id", "6Storage");
        localStorage.setItem("secret_id", "kOe3fE6kYLpDdyK115TEuF8y");
        localStorage.setItem("username", "c6dH7hHJSFBprmPuPb3xDFu7tmOuV7EM");
        localStorage.setItem("password", "tIncVHx0MXrL6mGZQ9Ldvm7yJwZrx5M0");
        opened = false;
        location.reload();
        break;
      case "option3":
        localStorage.setItem("environment", "-QA");
        localStorage.setItem("property_id", "2935");
        localStorage.setItem("client_id", "QASmartLock");
        localStorage.setItem("secret_id", "s7Dz9J35pGrcOIBqgmpc10RE");
        localStorage.setItem("username", "9jMEFawlDp1bDWCaMnQwF32h2jo4n4Fm");
        localStorage.setItem("password", "BU8DCZxfNIWe0LJMnvw1GNGxyNR9u0e9");
        opened = false;
        location.reload();
        break;
    }
  });

  // Create environment dropdown
  const envWrapper = document.createElement("div");
  const envLabel = document.createElement("label");
  envLabel.textContent = "Environment:";
  envWrapper.appendChild(envLabel);
  const envButton = document.createElement("select");
  envButton.classList.add("select-button");
  var envOptions = [
    { value: "", text: localStorage.getItem("environment") === "" ? "Prod" : localStorage.getItem("environment") },
    { value: "option1", text: "Production" },
    { value: "option2", text: "Development" },
    { value: "option3", text: "QA" },
  ];
  envOptions.forEach(function (option) {
    var optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
    envButton.appendChild(optionElement);
  });
  envWrapper.appendChild(envButton);
  envButton.addEventListener("change", function (event) {
    var selectedOption = event.target.value;
    switch (selectedOption) {
      // Set environment based on selected option
      case "option1":
        localStorage.setItem("environment", "");
        opened = false;
        location.reload();
        break;
      case "option2":
        localStorage.setItem("environment", "-Dev");
        opened = false;
        location.reload();
        break;
      case "option3":
        localStorage.setItem("environment", "-Qa");
        opened = false;
        location.reload();
        break;
    }
  });

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.classList.add("close-button");
  closeButton.addEventListener("click", function () {
    opened = false;
    document.body.removeChild(popupContainer);
    document.body.style.overflow = "";
    enableButtons();
  });

  // Append elements to popup container
  popupContainer.appendChild(closeButton);
  popupContainer.appendChild(submitButton);
  popupContainer.appendChild(clearButton);
  popupContainer.appendChild(savedWrapper);
  popupContainer.appendChild(envWrapper);
  document.body.appendChild(popupContainer);
});
