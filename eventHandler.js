// On reload hide errors
hideError();

/*----------------------------------------------------------------
                        Variable Declarations
----------------------------------------------------------------*/
const propertyID = localStorage.getItem("property_id"); // Retrieves the property ID from localStorage
const username = localStorage.getItem("username"); // Retrieves the username from localStorage
const password = localStorage.getItem("password"); // Retrieves the password from localStorage
const clientID = localStorage.getItem("client_id"); // Retrieves the client ID from localStorage
const secretID = localStorage.getItem("secret_id"); // Retrieves the secret ID from localStorage
var envKey = localStorage.getItem("environment"); // Retrieves the environment key from localStorage
const stageKey = localStorage.getItem("stageKey"); // Retrieves the stage key from localStorage
// console.log(propertyID, username, password, clientID, secretID, envKey, stageKey);
let bearerToken; // Holds the bearer token for authentication
let jsonData; // Holds JSON data fetched from APIs
let currentTime; // Holds the current time in milliseconds
let expirationTime; // Holds the expiration time of the bearer token
let timeUntilExpiration; // Holds the time until the bearer token expires
let unitImportError = []; // Holds import errors for units
let unitImportSuccess = []; // Holds import successes for units
let noFillMoveIn = false; // No fill Move In Response Tracker
opened = false; // Variable to track if popup is opened
const errorText = document.getElementById("errText");
var accessProfiles;
var timeProfiles;

// Check if staging is enabled, if so disable envKey
if (stageKey !== "") {
  envKey = "";
}

if (
  propertyID === null ||
  username === null ||
  password === null ||
  clientID === null ||
  secretID === null
) {
  bearerButton.classList.add("pulsate");
}

