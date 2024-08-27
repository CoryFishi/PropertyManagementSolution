// Variable to track if popup is opened
var opened = false;

if (!localStorage.getItem("environment")) {
  localStorage.setItem("environment", "");
}

savedFacilities = [];

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
    input.setAttribute("id", labelText.toLowerCase().replace(/\s+/g, "_"));
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
          storedKeys[index].toLowerCase().replace(/\s+/g, "_"),
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
    localStorage.setItem("environment", "");
    localStorage.setItem("stageKey", "");
    document.body.removeChild(popupContainer);
    opened = false;
    location.reload();
  });

  // Create save button
  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.classList.add("save-button");
  saveButton.addEventListener("click", function () {
    const idValue = document.getElementById("property_id").value.trim();
    const authKeyValue = document
      .getElementById("authorization_key")
      .value.trim();
    const authSecretValue = document
      .getElementById("authorization_secret")
      .value.trim();
    const clientIdValue = document.getElementById("client_id").value.trim();
    const clientSecretValue = document
      .getElementById("client_secret")
      .value.trim();

    if (
      idValue &&
      authKeyValue &&
      authSecretValue &&
      clientIdValue &&
      clientSecretValue
    ) {
      let savedFacilities = getObjectArrayFromLocalStorage();
      savedFacilities.push({
        property_id: idValue,
        username: authKeyValue,
        password: authSecretValue,
        client_id: clientIdValue,
        secret_id: clientSecretValue,
        value: idValue,
      });
      localStorage.setItem("property_id", idValue);
      localStorage.setItem("client_id", clientIdValue);
      localStorage.setItem("secret_id", clientSecretValue);
      localStorage.setItem("username", authKeyValue);
      localStorage.setItem("password", authSecretValue);
      saveObjectArrayToLocalStorage(savedFacilities);
      updateDropdownOptions();
    }
  });

  // Create saved facilities dropdown
  const savedWrapper = document.createElement("div");
  const savedLabel = document.createElement("label");
  savedLabel.textContent = "Saved Facilities:";
  savedWrapper.appendChild(savedLabel);

  const selectButton = document.createElement("select");
  selectButton.classList.add("select-button");
  selectButton.id = "droppy";
  savedWrapper.appendChild(selectButton);
  var optionElement = document.createElement("option");
  optionElement.value = null;
  optionElement.text = "-";
  selectButton.appendChild(optionElement);

  setTimeout(function () {
    updateDropdownOptions();
  }, 500);

  // Event listener for dropdown selection changes
  selectButton.addEventListener("change", function (event) {
    const selectedValue = event.target.value;
    const selectedFacility = getObjectArrayFromLocalStorage().find(
      (facility) => facility.value === selectedValue
    );
    if (selectedFacility) {
      localStorage.setItem("property_id", selectedFacility.property_id);
      localStorage.setItem("client_id", selectedFacility.client_id);
      localStorage.setItem("secret_id", selectedFacility.secret_id);
      localStorage.setItem("username", selectedFacility.username);
      localStorage.setItem("password", selectedFacility.password);
      opened = false;
      location.reload();
    } else {
      localStorage.setItem("property_id", "");
      localStorage.setItem("client_id", "");
      localStorage.setItem("secret_id", "");
      localStorage.setItem("username", "");
      localStorage.setItem("password", "");
      opened = false;
      location.reload();
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
  popupContainer.appendChild(saveButton);
  popupContainer.appendChild(savedWrapper);
  popupContainer.appendChild(envWrapper);
  document.body.appendChild(popupContainer);

  // Function to update the dropdown options
  function updateDropdownOptions() {
    const selectyButton = document.getElementById("droppy");
    const options = getObjectArrayFromLocalStorage();
    options.forEach(function (option) {
      var optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.text = option.value;
      selectyButton.appendChild(optionElement);
    });
  }

  // Function to get the array of objects from localStorage or return an empty array if not present
  function getObjectArrayFromLocalStorage() {
    let array = localStorage.getItem("savedFacilities");
    return array ? JSON.parse(array) : [];
  }

  // Function to save the array of objects back to localStorage
  function saveObjectArrayToLocalStorage(array) {
    localStorage.setItem("savedFacilities", JSON.stringify(array));
  }
});
