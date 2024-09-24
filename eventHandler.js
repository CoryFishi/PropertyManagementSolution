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
let bearerToken; // Holds the bearer token for authentication

// console.log(
//   propertyID,
//   username,
//   password,
//   clientID,
//   secretID,
//   envKey,
//   bearerToken
// );
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

if (
  propertyID === null ||
  username === null ||
  password === null ||
  clientID === null ||
  secretID === null
) {
  authButton.classList.add("pulsate");
}

/*----------------------------------------------------------------
                        Function Declarations
----------------------------------------------------------------*/

// Remove Guest Visitor
async function removeGuestVisitor(visitor) {
  showLoadingSpinner();
  try {
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/visitors/${visitor}/remove?suppressCommands=false`,
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

// Get Visitor
async function getVisitor(visitor) {
  return new Promise(async (resolve, reject) => {
    try {
      var tokenStageKey = "";
      var tokenEnvKey = "";
      if (envKey === "cia-stg-1.aws.") {
        tokenStageKey = "cia-stg-1.aws.";
      } else {
        tokenEnvKey = envKey;
      }
      const response = await fetch(
        `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/visitors/${visitor}`,
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
        const returnData = await updateVisitor(data);
        resolve(returnData);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return false;
    }
  });
}

// Visitor Dashboard
async function visitorDashboard(unit) {
  let guestAutofillMode = localStorage.getItem("guestAutofillMode");
  var visitors = await getAllVisitors(unit);
  if (visitors.length == 0) {
    alert("This unit does not contain a tenant record...");
    return;
  }

  const popupContainer = document.createElement("div");
  popupContainer.classList.add("visitors-popup-container");

  const visitorsTopContainer = document.createElement("div");
  visitorsTopContainer.classList.add("visitors-top-container");

  const visitorsToal = document.createElement("h3");
  visitorsToal.innerText = `${visitors.length} Visitors`;

  const rightContainer = document.createElement("div");
  rightContainer.classList.add("righty");

  const autoFillContainer = document.createElement("div");
  autoFillContainer.innerHTML = `
          <label for="autofillCheckboxModal" class="checkbox-label"
            >Visitor Autofill:</label
          >
          <div>
            <label class="switch">
              <input type="checkbox" id="autofillCheckboxModal" />
              <span class="slider"></span>
            </label>
          </div>
        `;
  autoFillContainer.classList.add("checkbox-container");

  const addVisitor = document.createElement("button");
  addVisitor.innerText = `Add Visitor`;

  addVisitor.onclick = async function () {
    checkGuestAutofillMode();
    const guest = await createGuestVisitor(
      unit,
      localStorage.getItem("guestAutofillMode")
    ); // Get the new guest

    visitors.push(guest); // Add the new guest to the visitors array

    if (guest) {
      // Create a new row for the newly added guest and append it to the tbody
      const newRow = document.createElement("tr");

      headers.forEach((header) => {
        const td = document.createElement("td");
        switch (header) {
          case "Visitor Id":
            td.textContent = guest.id;
            break;
          case "Unit Number":
            td.textContent = guest.unitNumber;
            break;
          case "Visitor Name":
            td.textContent = guest.name;
            break;
          case "isTenant":
            td.textContent = guest.isTenant ? "True" : "False";
            break;
          case "Time Group":
            td.textContent = guest.timeGroupName;
            break;
          case "Access Profile":
            td.textContent = guest.accessProfileName;
            break;
          case "Gate Code":
            td.textContent = guest.code;
            break;
          case "Email Address":
            td.textContent = guest.email;
            break;
          case "Phone Number":
            td.textContent = guest.mobilePhoneNumber;
            break;
          case "Actions":
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.classList.add("edit-btn");
            editButton.onclick = function () {
              const visitorInfo = getVisitor(guest.id);
              const cells = newRow.querySelectorAll("td");
              cells[0].textContent = visitorInfo.id;
              cells[1].textContent = visitorInfo.unitNumber;
              cells[2].textContent = visitorInfo.name;
              cells[3].textContent = visitorInfo.isTenant ? "True" : "False";
              cells[4].textContent = visitorInfo.timeGroupName;
              cells[5].textContent = visitorInfo.accessProfileName;
              cells[6].textContent = visitorInfo.code;
              cells[7].textContent = visitorInfo.email;
              cells[8].textContent = visitorInfo.mobilePhoneNumber;
              const index = visitors.findIndex(
                (visitor) => visitor.id === guest.id
              );
              visitors[index] = visitorInfo;
            };
            td.appendChild(editButton);

            if (!guest.isTenant) {
              const deleteButton = document.createElement("button");
              deleteButton.textContent = "Delete";
              deleteButton.classList.add("delete-btn");
              deleteButton.onclick = async function () {
                const response = await removeGuestVisitor(guest.id);
                if (response === true) {
                  newRow.remove(); // Remove the row on successful deletion
                } else {
                  console.error("Network request failed:", response.statusText);
                }
              };
              td.appendChild(deleteButton);
            }
            break;
          default:
            td.textContent = "";
            break;
        }
        newRow.appendChild(td);
      });

      tbody.appendChild(newRow);
    }

    hideLoadingSpinner();
  };

  rightContainer.appendChild(autoFillContainer);
  rightContainer.appendChild(addVisitor);

  visitorsTopContainer.appendChild(visitorsToal);
  visitorsTopContainer.appendChild(rightContainer);

  popupContainer.appendChild(visitorsTopContainer);

  const tableContainer = document.createElement("div");
  tableContainer.classList.add("table-container");

  const visitorsTable = document.createElement("table");
  visitorsTable.className = "visitors-table";

  const headers = [
    "Visitor Id",
    "Unit Number",
    "Visitor Name",
    "isTenant",
    "Time Group",
    "Access Profile",
    "Gate Code",
    "Email Address",
    "Phone Number",
    "Actions",
  ];
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");
  // Loop through each event in events
  visitors.forEach((visitor) => {
    const row = document.createElement("tr");
    const id = visitor.id;
    // Create a cell for each header and populate it with the corresponding data
    headers.forEach((header) => {
      const td = document.createElement("td");
      switch (header) {
        case "Visitor Id":
          td.textContent = visitor.id;
          break;
        case "Unit Number":
          td.textContent = visitor.unitNumber;
          break;
        case "Visitor Name":
          td.textContent = visitor.name;
          break;
        case "isTenant":
          if (visitor.isTenant) {
            td.textContent = "True";
          } else {
            td.textContent = "False";
          }
          break;
        case "Time Group":
          td.textContent = visitor.timeGroupName;
          break;
        case "Access Profile":
          td.textContent = visitor.accessProfileName;
          break;
        case "Gate Code":
          td.textContent = visitor.code;
          break;
        case "Email Address":
          td.textContent = visitor.email;
          break;
        case "Phone Number":
          td.textContent = visitor.mobilePhoneNumber;
          break;
        case "Actions":
          const editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.classList.add("edit-btn");
          editButton.onclick = async function () {
            const visitorInfo = await getVisitor(visitor.id);
            const cells = row.querySelectorAll("td");
            cells[0].textContent = visitorInfo.id;
            cells[1].textContent = visitorInfo.unitNumber;
            cells[2].textContent = visitorInfo.name;
            cells[3].textContent = visitorInfo.isTenant ? "True" : "False";
            cells[4].textContent = visitorInfo.timeGroupName;
            cells[5].textContent = visitorInfo.accessProfileName;
            cells[6].textContent = visitorInfo.code;
            cells[7].textContent = visitorInfo.email;
            cells[8].textContent = visitorInfo.mobilePhoneNumber;
            const index = visitors.findIndex((visitor) => visitor.id === id);
            visitors[index] = visitorInfo;
          };
          td.appendChild(editButton);

          if (!visitor.isTenant) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-btn");
            deleteButton.onclick = function () {
              response = removeGuestVisitor(visitor.id);
              if (response) {
                row.remove();
                hideLoadingSpinner();
              } else {
                console.error("Network request failed:", response.statusText);
                hideLoadingSpinner();
              }
            };
            td.appendChild(deleteButton);
          }

          break;

        default:
          td.textContent = "";
          break;
      }
      row.appendChild(td);
    });

    // Append the row to the tbody
    tbody.appendChild(row);
  });

  visitorsTable.appendChild(tbody);
  visitorsTable.appendChild(thead);
  tableContainer.appendChild(visitorsTable);
  popupContainer.appendChild(tableContainer);

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.classList.add("close-button");
  closeButton.addEventListener("click", function () {
    expanedOpened = false;
    document.body.removeChild(popupContainer);
    document.body.style.overflow = "";
    enableButtons();
    hideLoadingSpinner();
  });

  popupContainer.appendChild(closeButton);

  document.body.appendChild(popupContainer);

  //
  //
  // Guest Visitor Information Autofill Toggle
  //
  //
  const guestAutofillToggle = document.querySelector("#autofillCheckboxModal");
  const enableGuestAutofillMode = () => {
    localStorage.setItem("guestAutofillMode", "enabled");
  };
  const disableGuestAutofillMode = () => {
    localStorage.setItem("guestAutofillMode", null);
  };
  guestAutofillToggle.checked = guestAutofillMode === "enabled";
  guestAutofillToggle.addEventListener("change", () => {
    checkGuestAutofillMode();
  });
  function checkGuestAutofillMode() {
    if (guestAutofillToggle.checked) {
      enableGuestAutofillMode();
    } else {
      disableGuestAutofillMode();
    }
  }
}

//Add Guest Tenant
async function createGuestVisitor(unit, autofill) {
  return new Promise(async (resolve, reject) => {
    if (autofill === "enabled") {
      try {
        var tokenStageKey = "";
        var tokenEnvKey = "";
        if (envKey === "cia-stg-1.aws.") {
          tokenStageKey = "cia-stg-1.aws.";
        } else {
          tokenEnvKey = envKey;
        }
        const response = await fetch(
          `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/visitors`,
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
              accessCode: generateRandomCode(6),
              lastName: "Guest",
              firstName: "Temporary",
              email: "automations@temp.com",
              mobilePhoneNumber: generateRandomCode(10),
              isTenant: false,
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
          const data = await response.json();
          resolve(data.visitor);
        } else {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        alert("Failed to create tenant...");
        hideLoadingSpinner();
        return false;
      }
    } else {
      const popupContainer = document.createElement("div");
      popupContainer.classList.add("addGuestVisitor-popup-container");

      const fNameLabel = document.createElement("label");
      fNameLabel.textContent = "Visitor First Name";
      popupContainer.appendChild(fNameLabel);
      const fNameInput = document.createElement("input");
      fNameInput.classList.add("textInput");
      popupContainer.appendChild(fNameInput);

      const lNameLabel = document.createElement("label");
      lNameLabel.textContent = "Visitor Last Name";
      popupContainer.appendChild(lNameLabel);
      const lNameInput = document.createElement("input");
      lNameInput.classList.add("textInput");
      popupContainer.appendChild(lNameInput);

      const codeLabel = document.createElement("label");
      codeLabel.textContent = "Gate Code";
      popupContainer.appendChild(codeLabel);
      const codeInput = document.createElement("input");
      codeInput.classList.add("textInput");
      popupContainer.appendChild(codeInput);

      const emailLabel = document.createElement("label");
      emailLabel.textContent = "Email Address";
      popupContainer.appendChild(emailLabel);
      const emailInput = document.createElement("input");
      emailInput.classList.add("textInput");
      popupContainer.appendChild(emailInput);

      const phoneLabel = document.createElement("label");
      phoneLabel.textContent = "Phone Number";
      popupContainer.appendChild(phoneLabel);
      const phoneInput = document.createElement("input");
      phoneInput.classList.add("textInput");
      popupContainer.appendChild(phoneInput);

      const timeGroupLabel = document.createElement("label");
      timeGroupLabel.textContent = "Time Group";
      popupContainer.appendChild(timeGroupLabel);
      const timeGroupInput = document.createElement("select");
      timeGroupInput.classList.add("textInput");
      timeProfiles.forEach((profile) => {
        const option = document.createElement("option");
        option.value = profile.id;
        option.textContent = profile.name;
        timeGroupInput.appendChild(option);
      });
      popupContainer.appendChild(timeGroupInput);

      const accessProfileLabel = document.createElement("label");
      accessProfileLabel.textContent = "Access Profile";
      popupContainer.appendChild(accessProfileLabel);
      const accessProfileInput = document.createElement("select");
      accessProfileInput.classList.add("textInput");
      accessProfiles.forEach((profile) => {
        const option = document.createElement("option");
        option.value = profile.id;
        option.textContent = profile.name;
        accessProfileInput.appendChild(option);
      });
      popupContainer.appendChild(accessProfileInput);

      const submitButton = document.createElement("button");
      submitButton.classList.add("guestSubmit");
      submitButton.textContent = "Submit";
      popupContainer.appendChild(submitButton);

      // Create close button
      const closeButton = document.createElement("button");
      closeButton.textContent = "X";
      closeButton.classList.add("close-button");
      closeButton.addEventListener("click", function () {
        expanedOpened = false;
        document.body.removeChild(popupContainer);
        document.body.style.overflow = "";
        enableButtons();
      });

      submitButton.onclick = async function () {
        const fName = fNameInput.value;
        const lName = lNameInput.value;
        const timeGroup = timeGroupInput.value;
        const accessProfile = accessProfileInput.value;
        const code = codeInput.value;
        const email = emailInput.value;
        const phone = phoneInput.value;
        try {
          var tokenStageKey = "";
          var tokenEnvKey = "";
          if (envKey === "cia-stg-1.aws.") {
            tokenStageKey = "cia-stg-1.aws.";
          } else {
            tokenEnvKey = envKey;
          }
          const response = await fetch(
            `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/visitors`,
            {
              method: "POST",
              headers: {
                accept: "application/json",
                "api-version": "2.0",
                Authorization: "Bearer " + bearerToken.access_token,
                "Content-Type": "application/json-patch+json",
              },
              body: JSON.stringify({
                timeGroupId: timeGroup,
                accessProfileId: accessProfile,
                unitId: unit,
                accessCode: code,
                firstName: fName,
                lastName: lName,
                email: email,
                mobilePhoneNumber: phone,
                isTenant: false,
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
            const data = await response.json();
            document.body.removeChild(popupContainer);
            resolve(data.visitor);
          } else {
            throw new Error("Network response was not ok");
          }
        } catch (error) {
          console.error("There was a problem with the fetch operation:", error);
          alert("Failed to create tenant...");
          hideLoadingSpinner();
          return false;
        }
      };

      popupContainer.appendChild(closeButton);

      document.body.appendChild(popupContainer);
    }
  });
}

// Get All Visitors
async function getAllVisitors(unit) {
  try {
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/units/${unit}/visitors`,
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
      return data;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return false;
  }
}

