// Variable to track if popup is opened
var opened = false;

// Event listener for bearerButton click
document.getElementById("bearerButton").addEventListener("click", function () {
  // Check if popup is already opened
  if (opened) return false;

  // Disable scrolling on body
  document.body.style.overflow = "hidden";
  opened = true;
  disableButtons();

  // Create popup container
  const popupContainer = document.createElement("div");
  popupContainer.classList.add("popup-container");

  // Create inputs for properties
  const labels = [
    "Property ID",
    "Authorization Key",
    "Authorization Secret",
    "Client ID",
    "Client Secret",
  ];
  const storedKeys = [
    "property_id",
    "username",
    "password",
    "client_id",
    "secret_id",
  ];
  const inputs = [];
  labels.forEach((labelText, index) => {
    const label = document.createElement("label");
    label.textContent = labelText + ":";
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    const storedKey = storedKeys[index];
    const storedValue = localStorage.getItem(storedKey);
    input.setAttribute(
      "placeholder",
      storedValue || "Enter " + labelText.toLowerCase().replace(/\s+/g, " ")
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
  savedLabel.textContent = "Saved Facilities: (currently disabled)";
  savedWrapper.appendChild(savedLabel);
  const selectButton = document.createElement("select");
  selectButton.classList.add("select-button");
  var options = [
    { value: "", text: "Select" },
    { value: "option1", text: "option1" },
    { value: "option2", text: "option2" },
    { value: "option3", text: "option3" },
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
        localStorage.setItem("environment", "");
        localStorage.setItem("property_id", "");
        localStorage.setItem("client_id", "");
        localStorage.setItem("secret_id", "");
        localStorage.setItem("username", "");
        localStorage.setItem("password", "");
        localStorage.setItem("stageKey", "");
        opened = false;
        location.reload();
        break;
      case "option2":
        localStorage.setItem("environment", "");
        localStorage.setItem("property_id", "");
        localStorage.setItem("client_id", "");
        localStorage.setItem("secret_id", "");
        localStorage.setItem("username", "");
        localStorage.setItem("password", "");
        localStorage.setItem("stageKey", "");
        opened = false;
        location.reload();
        break;
      case "option3":
        localStorage.setItem("environment", "");
        localStorage.setItem("property_id", "");
        localStorage.setItem("client_id", "");
        localStorage.setItem("secret_id", "");
        localStorage.setItem("username", "");
        localStorage.setItem("password", "");
        localStorage.setItem("stageKey", "");
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
    {
      value: "",
      text:
        localStorage.getItem("stageKey") !== ""
          ? "Staging"
          : localStorage.getItem("environment").includes("-Qa")
          ? "QA"
          : localStorage.getItem("environment").includes("-Dev")
          ? "Development"
          : localStorage.getItem("environment") === ""
          ? "Production"
          : localStorage.getItem("environment"),
    },
    { value: "option1", text: "Production" },
    { value: "option2", text: "Development" },
    { value: "option3", text: "QA" },
    { value: "option4", text: "Staging" },
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
        localStorage.setItem("stageKey", "");
        opened = false;
        location.reload();
        break;
      case "option2":
        localStorage.setItem("environment", "-Dev");
        localStorage.setItem("stageKey", "");
        opened = false;
        location.reload();
        break;
      case "option3":
        localStorage.setItem("environment", "-Qa");
        localStorage.setItem("stageKey", "");
        opened = false;
        location.reload();
        break;
      case "option4":
        localStorage.setItem("stageKey", "cia-stg-1.aws.");
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
