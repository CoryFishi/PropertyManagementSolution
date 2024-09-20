function downloadCSV(csv, filename) {
  let csvFile;
  let downloadLink;
  csvFile = new Blob([csv], { type: "text/csv" });
  downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}
async function exportJSONToCSV(filename) {
  showLoadingSpinner();
  jsonData = await getVisitors();
  jsonData.sort((a, b) => {
    if (a.unitNumber === null) return -1;
    if (b.unitNumber === null) return 1;
    return a.unitNumber.localeCompare(b.unitNumber);
  });
  var csv =
    "id,unitNumber,isTenant,name,code,email,mobilePhoneNumber,accessProfile,timeGroup,isLockedOut\n"; // Column headers
  jsonData.forEach(function (row) {
    if (!row.isPortalVisitor) {
      csv += `${row.id},${row.unitNumber},${row.isTenant},${row.name},${row.code},${row.email},${row.mobilePhoneNumber},${row.accessProfileName},${row.timeGroupName},${row.isLockedOut}\n`;
    }
  });
  downloadCSV(csv, filename);
  hideLoadingSpinner();
}

async function getVisitors() {
  try {
    const response = await fetch(
      `https://accesscontrol.insomniaccia${envKey}.com/facilities/${propertyID}/visitors`,
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

function readCSVFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result;
    parseCSV(text);
  };
  reader.readAsText(file);
}
// Curently this is not detecting differences correctly as the variable types are not being pull correctly. However this still works.
async function parseCSV(csvText) {
  showLoadingSpinner();
  const lines = csvText.trim().split("\n");
  const result = [];
  const headers = lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(",");
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  const json = JSON.stringify(result);
  let json1 = JSON.parse(json);
  let json2 = await getVisitors();
  let json3 = [];
  json2.forEach(function (row) {
    if (row.isTenant === true) {
      let newObj = {
        id: row.id,
        unitNumber: row.unitNumber,
        name: row.name,
        code: row.code,
        email: row.email,
        mobilePhoneNumber: row.mobilePhoneNumber,
        accessProfilePmsIdentifier: row.accessProfilePmsIdentifier,
        timeGroupPmsIdentifier: row.timeGroupPmsIdentifier,
        isLockedOut: row.isLockedOut,
      };
      json3.push(newObj);
    }
  });
  findDifferences(json1, json3);
}
function findDifferences(json2, json1) {
  const results = [];
  json1.forEach((item1) => {
    json2.forEach((item2) => {
      if (item1.unitNumber === item2.unitNumber) {
        const fullComparison = {
          item1: {},
          item2: {},
        };
        let hasDifferences = false;
        Object.keys(item1).forEach((key) => {
          fullComparison.item1[key] = item1[key];
          fullComparison.item2[key] = item2[key];
          if (item1[key] !== item2[key] && key !== "unitNumber") {
            hasDifferences = true;
          }
        });
        if (hasDifferences) {
          results.push({
            unitNumber: item1.unitNumber,
            Details: fullComparison,
          });
        }
      }
    });
  });
  results.forEach((item) => {
    const nameParts = item.Details.item2.name.split(" ");
    updateVisitorImport(
      nameParts[0],
      nameParts[1],
      item.Details.item2.email,
      item.Details.item2.mobilePhoneNumber,
      item.Details.item2.code,
      item.Details.item2.id
    );
  });
  refreshTable();
  hideLoadingSpinner();
  return results;
}

async function updateVisitorImport(
  fname,
  lname,
  email,
  phone,
  code,
  visitorID
) {
  try {
    const response = await fetch(
      `https://accesscontrol.insomniaccia${envKey}.com/facilities/${propertyID}/visitors/${visitorID}/update`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (await bearerToken.access_token),
          accept: "application/json",
          "api-version": "2.0",
          "Content-Type": "application/json-patch+json",
        },
        body: `{\n  "accessCode": "${code}",\n  "lastName": "${lname}",\n  "firstName": "${fname}",\n  "email": "${email}",\n  "mobilePhoneNumber": "${phone}",\n  "suppressCommands": true\n}`,
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
    return false;
  }
}