/*----------------------------------------------------------------
                        Function Declarations
----------------------------------------------------------------*/
// Function to get facility time profiles
async function getTimeProfiles() {
  try {
    const response = await fetch(
      `https://accesscontrol.insomniaccia-dev.com/facilities/1037/timegroups`,
      {
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + bearerToken.access_token, // Ensure this token is correct
          "api-version": "2.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Data is not an array");
    }
    timeProfiles = data;
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// Function to get facility access profiles
async function getAccessProfiles() {
  try {
    const response = await fetch(
      `https://accesscontrol.insomniaccia-dev.com/facilities/1037/accessprofiles`,
      {
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + bearerToken.access_token, // Ensure this token is correct
          "api-version": "2.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Data is not an array");
    }
    accessProfiles = data;
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// Function to create a bearer token for authentication
async function createBearer(user, pass, id, secret) {
  currentTime = Date.now();
  fetch(`https://auth.${stageKey}insomniaccia${envKey}.com/auth/token`, {
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
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Bearer network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      bearerToken = data;
      expirationTime = currentTime + data.expires_in * 1000;
    })
    .catch((error) => {
      console.error(
        "There was a problem with the bearer fetch operation:",
        error
      );
      showError(error);
    });
  displayLoadDateTime();
}

// Function to fetch facility data
async function getFacility() {
  fetch(
    `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}`,
    {
      headers: {
        accept: "application/json",
        Authorization: "Bearer " + bearerToken.access_token,
        "api-version": "2.0",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      var name = data;
      var facilityElement = document.getElementById("facilityName");
      facilityElement.textContent = name.name;
      if (facilityElement.href !== "#") {
        facilityElement.target = "_blank";
      }
      facilityElement.href = `https://portal.${stageKey}insomniaccia${envKey}.com/facility/${propertyID}/dashboard`;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

// Function to show error fetching data
function showError(err) {
  const errText = document.getElementById("errText");
  //Check to see if error is already displayed
  if (errText.classList.contains("visible")) {
    console.log("Error already displayed");
    return;
  }
  // Check to see if error is defined or not
  if (err === undefined) {
    errText.textContent = "Error: Unable to fetch data";
  } else {
    errText.textContent = err;
  }
  console.log(err);
  errText.classList.remove("hidden");
  errText.classList.add("visible");
  bearerButton.classList.add("pulsate");
  hideLoadingSpinner();
}

// Function to hide error fetching data
function hideError() {
  var errText = document.getElementById("errText");
  errText.classList.remove("visible");
  errText.classList.add("hidden");
}

// Function to fetch unit list
async function unitList(num) {
  // console.log(bearerToken.access_token);
  fetch(
    `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${num}/units`,
    {
      headers: {
        Authorization: "Bearer " + (await bearerToken.access_token),
        accept: "application/json",
        "api-version": "2.0",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      jsonData = data;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

// Function to display unit data in a table
async function displayData() {
  var tableBody = document.querySelector("#jsonTable tbody");
  var response = null;
  if (jsonData === undefined) {
    showError();
  }
  async function handleAction(row, action) {
    switch (action) {
      case "Turn Delinquent":
        response = await addDelinquent(row.cells[0].textContent);
        if (response) {
          row.cells[2].textContent = "Delinquent";
          row.deleteCell(8);
          updateButtons(row, "Delinquent");
          countTableRowsByStatus();
          hideLoadingSpinner();
        } else {
          console.error("Network request failed:", response.statusText);
          hideLoadingSpinner();
        }
        break;
      case "Turn Rented":
        response = await removeDelinquent(row.cells[0].textContent);
        if (response) {
          row.cells[2].textContent = "Rented";
          row.deleteCell(8);
          updateButtons(row, "Rented");
          countTableRowsByStatus();
          hideLoadingSpinner();
        } else {
          console.error("Network request failed:", response.statusText);
          hideLoadingSpinner();
        }
        break;
      case "Move Out":
        response = await removeVisitor(row.cells[0].textContent);
        if (response) {
          row.cells[2].textContent = "Vacant";
          row.deleteCell(8);
          updateButtons(row, "Vacant");
          countTableRowsByStatus();
          hideLoadingSpinner();
        } else {
          console.error("Network request failed:", response.statusText);
          hideLoadingSpinner();
        }
        break;
      case "Move In":
        const toggle = localStorage.getItem("autofillMode");
        if (toggle !== "enabled") {
          response = await addVisitorNoFill(row.cells[0].textContent);
          if (response === "Sent") {
            row.cells[2].textContent = "Rented";
            row.deleteCell(8);
            updateButtons(row, "Rented");
            countTableRowsByStatus();
            hideLoadingSpinner();
          } else {
            hideLoadingSpinner();
            console.error("Network request failed:", response);
          }
        } else {
          response = await addVisitor(row.cells[0].textContent);
          if (response) {
            row.cells[2].textContent = "Rented";
            row.deleteCell(8);
            updateButtons(row, "Rented");
            countTableRowsByStatus();
            hideLoadingSpinner();
          } else {
            hideLoadingSpinner();
            console.error("Network request failed:", response);
          }
        }
        break;
      case "Delete":
        response = await removeUnit(row.cells[0].textContent);
        if (response) {
          row.parentNode.removeChild(row);
          countTableRowsByStatus();
          hideLoadingSpinner();
        } else {
          console.error("Network request failed:", response.statusText);
          hideLoadingSpinner();
        }
        break;
      default:
        // No action for other statuses
        break;
    }
  }
  var buttons = [];
  function updateButtons(row, status) {
    buttons = [];
    switch (status) {
      case "Rented":
        buttons.push("Turn Delinquent");
        buttons.push("Move Out");
        break;
      case "Delinquent":
        buttons.push("Turn Rented");
        buttons.push("Move Out");
        break;
      case "Vacant":
        buttons.push("Move In");
        buttons.push("Delete");
        break;
      default:
        buttons.push("This is broken");
        break;
    }
    var buttonCell = row.insertCell();
    buttons.forEach(function (buttonText) {
      var updateButton = document.createElement("button");
      updateButton.textContent = buttonText;
      updateButton.className = "update-button";
      updateButton.addEventListener("click", function () {
        handleAction(row, buttonText);
      });
      buttonCell.appendChild(updateButton);
      if (updateButton.textContent.trim() === "Delete") {
        updateButton.classList.add("delete-button");
      }
      if (updateButton.textContent.trim() === "Move Out") {
        updateButton.classList.add("out-button");
      }
      if (updateButton.textContent.trim() === "Turn Delinquent") {
        updateButton.classList.add("addDelinquent-button");
      }
    });
  }
  jsonData.forEach(function (item) {
    var row = tableBody.insertRow();
    var idCell = row.insertCell();
    idCell.textContent = item.id;
    idCell.classList.add("idCell");
    row.insertCell().textContent = item.unitNumber;
    var unitNumber = item.unitNumber;
    row.insertCell().textContent = item.status;
    var facilityIdCell = row.insertCell();
    var propertyNumberCell = row.insertCell();
    facilityIdCell.textContent = item.facilityId;
    propertyNumberCell.textContent = item.propertyNumber;
    facilityIdCell.classList.add("hide-column");
    propertyNumberCell.classList.add("hide-column");
    var prop1Cell = row.insertCell();
    var prop2Cell = row.insertCell();
    var prop3Cell = row.insertCell();
    prop1Cell.classList.add("hide-column");
    prop2Cell.classList.add("hide-column");
    prop3Cell.classList.add("hide-column");
    prop1Cell.textContent = item.extendedData.additionalProp1;
    prop2Cell.textContent = item.extendedData.additionalProp2;
    prop3Cell.textContent = item.extendedData.additionalProp3;
    idCell.addEventListener("click", function () {
      getVisitor(unitNumber);
    });
    var buttonCell = row.insertCell();
    buttons = [];
    switch (item.status) {
      case "Rented":
        buttons.push("Turn Delinquent");
        buttons.push("Move Out");
        break;
      case "Delinquent":
        buttons.push("Turn Rented");
        buttons.push("Move Out");
        break;
      case "Vacant":
        buttons.push("Move In");
        buttons.push("Delete");
        break;
      default:
        buttons.push("This is broken");
        break;
    }
    buttons.forEach(function (buttonText) {
      var updateButton = document.createElement("button");
      updateButton.textContent = buttonText;
      updateButton.className = "update-button";
      updateButton.addEventListener("click", function () {
        handleAction(row, buttonText);
      });
      buttonCell.appendChild(updateButton);
      if (updateButton.textContent.trim() === "Delete") {
        updateButton.classList.add("delete-button");
      }
      if (updateButton.textContent.trim() === "Move Out") {
        updateButton.classList.add("out-button");
      }
      if (updateButton.textContent.trim() === "Turn Delinquent") {
        updateButton.classList.add("addDelinquent-button");
      }
    });
  });
}

// Function to add a unit
async function addUnit(unit) {
  try {
    const response = await fetch(
      `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/units`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-version": "2.0",
          Authorization: "Bearer " + bearerToken.access_token,
          "Content-Type": "application/json-patch+json",
        },
        body: JSON.stringify({
          unitNumber: unit,
          extendedData: {
            additionalProp1: null,
            additionalProp2: null,
            additionalProp3: null,
          },
          suppressCommands: true,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      return true;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return false;
  }
}

// Function to remove a unit
async function removeUnit(unit) {
  showLoadingSpinner();
  try {
    const response = await fetch(
      `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/units/${unit}/delete/vacant?suppressCommands=true`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-version": "2.0",
          Authorization: "Bearer " + bearerToken.access_token,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "",
      }
    );
    if (response.ok) {
      hideLoadingSpinner();
      return true;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    alert("Failed to delete unit...");
    hideLoadingSpinner();
    return false;
  }
}

// Function to generate a random access code for the addVisitor function
function generateRandomCode(length) {
  let max = Math.pow(10, length) - 1;
  let randNum = Math.floor(Math.random() * (max + 1));
  let randCode = randNum.toString().padStart(length, "0");
  return randCode;
}

// Function to add a visitor
async function addVisitor(unit) {
  showLoadingSpinner();
  try {
    const response = await fetch(
      `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/visitors`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-version": "2.0",
          Authorization: "Bearer " + bearerToken.access_token,
          "Content-Type": "application/json-patch+json",
        },
        body: JSON.stringify({
          timeGroupId: 0,
          accessProfileId: 0,
          unitId: unit,
          accessCode: generateRandomCode(4),
          lastName: "Tenant",
          firstName: "Temporary",
          email: "automations@temp.com",
          mobilePhoneNumber: generateRandomCode(10),
          isTenant: true,
          extendedData: {
            additionalProp1: null,
            additionalProp2: null,
            additionalProp3: null,
          },
          suppressCommands: true,
        }),
      }
    );
    if (response.ok) {
      hideLoadingSpinner();
      return true;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    alert("Failed to create tenant...");
    hideLoadingSpinner();
    return false;
  }
}
async function addVisitorNoFill(unit) {
  opened = true;
  disableButtons();
  showLoadingSpinner();
  return new Promise((resolve, reject) => {
    document.body.style.overflow = "hidden";
    const popupContainer = document.createElement("div");
    popupContainer.classList.add("popup-container");
    const labels = [
      "FirstName",
      "LastName",
      "Email",
      "Mobile Phone Number",
      "Code",
      "Access Profile",
      "Time Profile",
    ];
    const inputs = [];
    labels.forEach((labelText) => {
      const label = document.createElement("label");
      label.textContent = labelText + ":";
      let input;

      if (labelText === "Access Profile") {
        // Create a dropdown for Access Profile
        input = document.createElement("select");
        accessProfiles.forEach((profile) => {
          const option = document.createElement("option");
          option.value = profile.id;
          option.textContent = profile.name;
          input.appendChild(option);
        });
      } else if (labelText === "Time Profile") {
        // Create a dropdown for Time Profile
        input = document.createElement("select");
        timeProfiles.forEach((profile) => {
          const option = document.createElement("option");
          option.value = profile.id;
          option.textContent = profile.name;
          input.appendChild(option);
        });
      } else {
        // Create text inputs for other fields
        input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute(
          "placeholder",
          "Enter " +
            labelText.charAt(0).toLowerCase() +
            labelText.slice(1).replace(/\s+/g, "")
        );
      }
      const wrapper = document.createElement("div");
      wrapper.classList.add("input-wrapper");
      wrapper.appendChild(label);
      wrapper.appendChild(input);
      inputs.push(input);
      popupContainer.appendChild(wrapper);
    });
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.classList.add("submit-button");
    submitButton.addEventListener("click", async function () {
      let isEmpty = false;
      inputs.forEach((input) => {
        if (input.value === "") {
          isEmpty = true;
          return;
        }
      });
      if (isEmpty) {
        alert("Please enter a value!");
        return;
      }
      sendAddVisitorNoFill(
        inputs[0].value,
        inputs[1].value,
        inputs[2].value,
        inputs[3].value,
        inputs[4].value,
        inputs[5].value,
        inputs[6].value,
        unit
      );
      document.body.removeChild(popupContainer);
      opened = false;
      enableButtons();
      document.body.style.overflow = "";
    });
    // Create close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.classList.add("close-button");
    closeButton.addEventListener("click", function () {
      opened = false;
      enableButtons();
      document.body.removeChild(popupContainer);
      document.body.style.overflow = "";
      resolve("Closed");
    });
    // Append elements to popup container
    popupContainer.appendChild(closeButton);
    popupContainer.appendChild(submitButton);
    document.body.appendChild(popupContainer);
    async function sendAddVisitorNoFill(
      fname,
      lname,
      email,
      phone,
      code,
      access,
      time,
      unit
    ) {
      try {
        const response = await fetch(
          `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/visitors`,
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "api-version": "2.0",
              Authorization: "Bearer " + bearerToken.access_token,
              "Content-Type": "application/json-patch+json",
            },
            body: JSON.stringify({
              timeGroupId: time,
              accessProfileId: access,
              unitId: unit,
              accessCode: code,
              lastName: lname,
              firstName: fname,
              email: email,
              mobilePhoneNumber: phone,
              isTenant: true,
              extendedData: {
                additionalProp1: null,
                additionalProp2: null,
                additionalProp3: null,
              },
              suppressCommands: true,
            }),
          }
        );
        if (response.ok) {
          resolve("Sent");
          hideLoadingSpinner();
          return true;
        } else {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        resolve("Closed");
        alert("Failed to create tenant...");
        hideLoadingSpinner();
        return false;
      }
    }
  });
}
// Function to remove a visitor
async function removeVisitor(unit) {
  showLoadingSpinner();
  try {
    const response = await fetch(
      `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/units/${unit}/vacate?suppressCommands=true`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-version": "2.0",
          Authorization: "Bearer " + bearerToken.access_token,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "",
      }
    );
    if (response.ok) {
      hideLoadingSpinner();
      return true;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    alert("Failed to remove tenant...");
    hideLoadingSpinner();
    return false;
  }
}

// Function to mark a unit as delinquent
async function addDelinquent(unit) {
  showLoadingSpinner();
  try {
    const response = await fetch(
      `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/units/${unit}/disable?suppressCommands=true`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-version": "2.0",
          Authorization: "Bearer " + bearerToken.access_token,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "",
      }
    );
    if (response.ok) {
      hideLoadingSpinner();
      return true;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    alert("Failed to make tenant delinquent...");
    hideLoadingSpinner();
    return false;
  }
}

// Function to mark a delinquent unit as active
async function removeDelinquent(unit) {
  showLoadingSpinner();
  try {
    const response = await fetch(
      `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/units/${unit}/enable?suppressCommands=true`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-version": "2.0",
          Authorization: "Bearer " + bearerToken.access_token,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "",
      }
    );
    if (response.ok) {
      hideLoadingSpinner();
      return true;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    alert("Failed to remove delinquency from tenant");
    hideLoadingSpinner();
    return false;
  }
}

// Event listener for adding a unit
document.getElementById("unitButton").addEventListener(
  "click",
  async function () {
    unitImportError = [];
    unitImportSuccess = [];
    var userInput = prompt("Unit Number(s):", "");
    if (userInput === null) {
      return false;
    }
    unitArray = userInput.split(/\s+/);

    showLoadingSpinner();
    for (let i = 0; i < unitArray.length; i++) {
      const unit = unitArray[i];
      if (unit.length > 9) {
        unitImportError.push(unit);
      } else {
        const success = await addUnit(unit);
        if (success) {
          unitImportSuccess.push(unit);
        } else {
          unitImportError.push(unit);
        }
      }
    }

    if (unitImportError.length !== 0) {
      alert("Unable to import units: " + unitImportError);
    }
    if (unitImportSuccess.length !== 0) {
      alert("Imported units: " + unitImportSuccess);
      refreshTable();
    }
    hideLoadingSpinner();
  },
  false
);

// Function to format date and time
function formatDate(date) {
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  };
  return date.toLocaleDateString(undefined, options);
}

// Function to display the page load date and time
function displayLoadDateTime() {
  var loadDateTimeElement = document.getElementById("loadDateTime");
  var loadDateTime = new Date();
  loadDateTimeElement.textContent = "Last Refresh: " + formatDate(loadDateTime);
}

// Function to sort the table
async function sortTable(columnIndex) {
  showLoadingSpinner();

  return new Promise((resolve, reject) => {
    var table,
      rows,
      switching,
      i,
      x,
      y,
      shouldSwitch,
      dir,
      switchcount = 0;
    table = document.getElementById("jsonTable");
    switching = true;
    dir = "asc";
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < rows.length - 1; i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[columnIndex];
        y = rows[i + 1].getElementsByTagName("TD")[columnIndex];
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount++;
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
    resolve();
  }).then(() => {
    hideLoadingSpinner();
    // Reset to the first page after sorting
    currentPage = 1;
    displayRows();
  });
}

// Function to disable all buttons
function disableButtons() {
  var buttons = document.getElementsByTagName("button");
  var checkboxes = document.querySelectorAll("input[type='checkbox']");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }
  for (var j = 0; j < checkboxes.length; j++) {
    checkboxes[j].disabled = true;
  }
}

// Function to enable all buttons
function enableButtons() {
  var buttons = document.getElementsByTagName("button");
  var checkboxes = document.querySelectorAll("input[type='checkbox']");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = false;
  }
  for (var j = 0; j < checkboxes.length; j++) {
    checkboxes[j].disabled = false;
  }
}

// Function to refresh the json table
async function refreshTable() {
  showLoadingSpinner();
  hideError();
  var table = document.getElementById("jsonTable");
  for (var i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
  setTimeout(() => {
    unitList(propertyID);
  }, 500);
  setTimeout(() => {
    displayData();
    getFacility();
    hideLoadingSpinner();
  }, 1000);
  setTimeout(() => {
    sortTable(1);
  }, 1005);
  setTimeout(() => {
    displayLoadDateTime();
    countTableRowsByStatus();
    displayRows();
  }, 1005);
}

// Function to show loading spinner
function showLoadingSpinner() {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("hidden");
  spinner.classList.add("visible");
}

// Function to hide loading spinner
function hideLoadingSpinner() {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("visible");
  spinner.classList.add("hidden");
}

// On webpage load function
async function onWebLoad() {
  // Show loading spinner
  showLoadingSpinner();

  // Create bearer token
  await createBearer(username, password, clientID, secretID);

  // Get unit data
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await unitList(propertyID);

  // Get the facility name and display it
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await getFacility();

  // Display the unit table
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await displayData();
  await getAccessProfiles();
  await getTimeProfiles();
  countTableRowsByStatus();

  // Hide loading spinner
  hideLoadingSpinner();

  // Sort the table
  sortTable(1);

  // Show load date
  displayLoadDateTime();
  displayRows();
}

/*----------------------------------------------------------------
                        On window load
----------------------------------------------------------------*/
onWebLoad();

//reload the page every 30 minutes in order to refresh the bearer token and validate data
setTimeout(() => {
  location.reload();
}, 1800000);

function countTableRowsByStatus() {
  var table = document.getElementById("jsonTable");
  const rented = document.getElementById("rented");
  const delinquent = document.getElementById("delinquent");
  const vacant = document.getElementById("vacant");
  const total = document.getElementById("total");
  var rentedCount = 0;
  var delinquentCount = 0;
  var vacantCount = 0;

  for (var i = 1; i < table.rows.length; i++) {
    var statusCell = table.rows[i].getElementsByTagName("TD")[2];
    var status = statusCell.textContent.trim().toLowerCase(); // Assuming the status is stored in a <td> element

    if (status === "rented") {
      rentedCount++;
    } else if (status === "delinquent") {
      delinquentCount++;
    } else if (status === "vacant") {
      vacantCount++;
    }
  }
  rented.textContent = rentedCount;
  delinquent.textContent = delinquentCount;
  vacant.textContent = vacantCount;
  total.textContent = vacantCount + delinquentCount + rentedCount;
  // console.log("Rented: " + rentedCount);
  // console.log("Delinquent: " + delinquentCount);
  // console.log("Vacant: " + vacantCount);
}
async function getVisitor(unit) {
  try {
    const response = await fetch(
      `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/visitors?unitNumber=${unit}`,
      {
        headers: {
          Authorization: "Bearer " + (await bearerToken.access_token),
          accept: "application/json",
          "api-version": "2.0",
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.length == 0) {
        alert("This unit does not contain a tenant record...");
      }
      updateVisitor(data);
      return true;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return false;
  }
}
async function sendUpdateVisitor(
  fname,
  lname,
  email,
  phone,
  code,
  access,
  time,
  visitorID
) {
  try {
    const response = await fetch(
      `https://accesscontrol.${stageKey}insomniaccia${envKey}.com/facilities/${propertyID}/visitors/${visitorID}/update`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (await bearerToken.access_token),
          accept: "application/json",
          "api-version": "2.0",
          "Content-Type": "application/json-patch+json",
        },
        body: `{\n  "timeGroupId": "${time}",\n  "accessProfileId": "${access}",\n  "accessCode": "${code}",\n  "lastName": "${lname}",\n  "firstName": "${fname}",\n  "email": "${email}",\n  "mobilePhoneNumber": "${phone}",\n  "suppressCommands": true\n}`,
      }
    );
    if (response.ok) {
      console.log(response);
      const data = await response.json();
      console.log(data);
      return true;
    } else {
      console.log(response);
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    alert("Failed to update tenant...");
    return false;
  }
}

async function updateVisitor(info) {
  if (opened) return;
  console.log(info);
  const nameParts = info[0].name.split(" ");
  document.body.style.overflow = "hidden";
  const popupContainer = document.createElement("div");
  popupContainer.classList.add("popup-container");
  disableButtons();
  opened = true;
  const labels = [
    "FirstName",
    "LastName",
    "Email",
    "Mobile Phone Number",
    "Code",
    "Access Profile",
    "Time Profile",
  ];
  const inputs = [];
  labels.forEach((labelText) => {
    const label = document.createElement("label");
    label.textContent = labelText + ":";
    let input;

    // Create dropdowns for "Access Profile" and "Time Profile"
    if (labelText === "Access Profile") {
      input = document.createElement("select");
      accessProfiles.forEach((profile) => {
        const option = document.createElement("option");
        option.value = profile.id;
        option.textContent = profile.name;
        if (profile.id === info[0].accessProfileId) {
          option.selected = true;
        }
        input.appendChild(option);
      });
    } else if (labelText === "Time Profile") {
      input = document.createElement("select");
      timeProfiles.forEach((profile) => {
        const option = document.createElement("option");
        option.value = profile.id;
        option.textContent = profile.name;
        if (profile.id === info[0].timeGroupId) {
          option.selected = true;
        }
        input.appendChild(option);
      });
    } else {
      input = document.createElement("input");
      input.setAttribute("type", "text");
      const storedKey = labelText.replace(/\s+/g, "");
      let storedValue =
        info[0][
          labelText.charAt(0).toLowerCase() +
            labelText.slice(1).replace(/\s+/g, "")
        ];
      if (labelText === "FirstName") {
        storedValue = nameParts[0];
      }
      if (labelText === "LastName") {
        storedValue = nameParts[1];
      }
      input.setAttribute(
        "placeholder",
        storedValue ||
          "Enter " +
            labelText.charAt(0).toLowerCase() +
            labelText.slice(1).replace(/\s+/g, "")
      );
      input.value = storedValue || "";
    }
    const wrapper = document.createElement("div");
    wrapper.classList.add("input-wrapper");
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    inputs.push(input);
    popupContainer.appendChild(wrapper);
  });
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.classList.add("submit-button");
  submitButton.addEventListener("click", function () {
    const updatedInfo = {
      firstName: inputs[0].value || nameParts[0],
      lastName: inputs[1].value || nameParts[1],
      email: inputs[2].value || info[0].email,
      mobilePhoneNumber: inputs[3].value || info[0].mobilePhoneNumber,
      code: inputs[4].value || info[0].code,
      accessProfileId: inputs[5].value || info[0].accessProfileId,
      timeGroupId: inputs[6].value || info[0].timeGroupId,
    };
    let isEmpty = false;
    inputs.forEach((input) => {
      if (input.value === "") {
        isEmpty = true;
        return;
      }
    });
    if (isEmpty) {
      alert("Please enter a value!");
      return;
    }
    sendUpdateVisitor(
      updatedInfo.firstName,
      updatedInfo.lastName,
      updatedInfo.email,
      updatedInfo.mobilePhoneNumber,
      updatedInfo.code,
      updatedInfo.accessProfileId,
      updatedInfo.timeGroupId,
      info[0].id
    );
    document.body.removeChild(popupContainer);
    opened = false;
    enableButtons();
    document.body.style.overflow = "";
  });
  // Create close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.classList.add("close-button");
  closeButton.addEventListener("click", function () {
    opened = false;
    enableButtons();
    document.body.removeChild(popupContainer);
    document.body.style.overflow = "";
  });
  // Append elements to popup container
  popupContainer.appendChild(closeButton);
  popupContainer.appendChild(submitButton);
  document.body.appendChild(popupContainer);
}
//
//
// DarkMode
//
//
let darkMode = localStorage.getItem("darkMode");
const darkModeToggle = document.querySelector("#darkModeToggle");
const enableDarkMode = () => {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkMode", "enabled");
};
const disableDarkMode = () => {
  document.body.classList.remove("darkmode");
  localStorage.setItem("darkMode", null);
};
darkModeToggle.checked = darkMode === "enabled";
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
//
//
// Tenant Information Autofill Toggle
//
//
let autofillMode = localStorage.getItem("autofillMode");
const autofillToggle = document.querySelector("#autofillCheckbox");
const enableAutofillMode = () => {
  localStorage.setItem("autofillMode", "enabled");
};
const disableAutofillMode = () => {
  localStorage.setItem("autofillMode", null);
};
autofillToggle.checked = autofillMode === "enabled";
autofillToggle.addEventListener("change", () => {
  checkAutofillMode();
});
function checkAutofillMode() {
  if (autofillToggle.checked) {
    enableAutofillMode();
  } else {
    disableAutofillMode();
  }
}
//
//
// Pagination
//
//
let currentPage = 1;
let totalPages = 1;

function displayRows() {
  const rowsPerPage = 50;
  const table = document.getElementById("jsonTable");
  const rows = table
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  totalPages = Math.ceil(rows.length / rowsPerPage);
  for (let i = 0; i < rows.length; i++) {
    rows[i].style.display = "none"; // Hide all rows initially
  }
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  for (let i = start; i < end && i < rows.length; i++) {
    rows[i].style.display = ""; // Show only the rows for the current page
  }
  document.getElementById(
    "pageIndicator"
  ).innerText = `${currentPage} of ${totalPages}`;
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    displayRows();
  }
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayRows();
  }
}
