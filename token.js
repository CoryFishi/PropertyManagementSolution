// Variable to track if popup is opened
var opened = false;
var facilitiesInfo = [];

if (!localStorage.getItem("environment")) {
  localStorage.setItem("environment", "");
}

// Function to fetch facilities data
// Function to fetch facilities data
async function getFacilities(facility) {
  var tokenStageKey = "";
  var tokenEnvKey = "";
  if (facility.environment === "cia-stg-1.aws.") {
    tokenStageKey = "cia-stg-1.aws.";
  } else {
    tokenEnvKey = facility.environment;
  }
  try {
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities`,
      {
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + (await facility.bearer.access_token),
          "api-version": "2.0",
        },
      }
    );

    if (!response.ok) {
      console.log(response);
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Loop through each key in the data object
    for (let key in data) {
      if (Array.isArray(data[key])) {
        if (!facilitiesInfo[key]) {
          facilitiesInfo[key] = []; // Initialize if it doesn't exist
        }

        // Create updated array with new properties and merge with existing array
        const updatedArray = data[key].map((item) => {
          return {
            ...item, // Preserve the existing properties of the item
            api: facility.username, // Add new properties
            apiSecret: facility.password,
            clientId: facility.client_id,
            clientSecret: facility.secret_id,
          };
        });

        // Concatenate new entries to the existing ones without overwriting
        facilitiesInfo[key] = facilitiesInfo[key].concat(updatedArray);
      } else {
        // If the key is not an array, preserve existing non-array data
        facilitiesInfo[key] = {
          ...facilitiesInfo[key], // Merge the existing object if any
          ...data[key], // Merge the new data without overwriting existing properties
          api: facility.username,
          apiSecret: facility.password,
          clientId: facility.client_id,
          clientSecret: facility.secret_id,
        };
      }
    }

    return true;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null;
  }
}

// Set local data's bearer
async function setBearer(user, pass, id, secret, environment) {
  var tokenStageKey = "";
  var tokenEnvKey = "";
  if (environment === "cia-stg-1.aws.") {
    tokenStageKey = "cia-stg-1.aws.";
  } else {
    tokenEnvKey = environment;
  }
  try {
    const response = await fetch(
      `https://auth.${tokenStageKey}insomniaccia${tokenEnvKey}.com/auth/token`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: user,
          password: pass,
          scope: "",
          client_id: id,
          client_secret: secret,
          refresh_token: "",
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Bearer network response was not ok");
    }
    const data = await response.json();
    localStorage.setItem("bearer", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error(
      "There was a problem with the bearer fetch operation:",
      error
    );
    return null;
  }
}

// Function to create a bearer token for authentication
async function createBearer(user, pass, id, secret, environment) {
  var tokenStageKey = "";
  var tokenEnvKey = "";
  if (environment === "cia-stg-1.aws.") {
    tokenStageKey = "cia-stg-1.aws.";
  } else {
    tokenEnvKey = environment;
  }
  try {
    const response = await fetch(
      `https://auth.${tokenStageKey}insomniaccia${tokenEnvKey}.com/auth/token`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: user,
          password: pass,
          scope: "",
          client_id: id,
          client_secret: secret,
          refresh_token: "",
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Bearer network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      "There was a problem with the bearer fetch operation:",
      error
    );
    return null;
  }
}

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
});