// API Call to send tenant update
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
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/visitors/${visitorID}/update`,
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
      const data = await response.json();
      return data;
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    alert("Failed to update tenant...");
    return false;
  }
}

// Update Tenant Info
async function updateVisitor(info) {
  return new Promise(async (resolve, reject) => {
    if (opened) reject;
    const nameParts = info.name.split(" ");
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
          if (profile.id === info.accessProfileId) {
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
          if (profile.id === info.timeGroupId) {
            option.selected = true;
          }
          input.appendChild(option);
        });
      } else {
        input = document.createElement("input");
        input.setAttribute("type", "text");
        let storedValue =
          info[
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
    submitButton.addEventListener("click", async function () {
      const updatedInfo = {
        firstName: inputs[0].value || nameParts[0],
        lastName: inputs[1].value || nameParts[1],
        email: inputs[2].value || info.email,
        mobilePhoneNumber: inputs[3].value || info.mobilePhoneNumber,
        code: inputs[4].value || info.code,
        accessProfileId: inputs[5].value || info.accessProfileId,
        timeGroupId: inputs[6].value || info.timeGroupId,
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
      const updatedVisitorInfo = await sendUpdateVisitor(
        updatedInfo.firstName,
        updatedInfo.lastName,
        updatedInfo.email,
        updatedInfo.mobilePhoneNumber,
        updatedInfo.code,
        updatedInfo.accessProfileId,
        updatedInfo.timeGroupId,
        info.id
      );
      document.body.removeChild(popupContainer);
      opened = false;
      enableButtons();
      document.body.style.overflow = "";
      resolve(updatedVisitorInfo);
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
  });
}

// Function to get facility time profiles
async function getTimeProfiles() {
  try {
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/timegroups`,
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
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/accessprofiles`,
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

// Function to fetch facility data
async function getFacility() {
  var tokenStageKey = "";
  var tokenEnvKey = "";
  if (envKey === "cia-stg-1.aws.") {
    tokenStageKey = "cia-stg-1.aws.";
  } else {
    tokenEnvKey = envKey;
  }
  fetch(
    `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}`,
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
      facilityElement.href = `https://portal.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facility/${propertyID}/dashboard`;
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
    errText.textContent = "Unable to Fetch Data";
  } else {
    errText.textContent = err;
  }
  errText.classList.remove("hidden");
  errText.classList.add("visible");
  authButton.classList.add("pulsate");
  hideLoadingSpinner();
}

