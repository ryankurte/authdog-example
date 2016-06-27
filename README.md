# AuthDog Example

A simple example application to demonstrate the use of [AuthDog](ryankurte/authdog) for U2F registration and signing.  

All data is stored non-persistently against your session.  

## Usage

1. `git clone git@github.com:ryankurte/authdog-example.git` to checkout this repo
2. `cd authdog-example` to change into the correct directory
3. `npm install` to fetch dependencies
4. `./gencerts.sh fakeCA fakeName fakeOrg certs/` to generate a self signed tls cert
5. `node index.js` to run the server
6. `navigate to `https://localhost:9000` to try out the (terrible) interface

