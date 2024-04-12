# Property Management Solution Integration with API

This Property Management Software is a user-friendly web application designed to efficiently manage units and tenants within properties within a web based application. Seamlessly integrated with the OpenTech API, this portal empowers property managers to effortlessly create units, add tenants, and change delinquency status. This platform gives the ability to change environments all the way from Production to Development. 

## Table of Contents
- [Technology](#technology)
- [Usage](#usage)
- [Features](#features)

## Technology
- **API/Database:** OpenTech Integration API
- **Codebase:** JavaScipt

## Usage
- **Add/Change Authorization:** Add your property to the portal. Provide necessary details regarding api integration and the rest will be pulled. Curently hard coded.

- **Create Units:** Once properties are pulled up, proceed to create units within each property. Currently it is simplified in the fact that all is needed is the unit number. With the ability to add multiple units at one time.

- **Manage Tenants:** Add tenants to each unit. With each tenant you are able to move out and change the delinquency status of each one.

- **Simple Dashboard:** Dashboard focused at simplicity and support focused use.

## Features
- **Authorization:** The Authorization pop up located in the top right of screen allows for the user to select saved facilities (Currently hard coded) or update it manually given the correct credentials.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWJqbGl2bmd4ODR1ZHAzOTJrd2IzaHRmNzN2dDVmZjBwdDE5M3ZyYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/towZbt81RjQmfd8KRf/giphy.gif" alt="Authorization GIF"></p>

- **Adding units:** The unit pop up located in the top right of the screen allows for the user to input 1 or more units into the website to import in the the selected facility. This includes a success/error handling system that reports shortly after.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzRqYnB4NDd4b2o4Z3FoMTl1aWdrYW9ya3c5d2wwMmdsNjM0MWRhcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yDbLOEWn7dAafexZDn/giphy.gif" alt="Authorization GIF"></p>

- **Updating/deleting unit status:** Each unit that has been rented can be updated in several different ways. You can either change delinquency, move a tenant out, or delete the unit enitrely. 
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3o4a3p1ZWU2a3FhbmE2dWtiYzdkMGF5dHF2emd6NHc2anBvY3JzcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GnIov9rUxVa44lSmIs/giphy.gif" alt="Authorization GIF"></p>

- **Custom tenant addition:** Move in tenants with custom information to ensure the tenants are information is correct.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2xyYzZiZHJqZ3Iwcmg2bnZ6MHhleHg4NDljejNnczAycXkzemZwaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/23ohdvEkTosLWGM5xL/giphy.gif" alt="Authorization GIF"></p>

- **Generated tenant addition:** The ability to autofill tenant information on new move ins incase testing needs to be completed can be done with the tenant autofill toggle.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWd2Y3lidmFkZzJxN2U5Y3B2NjQxeGh2YWh3Y2FxMmhqMTd5dmhvYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OwQ6DXK2lLiliI8Izv/giphy.gif" alt="Authorization GIF"></p>

- **Update existing tenants:** Any unit that has a tenant assigned to it is cappable of being updated. To update click on the unit's id.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXlnN29hZDM0c2ZhMWVlY3UxYmRnb21odTZwNzJlbm5obmZneXI5ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/83xAkiRaZTWHj3mVZ9/giphy.gif" alt="Authorization GIF"></p>

- **Dark mode toggle:** Dark mode is available with a sleek darker design, toggle is located in the navigation bar.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXIxcWc0ZjV1OTB4cWhuOHdoaDczOTc2bWE2bDJtaG9oMTR2Y3BhcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xskkUUTrOYgFDn5Kw3/giphy.gif" alt="Authorization GIF"></p>

- **Automated refresh/Maunual refresh:** Automated refresh of data happens every thirty minutes to enure the bearer token is fresh and any data that could have changed is updated. Manual refreshes can be done with the refresh button in the top left.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGw2Mmk5b2dnbTZnMnoyNHJzcjB5dDJpNWM2YjdlMmRoNDFiZzh6cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/anfPFzjpRkPZ3BO54N/giphy.gif" alt="Authorization GIF"></p>

- **Additional Features:** 
  - **Unit status count:** Located at the top of the page is the count of Rented, Delinquent, Vacant, and grand total of all units tied to the selected facility.
  - **Page responsiveness:** When the page reaches certain stages of size the page correctly removes/resized elements to keep the experience enjoyable.
  - **Facility URL link:** The facility name located in the navigation bar links you directed to the access control page with OpenTech.
