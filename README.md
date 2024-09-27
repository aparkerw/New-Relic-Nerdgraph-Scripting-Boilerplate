# NerdGraph Automation Script Boilerplate

## Overview

The purpose of this project is to provide a template to easily allow the rapid creation of scripts to programmatically manage New Relic account data.  By abstracting Nerdgraph API calls, New Relic account teams and New Relic customers can quickly achieve account and data management objectives.

This code can be found on [Github here](https://github.com/aparkerw/New-Relic-Nerdgraph-Scripting-Boilerplate)


### Description

The **NodeJS** script in `app.js` will use the environment variables for access and will be able to use the baseline functions in `services/NerdGraphService.js` to pefrom mutation operation, load accounts for iterative execution, etc.

In `app.js` you will see 3 examples from which you can build upon:

1. loading and iterating across all accounts the user key has access to

```
  let accounts = await NerdGraphService.getAccounts();

  for(let account of accounts) {
    // do something
  }
```

2. performing a simple nerdgraph query within each account

```
    const accountId = account.id;
    let ingest = await NerdGraphService.runNRQL('SELECT sum(usage) AS CCU FROM NrComputUsage SINCE 1 day ago', [accountId])
    console.log(`the ingest was ${ingest.CCU} in the last day`);
```

3. performing a mutation

```
    await NerdGraphService.updateSyntheticPrivateLocation(guid, privateLocationGuid);
```

### Defining your own functions

There are two steps to defining a new function for your purpose.

You can make your new function in `NerdGraphService.js` or you can abstract out into a new file and make use of the `makeCall()` function.

In your function you should define your GraphQL message, most of which you can copy/paste from the NerdGraph Explorer app in the New Relic UI.

For example:
```
var graphql = { query: `{
    actor {
      accounts {
        id
        name
      }
    }
  }`, variables: null };
  let response = await makeCall(graphql);
```

Secondly, you just need to extract the data out from the response, it will align to the structure you provided during the query.

For the above you would use:

```
return resp?.data?.data?.actor?.accounts;
```

### Running the script

#### Setup Node

To run this script you will need to have **NodeJS** and **npm** installed on the system.

Update the application dependencies by calling `npm install` from within the `GraphQL` folder.

#### Setup Your Env and User Key

Create a `.env` file by running:

```
cp .env.template .env
```

Inside place define your key for the application to pick up (see `.env.template`) it will look like:

```
NR_API_KEY="NRAK-???????"
```

Once everything is installed and your `.env` fils is defined, you can run the following command root directory to run your app:


```
node app.js
```


Done all at once you can run:

```
npm install
cp .env.template .env
nano .env # to edit with your key
node app.js
```
