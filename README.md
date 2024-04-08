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

- **Manage Tenants:** Add tenants to each unit. With each tenant you are able to move out and change the delinquency status of each one. Currently using randomized data to ensure data safety.

- **Simple Dashboard:** Dashboard focused at simplicidy and support focused mindsets.

## Features
- **Authorization:** The Authorization pop up located in the top right of screen allows for the user to select saved facilities (Currently hard coded) or update it manually given the correct credentials.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTJ2MTFjdjdsN2E5djZqc3Q1Y3pxM3l2OHIyOGZzbmo3dWh4c2Y2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LxC3yN2zfRrimmrR63/giphy.gif" alt="Authorization GIF"></p>

- **Adding units:** The unit pop up located in the top right of the screen allows for the user to input 1 or more units into the website to import in the the selected facility. This includes a success/error handling system that reports shortly after.
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd21lbHFrN2twbzlvcjdpemhoMHFqeDdqdnhucGloa2Y4em50eDR4cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/owHxqm2hgdmeWg3o9r/giphy.gif" alt="Authorization GIF"></p>

- **Updating unit/tenants:** Each unit that has been imported can be updated in several different ways. You can either rent out the unit, change delinquency, move a tenant out, or delete the unit enitrely. 
<p align="center"><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExemducWp0dzY1MWd5dGkzZHlpbDZsdjJ6b243bW1vanI3NG5qZTFtbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mE5viriLuzu8KXplLA/giphy.gif" alt="Authorization GIF"></p>