document.getElementById("authButton").addEventListener("click", async () => {
  // Check if popup is already opened
  if (opened) return false;
  const localSavedFacilities =
    JSON.parse(localStorage.getItem("savedFacilities")) || [];

  // Disable scrolling on body
  document.body.style.overflow = "hidden";
  opened = true;
  disableButtons();

  // Create popup container
  const popupContainer = document.createElement("div");
  popupContainer.classList.add("new-popup-container");

  // Create sub containers
  const menuContainer = document.createElement("div");
  menuContainer.classList.add("menu-container");
  const contentContainer = document.createElement("div");
  contentContainer.classList.add("content-container");

  // Create button navigation
  const applications = document.createElement("button");
  applications.classList.add("auth-menu-button");
  applications.textContent = "Authorization";
  const facilities = document.createElement("button");
  facilities.classList.add("auth-menu-button");
  facilities.textContent = "Facilities";
  const clearData = document.createElement("button");
  clearData.classList.add("auth-menu-button");
  clearData.textContent = "Clear All Data";

  menuContainer.appendChild(applications);
  menuContainer.appendChild(facilities);
  menuContainer.appendChild(clearData);

  clearData.addEventListener("click", async function () {
    localStorage.clear();
    location.reload();
  });

  const appContainer = document.createElement("div");
  appContainer.classList.add("app-container");
  const appContainerSaved = document.createElement("div");
  appContainerSaved.classList.add("app-container-saved");
  const appContainerNew = document.createElement("div");
  appContainerNew.classList.add("app-container-new");

  const savedHeader = document.createElement("h2");
  savedHeader.textContent = "Saved Credentials";
  savedHeader.classList.add("savedHeader");
  appContainerSaved.appendChild(savedHeader);
  const savedList = document.createElement("div");
  appContainer.classList.add("savedList-container");
  appContainerSaved.appendChild(savedList);

  localSavedFacilities.forEach((facility, index) => {
    addFacilityToSavedList(facility, index, savedList);
  });

  const newHeader = document.createElement("h2");
  newHeader.classList.add("newHeader");
  newHeader.textContent = "New Authorization";
  appContainerNew.appendChild(newHeader);
  const newError = document.createElement("h3");
  newError.classList.add("newError");
  newError.classList.add("hidden");
  newError.textContent = "Error";
  const apiLabel = document.createElement("label");
  apiLabel.textContent = "Authorization Key:";
  appContainerNew.appendChild(apiLabel);
  const apiInput = document.createElement("input");
  apiInput.classList.add("textInput");
  appContainerNew.appendChild(apiInput);
  const apiSecretLabel = document.createElement("label");
  apiSecretLabel.textContent = "Authorization Secret:";
  appContainerNew.appendChild(apiSecretLabel);
  const apiSecretInput = document.createElement("input");
  apiSecretInput.classList.add("textInput");
  appContainerNew.appendChild(apiSecretInput);
  const clientIdLabel = document.createElement("label");
  clientIdLabel.textContent = "Client ID:";
  appContainerNew.appendChild(clientIdLabel);
  const clientIdInput = document.createElement("input");
  clientIdInput.classList.add("textInput");
  appContainerNew.appendChild(clientIdInput);
  const clientSecretLabel = document.createElement("label");
  clientSecretLabel.textContent = "Client Secret:";
  appContainerNew.appendChild(clientSecretLabel);
  const clientSecretInput = document.createElement("input");
  clientSecretInput.classList.add("textInput");
  appContainerNew.appendChild(clientSecretInput);
  const envLabel = document.createElement("label");
  envLabel.textContent = "Environment:";
  appContainerNew.appendChild(envLabel);
  const envInput = document.createElement("select");
  envInput.classList.add("textInput");
  // Create option elements
  const option1 = document.createElement("option");
  option1.value = "-dev";
  option1.textContent = "Development";
  const option2 = document.createElement("option");
  option2.value = "-staging";
  option2.textContent = "Staging";
  const option3 = document.createElement("option");
  option3.value = "";
  option3.textContent = "Production";
  const option4 = document.createElement("option");
  option4.value = "-qa";
  option4.textContent = "QA";
  envInput.appendChild(option1);
  envInput.appendChild(option2);
  envInput.appendChild(option3);
  envInput.appendChild(option4);
  appContainerNew.appendChild(envInput);
  const submitButton = document.createElement("button");
  submitButton.classList.add("guestSubmit");
  submitButton.textContent = "Submit";
  appContainerNew.appendChild(newError);
  appContainerNew.appendChild(submitButton);

  appContainer.appendChild(appContainerSaved);
  appContainer.appendChild(appContainerNew);

  const facilitiesContainer = document.createElement("div");
  facilitiesContainer.classList.add("facilities-container");

  const facilitiesTable = document.createElement("table");
  facilitiesTable.className = "visitors-table";

  const headers = ["Id", "Name", "Property Number", "Actions"];
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");

  contentContainer.appendChild(appContainer);

  submitButton.addEventListener("click", async function () {
    const authKeyValue = apiInput.value.trim();
    const authSecretValue = apiSecretInput.value.trim();
    const clientIdValue = clientIdInput.value.trim();
    const clientSecretValue = clientSecretInput.value.trim();
    const envValue = envInput.value;

    const bearerToken = await createBearer(
      authKeyValue,
      authSecretValue,
      clientIdValue,
      clientSecretValue,
      envValue
    );

    if (bearerToken) {
      apiInput.value = "";
      apiSecretInput.value = "";
      clientIdInput.value = "";
      clientSecretInput.value = "";
      let savedFacilities = getObjectArrayFromLocalStorage();

      // Check if the authKeyValue already exists in savedFacilities
      const isDuplicate = savedFacilities.some(
        (facility) => facility.username === authKeyValue
      );

      if (isDuplicate) {
        alert("Credentials already used.");
        return;
      }
      savedFacilities.push({
        username: authKeyValue,
        password: authSecretValue,
        client_id: clientIdValue,
        secret_id: clientSecretValue,
        environment: envValue || "",
        bearer: bearerToken,
      });
      saveObjectArrayToLocalStorage(savedFacilities);
      addFacilityToSavedList(
        {
          username: authKeyValue,
          password: authSecretValue,
          client_id: clientIdValue,
          secret_id: clientSecretValue,
        },
        savedFacilities.length - 1,
        savedList
      );
      alert("Crentials verified and saved.");
    } else {
      if (newError.classList.contains("visible")) {
        alert("Unable to authenticate with these credentials...");
      } else {
        newError.classList.add("visible");
        newError.textContent =
          "Unable to authenticate with these credentials...";
      }
    }
  });

  applications.addEventListener("click", function () {
    contentContainer.removeChild(facilitiesContainer);
    contentContainer.appendChild(appContainer);
  });

  facilities.addEventListener("click", async function () {
    facilitiesInfo = [];
    tbody.innerHTML = ""; // Clear the table body
    contentContainer.removeChild(appContainer);
    contentContainer.appendChild(facilitiesContainer);

    const sf = getObjectArrayFromLocalStorage();

    // Use a for...of loop to ensure each getFacilities call waits before proceeding
    for (const facility of sf) {
      await getFacilities(facility); // Wait for each facility to finish
    }

    // Now proceed to the second loop after all getFacilities calls are finished
    for (const facility of facilitiesInfo) {
      const row = document.createElement("tr");
      headers.forEach((header) => {
        const td = document.createElement("td");
        switch (header) {
          case "Id":
            td.textContent = facility.id;
            break;
          case "Name":
            td.textContent = facility.name;
            break;
          case "Property Number":
            td.textContent = facility.propertyNumber;
            break;
          case "Actions":
            const selectButton = document.createElement("button");
            selectButton.textContent = "Select";
            selectButton.classList.add("select-btn");
            selectButton.onclick = async function () {
              console.log(facility);
              onWebLoad();
              localStorage.setItem("property_id", facility.id);
              localStorage.setItem("username", facility.api);
              localStorage.setItem("password", facility.apiSecret);
              localStorage.setItem("client_id", facility.clientId);
              localStorage.setItem("secret_id", facility.clientSecret);
              localStorage.setItem("environment", facility.environment || "");
              localStorage.setItem("bearer", facility.bearer);
            };
            td.appendChild(selectButton);
            break;
          default:
            td.textContent = "";
            break;
        }
        row.appendChild(td);
      });

      // Append the row to the tbody
      tbody.appendChild(row);
    }

    facilitiesTable.appendChild(tbody);
    facilitiesTable.appendChild(thead);
    facilitiesContainer.appendChild(facilitiesTable);
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

  popupContainer.appendChild(menuContainer);
  popupContainer.appendChild(contentContainer);
  popupContainer.appendChild(closeButton);
  document.body.appendChild(popupContainer);
});

// Function to get the array of objects from localStorage or return an empty array if not present
function getObjectArrayFromLocalStorage() {
  let array = localStorage.getItem("savedFacilities");
  return array ? JSON.parse(array) : [];
}

// Function to save the array of objects back to localStorage
function saveObjectArrayToLocalStorage(array) {
  localStorage.setItem("savedFacilities", JSON.stringify(array));
}

function deleteFacility(index) {
  let savedFacilities = getObjectArrayFromLocalStorage();
  savedFacilities.splice(index, 1);
  saveObjectArrayToLocalStorage(savedFacilities);
  alert("Facility deleted successfully");
  window.location.reload();
}

function addFacilityToSavedList(facility, index, list) {
  const sfContainer = document.createElement("div");
  sfContainer.classList.add("sfContainer");

  const apiLabel = document.createElement("h3");
  apiLabel.textContent = "API";
  const apiSecretLabel = document.createElement("h3");
  apiSecretLabel.textContent = "API Secret";
  const clientLabel = document.createElement("h3");
  clientLabel.textContent = "Client";
  const clientSecretLabel = document.createElement("h3");
  clientSecretLabel.textContent = "Client Secret";
  const envLabel = document.createElement("h3");
  envLabel.textContent = "Environment";

  const api = document.createElement("p");
  api.textContent = facility.username;
  const apiSecret = document.createElement("p");
  apiSecret.textContent = facility.password;
  const client = document.createElement("p");
  client.textContent = facility.client_id;
  const clientSecret = document.createElement("p");
  clientSecret.textContent = facility.secret_id;
  const env = document.createElement("p");
  env.textContent = facility.environment;
  // Create a delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "X";
  deleteButton.classList.add("saved-delete-button");
  sfContainer.appendChild(deleteButton);

  deleteButton.addEventListener("click", () => {
    deleteFacility(index);
  });

  sfContainer.appendChild(apiLabel);
  sfContainer.appendChild(api);
  sfContainer.appendChild(apiSecretLabel);
  sfContainer.appendChild(apiSecret);
  sfContainer.appendChild(clientLabel);
  sfContainer.appendChild(client);
  sfContainer.appendChild(clientSecretLabel);
  sfContainer.appendChild(clientSecret);
  sfContainer.appendChild(envLabel);
  sfContainer.appendChild(env);

  list.appendChild(sfContainer);
}

/*----------------------------------------------------------------
                        On window load
----------------------------------------------------------------*/
async function onWebLoadToken() {
  const savedFacilities = getObjectArrayFromLocalStorage();
  for (const facility of savedFacilities) {
    const sfBearerToken = await createBearer(
      facility.username,
      facility.password,
      facility.client_id,
      facility.secret_id,
      facility.environment
    );
    facility.bearer = sfBearerToken;
  }
  saveObjectArrayToLocalStorage(savedFacilities);
}

onWebLoadToken();