// Function to hide error fetching data
function hideError() {
  var errText = document.getElementById("errText");
  errText.classList.remove("visible");
  errText.classList.add("hidden");
}

// Function to fetch unit list
async function unitList(facilityId) {
  var tokenStageKey = "";
  var tokenEnvKey = "";
  if (envKey === "cia-stg-1.aws.") {
    tokenStageKey = "cia-stg-1.aws.";
  } else {
    tokenEnvKey = envKey;
  }
  fetch(
    `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${facilityId}/units`,
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
    .then(async (data) => {
      data.sort((a, b) => {
        return a.unitNumber.localeCompare(b.unitNumber);
      });
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
    row.style.display = "none";
    var idCell = row.insertCell();
    idCell.textContent = item.id;
    idCell.title = "View visitor information";
    idCell.classList.add("idCell");
    row.insertCell().textContent = item.unitNumber;
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
      visitorDashboard(item.id);
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
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/units`,
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
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/units/${unit}/delete/vacant?suppressCommands=true`,
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
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/visitors`,
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
          accessCode: generateRandomCode(6),
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
      showLoadingSpinner();
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
        var tokenStageKey = "";
        var tokenEnvKey = "";
        if (envKey === "cia-stg-1.aws.") {
          tokenStageKey = "cia-stg-1.aws.";
        } else {
          tokenEnvKey = envKey;
        }
        const response = await fetch(
          `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/visitors`,
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
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/units/${unit}/vacate?suppressCommands=true`,
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
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/units/${unit}/disable?suppressCommands=true`,
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
    var tokenStageKey = "";
    var tokenEnvKey = "";
    if (envKey === "cia-stg-1.aws.") {
      tokenStageKey = "cia-stg-1.aws.";
    } else {
      tokenEnvKey = envKey;
    }
    const response = await fetch(
      `https://accesscontrol.${tokenStageKey}insomniaccia${tokenEnvKey}.com/facilities/${propertyID}/units/${unit}/enable?suppressCommands=true`,
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
    var userInput = prompt("Unit Number(s): sperated by a space", "");
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
  }, 500);
  setTimeout(() => {
    displayLoadDateTime();
    countTableRowsByStatus();
    displayRows();
  }, 500);
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
  if (totalPages) {
    document.getElementById(
      "pageIndicator"
    ).innerText = `${currentPage} of ${totalPages}`;
  } else {
    document.getElementById("pageIndicator").innerText = `${currentPage} of 1`;
  }
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

//
//
//
//
//

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
  const newBearer = await setBearer(
    username,
    password,
    clientID,
    secretID,
    localStorage.getItem("environment") || ""
  );
  bearerToken = newBearer;
  if (newBearer) {
    // Get unit data
    await unitList(propertyID);

    // Get the facility name and display it
    await getFacility();

    // Display the unit table
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await displayData();
    await getAccessProfiles();
    await getTimeProfiles();
    countTableRowsByStatus();

    // Hide loading spinner
    hideLoadingSpinner();

    // Show load date
    displayLoadDateTime();
    displayRows();
  } else {
    showError("Credentials Invalid");
  }
}

/*----------------------------------------------------------------
                        On window load
----------------------------------------------------------------*/
onWebLoad();

//reload the page every 30 minutes in order to refresh the bearer token and validate data
setTimeout(() => {
  location.reload();
}, 1800000);
